# 코드 품질 4원칙 (토스 프론트엔드 펀더먼털)

좋은 코드의 기준은 **가독성 · 예측 가능성 · 응집도 · 결합도** 4가지다. 넷을 동시에 만족하기는 어렵다. 각 원칙을 "코드를 다 쓴 뒤 자문하는 예/아니오 질문"으로 쓴다. NO여야 하는 질문에 YES가 나오면 고친다.

## 1. 가독성 — 읽는 사람이 고려할 맥락이 적은가

- [ ] 이 함수를 이해하는 데 이 파일 밖의 맥락이 2개 이상 필요한가? → YES면 구현 상세를 추상화하거나 함수를 쪼갠다.
- [ ] 한 함수 안에 서로 다른 종류의 로직(검증 + 요청 + 화면 전환)이 섞여 있는가? → YES면 로직 종류별로 쪼갠다.
- [ ] 이름 없는 복잡한 조건식(`&&`/`||` 3개 이상)이 있는가? → YES면 `const isJoinMode = ...`처럼 이름을 붙인다.
- [ ] 이름 없는 매직 넘버·문자열이 있는가? → YES면 상수로 뺀다.
- [ ] 삼항 연산자가 중첩됐는가? → eslint error다. if로 푼다.
- [ ] 코드를 위에서 아래로 읽을 때 시점이 위아래로 튀는가? → YES면 선언 순서를 재배치한다.

## 2. 예측 가능성 — 이름만 보고 동작을 맞출 수 있는가

- [ ] 함수 이름과 파라미터·반환 타입만 보고 동작을 맞출 수 있는가? → NO면 이름을 다시 짓는다.
- [ ] 이름에 없는 숨은 동작(로깅, 상태 변경, 사이드 이펙트)이 안에 있는가? → YES면 드러내거나 분리한다.
- [ ] 같은 종류의 함수들(예: 검증 함수들)이 서로 다른 형태의 값을 반환하는가? → YES면 반환 타입을 통일한다. (예: `getXxxErrorMessage`는 항상 `string | null`)
- [ ] 라이브러리 함수와 같은 이름의 래퍼를 만들었는가? → YES면 이름을 구분한다.

## 3. 응집도 — 같이 수정될 코드가 같이 있는가

- [ ] 이 값을 바꿀 때 같이 바꿔야 할 코드가 다른 디렉토리에 있는가? → YES면 같은 곳으로 모은다. (같이 수정되는 파일은 같은 디렉토리에 — 코로케이션)
- [ ] 같은 의미의 값이 두 곳에 따로 정의되어 있는가? → YES면 상수/함수 하나로 모은다.
- [ ] 폼의 한 필드를 고치면 다른 필드 로직도 건드려야 하는 구조인가? → YES면 필드 단위로 응집시킨다.

## 4. 결합도 — 수정의 영향 범위가 좁은가

- [ ] 이 수정의 영향 범위를 한 문장으로 말할 수 있는가? → NO면 책임이 섞여 있다. 하나씩 분리한다.
- [ ] 하나의 훅/함수가 여러 화면의 서로 다른 책임을 동시에 지는가? → YES면 쪼갠다.
- [ ] props가 여러 단계를 그냥 통과만 하고 있는가(Props Drilling)? → YES면 조합(composition)으로 구조를 바꾼다.

## 원칙이 충돌할 때 — 우선순위 규칙

**공통화(추상화)는 기본적으로 하지 않는다.** 아래 하나로 판정한다:

- 두 코드가 **같이 수정되지 않으면 버그가 나는가?** → YES: 응집도 우선. 공통화한다.
- NO (우연히 모양만 같음) → 가독성·결합도 우선. **중복을 허용한다.**

약한 확신으로 공통화하지 않는다. "나중에 중복될 것 같아서"는 공통화 사유가 아니다 (→ [folder-structure.md](folder-structure.md)의 기본값: pages에 두기).

## 원문 (심화 참조)

- 가독성: [같이 실행되지 않는 코드 분리](https://frontend-fundamentals.com/code-quality/code/examples/submit-button.html) · [구현 상세 추상화](https://frontend-fundamentals.com/code-quality/code/examples/login-start-page.html) · [로직 종류로 쪼개기](https://frontend-fundamentals.com/code-quality/code/examples/use-page-state-readability.html) · [조건에 이름 붙이기](https://frontend-fundamentals.com/code-quality/code/examples/condition-name.html) · [매직 넘버](https://frontend-fundamentals.com/code-quality/code/examples/magic-number-readability.html) · [시점 이동 줄이기](https://frontend-fundamentals.com/code-quality/code/examples/user-policy.html) · [삼항 연산자](https://frontend-fundamentals.com/code-quality/code/examples/ternary-operator.html)
- 예측 가능성: [이름 겹치지 않게](https://frontend-fundamentals.com/code-quality/code/examples/http.html) · [반환 타입 통일](https://frontend-fundamentals.com/code-quality/code/examples/use-user.html) · [숨은 로직 드러내기](https://frontend-fundamentals.com/code-quality/code/examples/hidden-logic.html)
- 응집도: [같은 디렉토리에 두기](https://frontend-fundamentals.com/code-quality/code/examples/code-directory.html) · [매직 넘버 없애기](https://frontend-fundamentals.com/code-quality/code/examples/magic-number-cohesion.html) · [폼의 응집도](https://frontend-fundamentals.com/code-quality/code/examples/form-fields.html)
- 결합도: [책임 하나씩](https://frontend-fundamentals.com/code-quality/code/examples/use-page-state-coupling.html) · [중복 허용](https://frontend-fundamentals.com/code-quality/code/examples/use-bottom-sheet.html) · [Props Drilling 지우기](https://frontend-fundamentals.com/code-quality/code/examples/item-edit-modal.html)
