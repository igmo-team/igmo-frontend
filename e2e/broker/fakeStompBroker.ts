import { byteLength, decodeFrames, encodeFrame, HEARTBEAT } from './stompFrames';

import type { StompFrame } from './stompFrames';
import type { BrowserContext, Page, WebSocketRoute } from '@playwright/test';

/** 클라가 보낸 SEND 프레임 기록(assertion용). */
export type SentFrame = {
  destination: string;
  body: string;
  headers: Record<string, string>;
};

/** 브로커가 topic으로 보내는 프레임 body 형태: { type, payload }. */
export type TopicMessage = {
  type: string;
  payload: unknown;
};

type Connection = {
  playerId: string | null;
  route: WebSocketRoute;
  /** subscriptionId -> destination */
  subscriptions: Map<string, string>;
  buffer: string;
  heartbeat: ReturnType<typeof setInterval> | null;
  closed: boolean;
};

const SERVER_HEARTBEAT_INTERVAL_MS = 1000;

/**
 * Node 프로세스 안에서 도는 가짜 STOMP 브로커(싱글턴처럼 하나만 만들어 여러 컨텍스트에 attach).
 * routeWebSocket 핸들러가 전부 이 인스턴스를 참조하므로 컨텍스트 간 fan-out이 실제로 일어난다.
 */
export class FakeStompBroker {
  private readonly allConnections = new Set<Connection>();
  private readonly connectionsByPlayer = new Map<string, Connection>();
  /** roomCode -> 마지막으로 push된 topic 스냅샷(재구독 시 replay). */
  private readonly topicSnapshots = new Map<string, TopicMessage>();
  /** 재연결 테스트에서 room-state 응답 경로만 검증할 수 있도록 제어한다. */
  private topicReplayEnabled = true;
  private readonly inboxByPlayer = new Map<string, SentFrame[]>();
  /** 재접속을 막을 playerId 집합(끊김 상태를 안정적으로 관찰하기 위함). */
  private readonly blockedPlayers = new Set<string>();
  private messageIdCounter = 0;

  /** Page 또는 BrowserContext에 '**\/ws' WebSocket 라우팅을 건다. */
  async attach(target: Page | BrowserContext): Promise<void> {
    await target.routeWebSocket('**/ws', (ws) => {
      this.handleConnection(ws);
    });
  }

  private handleConnection(route: WebSocketRoute): void {
    const connection: Connection = {
      playerId: null,
      route,
      subscriptions: new Map(),
      buffer: '',
      heartbeat: null,
      closed: false,
    };
    this.allConnections.add(connection);

    route.onMessage((data) => {
      const chunk = typeof data === 'string' ? data : data.toString();
      connection.buffer += chunk;
      const { frames, rest } = decodeFrames(connection.buffer);
      connection.buffer = rest;
      for (const frame of frames) {
        this.handleFrame(connection, frame);
      }
    });

    route.onClose(() => {
      this.cleanupConnection(connection);
    });
  }

  private handleFrame(connection: Connection, frame: StompFrame): void {
    switch (frame.command) {
      case 'CONNECT':
      case 'STOMP':
        this.handleConnect(connection, frame);
        return;
      case 'SUBSCRIBE':
        this.handleSubscribe(connection, frame);
        return;
      case 'SEND':
        this.handleSend(connection, frame);
        return;
      case 'UNSUBSCRIBE':
        connection.subscriptions.delete(frame.headers.id ?? '');
        return;
      case 'DISCONNECT':
        // receipt 요구 시 응답 후 close. 여기서는 단순 close.
        connection.route.close();
        return;
      default:
        return;
    }
  }

  private handleConnect(connection: Connection, frame: StompFrame): void {
    const playerId = frame.headers.playerId ?? null;
    connection.playerId = playerId;

    // 재접속 차단 상태면 핸드셰이크 없이 즉시 닫아 클라를 계속 끊김으로 유지.
    if (playerId && this.blockedPlayers.has(playerId)) {
      connection.route.close();
      return;
    }

    if (playerId) {
      // 재접속: 같은 playerId의 이전 커넥션은 교체된다.
      this.connectionsByPlayer.set(playerId, connection);
    }

    connection.route.send(
      encodeFrame({
        command: 'CONNECTED',
        headers: {
          version: '1.2',
          'heart-beat': `${SERVER_HEARTBEAT_INTERVAL_MS},${SERVER_HEARTBEAT_INTERVAL_MS}`,
        },
      }),
    );

    // 하트비트 송신 시작(안 보내면 클라가 tolerance 초과로 끊김 판정).
    connection.heartbeat = setInterval(() => {
      if (connection.closed) {
        return;
      }
      try {
        connection.route.send(HEARTBEAT);
      } catch {
        // route.close()와 onClose(closed=true) 사이 틈에 interval이 돌면
        // 이미 닫힌 route로 send하게 되어 throw할 수 있다. 무시한다.
      }
    }, SERVER_HEARTBEAT_INTERVAL_MS);
  }

  private handleSubscribe(connection: Connection, frame: StompFrame): void {
    const id = frame.headers.id;
    const destination = frame.headers.destination;
    if (!id || !destination) {
      return;
    }

    connection.subscriptions.set(id, destination);

    // topic 재구독 시 저장된 현재 스냅샷을 즉시 replay(재접속 복원 메커니즘).
    const roomCode = parseTopicRoomCode(destination);
    if (roomCode && this.topicReplayEnabled) {
      const snapshot = this.topicSnapshots.get(roomCode);
      if (snapshot) {
        this.sendMessage(connection, id, destination, JSON.stringify(snapshot));
      }
    }

    const receiptId = frame.headers.receipt;
    if (receiptId) {
      connection.route.send(
        encodeFrame({
          command: 'RECEIPT',
          headers: { 'receipt-id': receiptId },
        }),
      );
    }
  }

