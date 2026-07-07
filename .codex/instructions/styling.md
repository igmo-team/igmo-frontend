# 스타일링: Emotion + THEME

이 프로젝트는 **Emotion**(`@emotion/styled`)을 쓴다. styled-components가 아니다. 모든 디자인 토큰은 [src/common/styles/theme.ts](../../src/common/styles/theme.ts)의 `THEME` 객체에 있고, `props.theme`으로 접근한다.

## 규칙 1: 색상은 THEME에서만

❌ 위반 — hex 하드코딩:

```tsx
const S_Title = styled.h1`
  color: #ff3fbe;
`;
```

✅ 올바름:

```tsx
const S_Title = styled.h1`
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
`;
```

필요한 색이 `THEME.COLOR`에 없으면 **hex를 하드코딩하지 않는다.** 기존 의미에 맞는 토큰이 없고 새 의미를 추가해야 하면 사용자에게 확인한 뒤 `THEME`를 확장한다. 테마는 필요할 때만 확장한다(demand-driven).

## 규칙 2: 타이포그래피는 TYPOGRAPHY 스프레드로

`THEME.TYPOGRAPHY`의 각 키(`TITLE1~4`, `B1~B6`의 `_R/_B`, `LABEL1~4`, `BUTTON1~3`, `LOGO`, `DISPLAY`)는 font-family·size·weight·line-height가 묶인 css 블록이다. 통째로 스프레드해서 쓴다.

❌ 위반 — 폰트 속성 직접 선언:

```tsx
const S_Label = styled.label`
  font-family: 'Pretendard', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
`;
```

✅ 올바름:

```tsx
const S_Label = styled.label`
  ${({ theme }) => theme.TYPOGRAPHY.LABEL1}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
`;
```

## 규칙 3: 중복 스타일 금지

TYPOGRAPHY를 스프레드한 블록에서 `font-family`, `font-size`, `font-weight`, `line-height`를 다시 선언하지 않는다. 상위 컴포넌트에서 이미 적용된 속성을 하위에서 같은 값으로 재선언하지 않는다.

❌ 위반 — 스프레드 후 재선언:

```tsx
const S_Message = styled.p`
  ${({ theme }) => theme.TYPOGRAPHY.B5_R}
  font-size: 1.3rem; /* B5_R에 이미 들어 있음 */
`;
```

크기가 달라서 덮어쓰고 싶다면 그 크기에 맞는 다른 TYPOGRAPHY 키를 쓴다. 맞는 키가 없고 새 타이포그래피 의미가 필요하면 사용자에게 확인한 뒤 토큰을 추가한다.

## 규칙 4: styled 컴포넌트 작성 패턴

- 이름은 `S_` prefix: `S_Button`, `S_FormCard`.
- styled 정의는 **파일 하단**(컴포넌트 함수 아래)에 둔다.
- 크기 단위는 `rem`을 쓴다. `px`를 쓰지 않는다.
- 공통 컴포넌트를 확장할 땐 `styled(Surface)` 형태로 감싼다.
- DOM으로 새지 않아야 할 커스텀 prop은 `shouldForwardProp`으로 거른다:

```tsx
const S_Button = styled('button', {
  shouldForwardProp: (prop) => !['variant', 'size', 'width'].includes(prop),
})<Required<Pick<ButtonProps, 'variant' | 'size' | 'width'>>>`
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
`;
```

- border·radius·shadow도 색상과 마찬가지로 `THEME.BORDER`, `THEME.RADIUS`, `THEME.SHADOW`에서 가져온다.

## 규칙 5: 공통 컴포넌트 variant 확장

`common/components`의 Button은 `variant / size / width` 3축 API를 쓴다. 스타일이 다른 버튼이 필요할 때 새 버튼 컴포넌트를 만들지 말고 기존 3축으로 표현되는지 먼저 확인한다. 새 variant가 필요하면 기존 3축으로 표현할 수 없는 이유를 정리하고 사용자에게 물어본다.

## 자가 점검 (grep)

**내가 이번 작업에서 추가한 코드**에 아래가 걸리면 위반이다:

```bash
git diff -- src ':!src/common/styles/theme.ts' | grep -nE "^\+.*(font-family:|font-size:|font-weight:)"
git diff -- src ':!src/common/styles/theme.ts' | grep -nE "^\+.*#[0-9A-Fa-f]{3,6}\b"
```

참고: 기존 코드에 위반이 남아 있다(`pages/room`의 font-family 직접 선언 2곳, `avatarColors.ts`의 hex). **이 패턴을 따라 하지 않는다.** 기존 위반 정리는 별도 작업이다.

## 커밋 전 체크리스트

- [ ] 위 grep 2개가 내 diff에서 아무것도 출력하지 않는가?
- [ ] 새로 만든 styled 컴포넌트가 전부 `S_` prefix이고 파일 하단에 있는가?
- [ ] `px` 단위를 쓰지 않았는가?
- [ ] THEME에 없는 토큰이 필요해서 임의로 추가한 것이 없는가? (있으면 커밋 전에 사용자에게 확인)
