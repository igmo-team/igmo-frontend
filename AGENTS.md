# AGENTS.md

igmo — "이 그림, 모지?" AI가 그린 그림 추리 파티게임의 프론트엔드.

## 기술 스택 (오인 주의)

| 기술                             | 주의                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| React 19 + TypeScript + Vite     | 테스트 러너 없음 — **테스트 파일을 만들지 않는다**                                      |
| Emotion (`@emotion/styled`)      | **styled-components 아님.** import 경로를 틀리지 않는다                                 |
| TanStack Query v5                | 모든 HTTP 요청이 이걸 통한다 ([.codex/instructions/api.md](.codex/instructions/api.md)) |
| react-router-dom v7              | TanStack Router 아님                                                                    |
| axios (`common/api/client` 래퍼) | axios 직접 import 금지 (`isAxiosError` 제외)                                            |
| @stomp/stompjs                   | 실시간 통신 (WebSocket/STOMP)                                                           |

경로 alias 없음 — 전부 상대경로 import.

## 명령어

| 명령어                 | 언제                               |
| ---------------------- | ---------------------------------- |
| `npm run typecheck`    | 의미 있는 코드 수정 단위마다       |
| `npm run lint`         | 기능 구현 완료 시                  |
| `npm run build`        | 빌드·번들·라우팅·환경 설정 변경 시 |
| `npm run format:check` | 문서·스타일·포맷 영향 변경 시      |
| `npm run dev`          | UI 변경 확인                       |

## 필수 워크플로우

1. 코드 동작을 수정한 의미 있는 단위마다 `npm run typecheck`를 실행한다.
2. 기능 구현이 완성되면 `npm run lint`를 실행한다.
3. 아래 라우팅 테이블에서 수정한 파일에 해당하는 문서의 **"커밋 전 체크리스트"를 실행한다.**
4. 작업 종류에 맞는 검증을 실행하고, 실행한 명령과 결과를 완료 보고에 적는다. 실행하지 않은 검증이 있으면 이유를 적는다. ([.codex/instructions/verification.md](.codex/instructions/verification.md))

## 문서 라우팅 테이블

작업 시작 전, 만들거나 수정할 파일 경로에 해당하는 문서를 **먼저 읽는다.** 여러 행에 걸리면 전부 읽는다.

| 수정/생성하는 파일                                  | 먼저 읽을 문서                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 새 파일·폴더를 만들 때 (위치 결정)                  | [.codex/instructions/folder-structure.md](.codex/instructions/folder-structure.md) |
| `*.tsx` 컴포넌트                                    | [.codex/instructions/components.md](.codex/instructions/components.md)             |
| styled 컴포넌트 · 스타일 · `theme.ts`               | [.codex/instructions/styling.md](.codex/instructions/styling.md)                   |
| `pages/*/apis/**` · `useMutation`/`useQuery` 사용부 | [.codex/instructions/api.md](.codex/instructions/api.md)                           |
| 리팩토링 · 공통화 판단                              | [.codex/instructions/code-quality.md](.codex/instructions/code-quality.md)         |
| 작업 마무리 · 검증                                  | [.codex/instructions/verification.md](.codex/instructions/verification.md)         |

## 절대 금지

1. **새 라이브러리를 설치하지 않는다.** 필요하면 먼저 사용자에게 물어본다.
2. **TanStack Query를 우회한 HTTP 요청을 하지 않는다.** STOMP publish/subscribe는 제외한다. HTTP 예외가 필요하면 구현 전에 사용자에게 물어본다.
3. **THEME 밖의 색상값·폰트 속성을 하드코딩하지 않는다.** 새 토큰 정책이 필요하면 사용자에게 물어본다.
4. **한 파일에 컴포넌트를 2개 이상 두지 않는다.** (`S_` styled는 제외)
5. **테스트 파일을 만들지 않는다.** (테스트 러너 미도입)

## 커밋 컨벤션

- 커밋 메시지: `타입: 한국어 설명` — 타입은 `feat` / `fix` / `refactor` / `style` (예: `feat: 프롬프트 입력 화면 구현`)
- 브랜치: `feature/<이슈번호>-<설명>` (예: `feature/31-prompt-input-view-ui`)

## 리뷰 가이드라인

- 모든 리뷰 코멘트는 한국어로 작성한다.
- 완료 판단 전에 4단계로 확인한다: 정확성 → 프로젝트 규칙 → React 상태/effect → UX 상태.
- 모든 코멘트 앞에 심각도 라벨을 붙인다: `🔴` 필수 수정, `🟡` 선택 제안, `💬` 질문·가정 확인.
- `.codex/instructions/*.md` 위반은 객관적 지적 대상이며, "개인 취향"으로 취급하지 않는다.
- 이 프로젝트에는 테스트 러너가 없으므로 테스트 파일을 요청하지 않는다. 대신 검증 증거를 요청한다.
- ESLint/Prettier/tsc가 실제로 보고하는 포맷·import 순서·미사용 import는 코멘트하지 않는다.
- 변경 내용이 100줄을 넘는데 구체적인 코멘트가 2개 미만이면 다시 확인하되, 약한 코멘트를 억지로 만들지 않는다.
- 자세한 리뷰 기준은 `.codex/code_review.md`를 읽는다.