  private handleSend(connection: Connection, frame: StompFrame): void {
    const destination = frame.headers.destination;
    if (!destination || !connection.playerId) {
      return;
    }

    const inbox = this.inboxByPlayer.get(connection.playerId) ?? [];
    inbox.push({ destination, body: frame.body, headers: frame.headers });
    this.inboxByPlayer.set(connection.playerId, inbox);

    const roomCode = parseSyncRoomCode(destination);
    if (roomCode) {
      const snapshot = this.topicSnapshots.get(roomCode);
      if (snapshot) {
        this.pushUserQueue(
          connection.playerId,
          '/user/queue/room-state',
          snapshot,
        );
      }
    }
  }

  private sendMessage(
    connection: Connection,
    subscriptionId: string,
    destination: string,
    body: string,
  ): void {
    if (connection.closed) {
      return;
    }

    this.messageIdCounter += 1;
    try {
      connection.route.send(
        encodeFrame({
          command: 'MESSAGE',
          headers: {
            subscription: subscriptionId,
            'message-id': `msg-${this.messageIdCounter}`,
            destination,
            'content-type': 'application/json',
            'content-length': String(byteLength(body)),
          },
          body,
        }),
      );
    } catch {
      // 닫히는 중인 route면 send가 throw할 수 있어 무시한다.
    }
  }

  private cleanupConnection(connection: Connection): void {
    if (connection.heartbeat) {
      clearInterval(connection.heartbeat);
      connection.heartbeat = null;
    }
    connection.closed = true;
    this.allConnections.delete(connection);

    if (
      connection.playerId &&
      this.connectionsByPlayer.get(connection.playerId) === connection
    ) {
      this.connectionsByPlayer.delete(connection.playerId);
    }
  }

  // ---------------------------------------------------------------------------
  // control API (테스트가 호출)
  // ---------------------------------------------------------------------------

  /**
   * roomCode를 구독한 모든 연결에 topic 프레임을 fan-out하고,
   * "현재 스냅샷"으로 저장한다(재구독 replay용).
   */
  pushTopic(roomCode: string, message: TopicMessage): void {
    this.topicSnapshots.set(roomCode, message);
    const destination = `/topic/rooms/${roomCode}`;
    const body = JSON.stringify(message);

    for (const connection of this.allConnections) {
      for (const [subId, dest] of connection.subscriptions) {
        if (dest === destination) {
          this.sendMessage(connection, subId, destination, body);
        }
      }
    }
  }

  /**
   * topic 구독자에게 "가공하지 않은" 임의 body를 그대로 보낸다.
   * 잘못된 JSON 등 견고성(robustness) 테스트용 — 현재 스냅샷으로 저장하지 않는다.
   */
  pushRawTopic(roomCode: string, rawBody: string): void {
    const destination = `/topic/rooms/${roomCode}`;
    for (const connection of this.allConnections) {
      for (const [subId, dest] of connection.subscriptions) {
        if (dest === destination) {
          this.sendMessage(connection, subId, destination, rawBody);
        }
      }
    }
  }

  /** 특정 playerId 연결의 user-queue 구독에만 bare 객체를 보낸다. */
  pushUserQueue(
    playerId: string,
    destination: string,
    body: unknown,
  ): void {
    const connection = this.connectionsByPlayer.get(playerId);
    if (!connection) {
      return;
    }

    const serialized = JSON.stringify(body);
    for (const [subId, dest] of connection.subscriptions) {
      if (dest === destination) {
        this.sendMessage(connection, subId, destination, serialized);
      }
    }
  }

  /**
   * 특정 playerId 연결의 WS를 닫는다(끊김 시뮬).
   * `blockReconnect: true`면 이후 재접속 시도도 즉시 거부해 끊김 상태를 안정적으로 유지한다.
   * (reconnectDelay가 짧아 자동재연결이 곧바로 성공하는 걸 막아 끊김 UI를 관찰 가능하게 함.)
   */
  close(playerId: string, options: { blockReconnect?: boolean } = {}): void {
    if (options.blockReconnect) {
      this.blockedPlayers.add(playerId);
    }
    const connection = this.connectionsByPlayer.get(playerId);
    if (connection) {
      connection.route.close();
    }
  }

  /** close(playerId, { blockReconnect: true })로 막아둔 재접속을 다시 허용한다. */
  allowReconnect(playerId: string): void {
    this.blockedPlayers.delete(playerId);
  }

  /** topic 재구독 replay를 끄거나 켠다. */
  setTopicReplayEnabled(enabled: boolean): void {
    this.topicReplayEnabled = enabled;
  }

  /** 현재 CONNECT된 playerId 목록. */
  connections(): string[] {
    return [...this.connectionsByPlayer.keys()];
  }

  /** 특정 playerId 연결이 보낸 SEND 프레임 목록. */
  inbox(playerId: string): SentFrame[] {
    return this.inboxByPlayer.get(playerId) ?? [];
  }

  /** 저장된 topic 스냅샷/인박스 등 상태 초기화(테스트 간 격리). 연결은 건드리지 않는다. */
  reset(): void {
    this.topicSnapshots.clear();
    this.inboxByPlayer.clear();
    this.messageIdCounter = 0;
    this.topicReplayEnabled = true;
  }
}

function parseTopicRoomCode(destination: string): string | null {
  const match = /^\/topic\/rooms\/(.+)$/.exec(destination);
  return match ? match[1] : null;
}

function parseSyncRoomCode(destination: string): string | null {
  const match = /^\/app\/rooms\/(.+)\/sync$/.exec(destination);
  return match ? match[1] : null;
}
