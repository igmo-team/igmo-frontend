/**
 * 최소 STOMP 프레임 encode/decode 유틸.
 *
 * STOMP 텍스트 프레임 구조:
 *   COMMAND\n
 *   header:value\n
 *   ...\n
 *   \n
 *   <body>\0
 *
 * 하트비트는 단독 개행(`\n`) 문자다.
 */

export const NULL = '\0';
export const HEARTBEAT = '\n';

export type StompFrame = {
  command: string;
  headers: Record<string, string>;
  body: string;
};

/**
 * 수신 버퍼를 파싱해 완성된 프레임 목록과 남은(미완성) 버퍼를 반환한다.
 * 프레임 사이/앞의 하트비트 개행은 조용히 건너뛴다.
 */
export function decodeFrames(buffer: string): {
  frames: StompFrame[];
  rest: string;
} {
  const frames: StompFrame[] = [];
  let rest = buffer;

  for (;;) {
    // 선행 하트비트(개행) 제거
    let start = 0;
    while (
      start < rest.length &&
      (rest[start] === '\n' || rest[start] === '\r')
    ) {
      start += 1;
    }
    if (start > 0) {
      rest = rest.slice(start);
    }

    const nullIndex = rest.indexOf(NULL);
    if (nullIndex === -1) {
      break;
    }

    const rawFrame = rest.slice(0, nullIndex);
    rest = rest.slice(nullIndex + 1);
    frames.push(parseFrame(rawFrame));
  }

  return { frames, rest };
}

function parseFrame(raw: string): StompFrame {
  const normalized = raw.replace(/\r\n/g, '\n');
  const separatorIndex = normalized.indexOf('\n\n');

  const head =
    separatorIndex === -1 ? normalized : normalized.slice(0, separatorIndex);
  const body =
    separatorIndex === -1 ? '' : normalized.slice(separatorIndex + 2);

  const lines = head.split('\n');
  const command = lines.shift() ?? '';
  const headers: Record<string, string> = {};

  for (const line of lines) {
    if (!line) {
      continue;
    }
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      continue;
    }
    const key = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1);
    // 최초로 등장한 헤더 값을 우선한다(STOMP 규약).
    if (!(key in headers)) {
      headers[key] = value;
    }
  }

  return { command, headers, body };
}

/** 서버→클라이언트로 보낼 STOMP 프레임 문자열을 만든다. */
export function encodeFrame({
  command,
  headers = {},
  body = '',
}: {
  command: string;
  headers?: Record<string, string>;
  body?: string;
}): string {
  const headerLines = Object.entries(headers)
    .map(([key, value]) => `${key}:${value}`)
    .join('\n');

  return `${command}\n${headerLines}${headerLines ? '\n' : ''}\n${body}${NULL}`;
}

/** UTF-8 바이트 길이(content-length 헤더용). Node/브라우저 공통 TextEncoder 사용. */
export function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}
