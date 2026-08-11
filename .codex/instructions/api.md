# API 레이어 규칙

## 철칙

**모든 HTTP 요청은 TanStack Query(`useMutation`/`useQuery`)를 통한다.**

- 컴포넌트나 핸들러 안에서 HTTP 요청용 `fetch`, `axios`, `client.post`를 직접 호출하는 것은 **위반**이다.
- STOMP publish/subscribe는 이 문서의 HTTP API 규칙 대상이 아니다.
- HTTP 예외가 필요해 보이는 상황(예: 프리사인드 URL로 S3에 직접 업로드)이 오면 **구현하지 말고 먼저 사용자에게 물어본다.** 사용자가 예외로 인정한 경우에만 Query 밖에서 처리한다.

## API 함수 위치

API 함수 위치는 사용 범위로 정한다.

- 특정 페이지에서만 쓰는 API 함수는 `pages/<페이지>/apis/`에 둔다.
- 여러 페이지에서 쓰는 도메인 API 함수는 `domain/<개념>/apis/`에 둔다.
- 한 페이지 전용 API를 다른 페이지에서도 쓰게 되면 페이지끼리 import하지 말고 `domain/<개념>/apis/`로 옮긴다.
- `common`에는 서비스 기획 용어가 들어간 API 함수를 두지 않는다. `common/api/client` 같은 기술 인프라만 둔다.

## 새 API 만들기 = 아래 예시를 복사해서 이름만 바꾸기

새 API를 추가할 때 구조를 새로 설계하지 않는다. 아래 실제 코드 쌍을 복사해서 URL·타입·이름·위치만 바꾸는 것부터 시작한다.

### 1. API 함수 — 사용 범위에 맞는 `apis/`에 파일 하나

[src/pages/home/apis/postGames.ts](../../src/pages/home/apis/postGames.ts) 전문:

```ts
import client from '../../../common/api/client';

import type { RoomSnapshot } from '../../../domain/room/types';

type PostGamesRequest = {
  nickname: string;
};

type PostGamesResponse = {
  roomCode: string;
  playerId: string;
  secret: string;
  snapshot: RoomSnapshot;
};

export default function postGames(data: PostGamesRequest) {
  return client.post<PostGamesResponse, PostGamesRequest>({
    url: '/games',
    data,
  });
}
```

규칙:

- 반드시 `common/api/client` 래퍼를 쓴다. axios를 직접 import하지 않는다 (`isAxiosError` 제외).
- `Request`/`Response` 타입을 함수 위에 정의하고 제네릭 두 개를 모두 명시한다.
- default export, 파일 하나에 API 함수 하나.
- 위치는 사용 범위에 맞춘다. 페이지 전용이면 `pages/<페이지>/apis/`, 여러 페이지에서 쓰는 도메인 API면 `domain/<개념>/apis/`다.

### 2. 호출부 — `useMutation` + `onSuccess`/`onError`

[src/pages/home/components/RoomEntryForm.tsx](../../src/pages/home/components/RoomEntryForm.tsx) 기반:

```tsx
const { mutate: createGame, isPending: isCreateGamePending } = useMutation({
  mutationFn: postGames,
  onSuccess: ({ roomCode, playerId, secret, snapshot }) => {
    navigate(`${PAGE_URL.ROOM}/${roomCode}`, {
      state: { playerId, secret, snapshot },
    });
  },
  onError: (error) => {
    if (isAxiosError<ErrorResponse>(error)) {
      setErrorMessage(
        error.response?.data.message ??
          '방을 만들지 못했어요. 다시 시도해주세요.',
      );
      return;
    }

    setErrorMessage('방을 만들지 못했어요. 다시 시도해주세요.');
  },
});
```

규칙:

- 성공/실패 처리는 **`onSuccess` / `onError` 콜백**으로 한다.
- `mutate`는 구조 분해로 의미 있는 이름을 붙인다: `mutate: createGame`, `isPending: isCreateGamePending`.
- 로딩 상태는 `isPending`을 쓴다. 별도 `useState`로 로딩을 만들지 않는다.

❌ 위반 — `mutateAsync` + try/catch:

```tsx
const { mutateAsync } = useMutation({ mutationFn: postGames });

const handleSubmit = async () => {
  try {
    const result = await mutateAsync({ nickname });
    navigate(...);
  } catch (error) { ... }
};
```

## 에러 처리 패턴

HTTP 에러 메시지는 `isAxiosError<ErrorResponse>` 타입 가드로 꺼내고, 없으면 한국어 폴백 메시지를 쓴다 (위 `onError` 예시 그대로). `error.message`를 사용자에게 그대로 노출하지 않는다.

```ts
type ErrorResponse = {
  message?: string;
};
```

## 네이밍: HTTP 메서드 + 리소스

API 함수 이름은 `HTTP 메서드 + 리소스 경로`로 짓는다. 동작을 묘사하는 동사를 쓰지 않는다.

| ✅                 | ❌                      |
| ------------------ | ----------------------- |
| `postGames`        | `createGame`            |
| `postGamePlayer`   | `joinGame`              |
| `getRoomSnapshot`  | `fetchRoom`, `loadRoom` |
| `deleteGamePlayer` | `leaveRoom`             |

## env

- 환경 변수는 `VITE_` prefix만 클라이언트에 노출된다.
- 필수 env는 `client.ts`처럼 모듈 로드 시점에 없으면 즉시 `throw`한다. 조용히 기본값으로 대체하지 않는다.

## useQuery (아직 없음)

현재 코드베이스에는 `useQuery`가 없다. 첫 `useQuery`를 도입할 때 queryKey 컨벤션을 사용자와 정한 뒤 이 문서에 추가한다. 임의로 정하지 않는다.

## 커밋 전 체크리스트

- [ ] 컴포넌트/훅/핸들러에서 HTTP 요청용 `client.*`나 axios를 직접 호출한 곳이 없는가? (`useMutation`의 `mutationFn` 제외)
- [ ] 새 API 함수가 사용 범위에 맞는 `apis/`에 있고, 이름이 `메서드+리소스`인가?
- [ ] 여러 페이지에서 쓰는 API를 다른 페이지의 `pages/*/apis`에서 import하지 않는가?
- [ ] `onSuccess`/`onError`로 처리했는가? (`mutateAsync` + try/catch 없음)
- [ ] 에러 메시지에 한국어 폴백이 있는가?
