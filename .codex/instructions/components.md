# 컴포넌트 작성 규칙

## 파일 템플릿

새 컴포넌트는 아래 뼈대를 그대로 복사해서 채운다. 구조를 새로 발명하지 않는다.

```tsx
// 1) import: react → 외부 라이브러리 → 내부 (eslint import/order가 강제)
import { useState } from 'react';

import styled from '@emotion/styled';
import { useMutation } from '@tanstack/react-query';

import { Button } from '../../../common/components';
import postGames from '../apis/postGames';

// 2) 타입 (import type 사용 — eslint가 강제)
type RoomEntryFormProps = {
  onEntered: (roomCode: string) => void;
};

// 3) 컴포넌트 — 내부 선언 순서는 아래 주석 순서를 따른다
export default function RoomEntryForm({ onEntered }: RoomEntryFormProps) {
  // ① 라이브러리 훅 (useNavigate, useParams 등)
  // ② 상태 (useState, useRef)
  // ③ 쿼리/뮤테이션 (useMutation, useQuery)
  // ④ 파생 값 · 이름 붙인 조건 (const isJoinMode = ...)
  // ⑤ 이벤트 핸들러 (handleXxx)
  // ⑥ useEffect
  // ⑦ early return → JSX
  return <S_Form>...</S_Form>;
}

// 4) styled 컴포넌트는 파일 하단
const S_Form = styled.form`
  width: 100%;
`;
```

## 한 파일 한 컴포넌트

- 한 파일에는 컴포넌트 함수를 **1개만** 둔다.
- `S_` styled 컴포넌트는 컴포넌트로 세지 않는다. 같은 파일 하단에 몇 개든 둘 수 있다.
- JSX를 반환하는 헬퍼 함수(`renderXxx`)도 두 번째 컴포넌트다. 만들지 말고 파일을 분리한다.

## export 규칙

- export가 **1개면 `default`**, 여러 개면 named export.
- `common/components`는 default export + `index.ts` barrel 재수출을 유지한다:
  ```ts
  export { default as Button } from './Button';
  ```
- 기존 named export 페이지(`RoomPage` 등)는 이 규칙과 어긋나지만 **수정하지 않는다.** 신규 파일부터 적용한다.

## 선언 순서

템플릿의 ①~⑦ 순서를 지킨다. "관련된 상태와 핸들러를 가까이 두고 싶다"는 이유로 순서를 섞지 않는다.

관련 코드끼리 묶고 싶을 만큼 컴포넌트가 커졌다면, 순서를 깨는 대신 **커스텀 훅으로 추출**한다. 추출 기준: 서로 얽힌 "상태 + 핸들러" 묶음이 3개 이상이면 각 묶음을 훅(`useRoomEntry` 등)으로 뺀다. 훅은 해당 페이지의 `hooks/`에 둔다.

## 추상화 레벨

- 페이지 컴포넌트(`*Page.tsx`)는 **조립만** 한다: 섹션 수준 컴포넌트 배치 + 라우팅/페이지 상태 연결.
- 페이지 컴포넌트의 JSX에 원시 태그(`div`, `span`, `p` 등)로만 이뤄진 블록이 **5줄 이상 연속**되면 이름 붙은 컴포넌트로 분리한다.
- 단, 분리한 컴포넌트의 역할을 **한 문장으로 설명할 수 없으면 분리하지 않는다.** `Container2`, `InnerWrapper` 같은 이름밖에 안 나오면 분리하지 않는 게 맞다.
- 한 컴포넌트의 JSX 안에서 고수준 컴포넌트(`<RoomEntryForm />`)와 긴 원시 마크업이 섞이면 원시 마크업 쪽을 분리한다.
- props가 7개를 넘으면 분리 경계가 잘못됐을 가능성이 높다. 사용자와 상의한다.

## 이벤트 핸들러

- 컴포넌트 내부 함수는 `handle` + 대상 + 동작: `handleSubmit`, `handleNicknameChange`, `handleJoinModeButtonClick`.
- props로 받는 콜백은 `on` + 대상 + 동작: `onCopyButtonClick`, `onStart`.
- 매개변수 이름은 **`e`** 로 쓴다. 타입은 자동완성으로 나오는 React 합성 이벤트 타입을 그대로 쓴다:

```tsx
// ✅
const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setNickname(e.target.value);
};

// ❌ event로 풀어 쓰거나, 네이티브 Event 타입을 쓰지 않는다
const onChangeNickname = (event: Event) => { ... };
```

- 인라인 콜백에서는 타입 명시 없이 `(e) =>` 추론에 맡긴다.

## 기타

- 매직 넘버·문자열은 코로케이션된 `constants/`에 이름 붙여 둔다. (예: `pages/room/constants/`)
- `console.log`를 남기지 않는다. `console.warn` / `console.error`만 허용 (eslint 규칙).
- 타입만 가져올 땐 `import type`을 쓴다 (eslint `consistent-type-imports`가 error로 강제).

## 커밋 전 체크리스트

- [ ] 새 파일마다 컴포넌트가 1개뿐인가? (`renderXxx` 헬퍼 없음)
- [ ] 컴포넌트 내부가 ①~⑦ 순서를 따르는가?
- [ ] 핸들러 네이밍이 내부 `handleXxx` / props `onXxx` / 매개변수 `e`인가?
- [ ] `*Page.tsx`에 5줄 이상 연속된 원시 마크업 블록이 없는가?
- [ ] export 규칙(1개면 default)을 지켰는가?
