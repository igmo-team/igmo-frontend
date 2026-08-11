# 폴더 구조: pages / domain / common

이 프로젝트는 `src/pages`, `src/domain`, `src/common` 세 영역으로 코드를 구분한다.

| 영역     | 역할                                   | 한 줄 판별                                          |
| -------- | -------------------------------------- | --------------------------------------------------- |
| `pages`  | 라우트 단위 화면 조립 + 화면 전용 코드 | 그 페이지를 지우면 같이 지워질 코드                 |
| `domain` | 서비스 핵심 개념(비즈니스)의 home      | 이해하려면 우리 기획 용어를 알아야 하는 재사용 코드 |
| `common` | 비즈니스를 모르는 범용 기반 코드       | 어느 서비스에 갖다 놔도 그대로 쓸 수 있는 코드      |

## 새 코드는 어디에? — 결정 트리

위에서부터 순서대로 묻고, **첫 YES에서 멈춘다.**

1. **지금 한 페이지에서만 쓰는가?** → `pages/<페이지>/` 하위에 둔다. (components/ hooks/ apis/ utils/ constants/)
2. **이름에 서비스 기획 용어(방·게임·플레이어·투표·점수·프롬프트 등)가 들어가고, 2곳 이상에서 쓰는가?** → `domain/<개념>/`에 둔다.
3. **어느 서비스에 갖다 놔도 그대로 쓸 수 있는가?** (Button, client, shuffle 같은 것) → `common/`에 둔다.
4. **어디에도 확신이 없는가?** → `pages`에 둔다. 두 번째 사용처가 실제로 생길 때 올린다.

중복 가능성이 있다는 이유만으로 미리 domain이나 common으로 올리지 않는다. 기본값은 항상 `pages`다.

## pages

특정 페이지에서만 쓰는 컴포넌트, 훅, API 함수, 화면 전용 로직은 해당 페이지 폴더 안에 둔다. API 함수가 두 번째 페이지에서도 필요해지면 다른 페이지의 `apis`를 import하지 말고 `domain/<개념>/apis/`로 옮긴다.

```
pages/
  home/
    HomePage.tsx
    components/  RoomEntryForm.tsx
    apis/        postGames.ts
    utils/       roomEntryValidation.ts
  room/
    RoomPage.tsx
    components/  hooks/  constants/  utils/
```

## domain

`domain`은 "공통 코드 모음"이 아니라 **비즈니스 개념의 home**이다. 아래 5개 질문 중 **3개 이상 YES면 domain**에 둔다.

1. 특정 페이지가 아니라 서비스의 핵심 개념을 표현하는가?
2. 이해하려면 우리 서비스의 기획 용어를 알아야 하는가?
3. 2개 이상의 페이지·API·훅에서 재사용되는가?
4. 특정 페이지를 삭제해도 이 코드는 남아야 하는가?
5. 이 개념이 타입 → API → 훅 → 컴포넌트로 확장될 가능성이 있는가?

✅ 예: `RoomSnapshot` 타입은 방 화면·방 생성 API·방 참여 API에서 쓰이고, 플레이어 목록·방장·준비 상태라는 서비스 개념을 표현한다. → `domain/room/types.ts`

```tsx
// pages/home/apis/postGames.ts
import type { RoomSnapshot } from '../../../domain/room/types';
```

domain에 두는 것 / 두지 않는 것:

| domain에 둔다                                   | domain에 두지 않는다 (→ 위치)            |
| ----------------------------------------------- | ---------------------------------------- |
| 비즈니스 명사 타입: `RoomSnapshot`, `GamePhase` | 특정 페이지의 UI 상태 (→ pages)          |
| 도메인 규칙: 닉네임 길이, 방 코드 포맷          | 특정 페이지 전용 API 함수 (→ pages/apis) |
| 여러 페이지에서 쓰는 도메인 API 함수            | Button 같은 UI primitive (→ common)      |
| 순수 함수: `isHost(playerId, snapshot)`         | axios client 같은 기술 인프라 (→ common) |
| phase enum, 점수 계산                           |                                          |

domain 안의 파일명은 형식이 아니라 **개념**으로 짓는다. `utils.ts`·`helpers.ts` 금지. 파일이 커지면 `roomCode.ts`, `nickname.ts`처럼 개념 단위로 나눈다. `constants.ts`, `validators.ts` 같은 파일은 실제 중복이 2곳 이상 생겼을 때만 만든다.

도메인 API 함수는 `domain/<개념>/apis/`에 둔다. 예를 들어 방 생성·방 참여처럼 room 도메인에 속하고 여러 페이지에서 쓰는 API는 `domain/room/apis/`에 둔다. 도메인 API도 HTTP 요청 규칙은 [api.md](api.md)를 따른다.

## common

서비스 기획 용어를 몰라도 이해되는 코드만 둔다.

```
common/
  components/  Button, Input, Surface, LogoMark (+ index.ts barrel)
  api/         client.ts
  constants/   pageUrl.ts
  socket/      createStompClient.ts
  styles/      theme.ts, reset.ts
  types/       theme.d.ts
```

❌ `RoomSnapshot`, `GamePhase`, `VoteOption`, `PlayerScore`를 common에 두는 것은 위반이다. 서비스 기획 용어가 이름에 들어가면 common이 아니다.

## import 방향

```
pages → domain → common
```

- `pages`는 `domain`과 `common`을 import할 수 있다.
- `domain`은 `common`만 import할 수 있다.
- `common`은 `domain`·`pages`를 import하지 않는다.
- `domain`끼리의 직접 import는 하지 않는다. 필요해 보이면 도메인 경계가 잘못 나뉜 것인지 먼저 재검토하고, 불명확하면 사용자에게 물어본다.
- 페이지끼리의 import(`pages/a` → `pages/b`)는 위반이다. 공유 API도 다른 페이지의 `apis`에서 빌려 쓰지 말고 `domain/<개념>/apis/`로 승격한다.

위반 자가 점검 (결과가 나오면 위반):

```bash
grep -rn "from '.*domain\|from '.*pages" src/common
grep -rn "from '.*pages" src/domain
find src/pages -mindepth 1 -maxdepth 1 -type d | while read -r page_dir; do page_name=${page_dir##*/}; git diff --name-only -- src/pages | grep -v "^${page_dir}/" | xargs grep -HnE "from ['\"](\\.\\./)+${page_name}(/|['\"])" 2>/dev/null; done
```

## 커밋 전 체크리스트

- [ ] 새로 만든 파일마다 결정 트리를 통과시켰는가? (확신 없으면 pages)
- [ ] domain/common에 새 파일을 올렸다면 실제 사용처가 2곳 이상인가?
- [ ] 위의 import 방향 점검 명령이 아무것도 출력하지 않는가?
- [ ] domain에 `utils.ts` 같은 형식 기반 파일명을 만들지 않았는가?
