import type { ComponentPropsWithRef } from 'react';

import styled from '@emotion/styled';

import type { Theme } from '@emotion/react';

type SurfaceTone = 'default' | 'success' | 'accent';
type SurfacePadding = 'sm' | 'md' | 'lg';

type SurfaceProps = ComponentPropsWithRef<'div'> & {
  tone?: SurfaceTone;
  padding?: SurfacePadding;
  shadow?: boolean;
};

function Surface({
  tone = 'default',
  padding = 'md',
  shadow = false,
  ...rest
}: SurfaceProps) {
  return <S_Surface tone={tone} padding={padding} shadow={shadow} {...rest} />;
}

export default Surface;

const PADDING = {
  sm: '1.6rem',
  md: '2rem',
  lg: '2.4rem',
};

const borderColor = (theme: Theme): Record<SurfaceTone, string> => ({
  default: theme.COLOR.LINE,
  success: theme.COLOR.SUCCESS,
  accent: theme.COLOR.PRIMARY500,
});

const S_Surface = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'tone' && prop !== 'padding' && prop !== 'shadow',
})<{ tone: SurfaceTone; padding: SurfacePadding; shadow: boolean }>`
  width: 100%;
  padding: ${({ padding }) => PADDING[padding]};
  background: ${({ theme }) => theme.COLOR.WHITE};
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-color: ${({ theme, tone }) => borderColor(theme)[tone]};
  border-radius: ${({ theme }) => theme.RADIUS.LG};
  box-shadow: ${({ theme, shadow }) =>
    shadow ? theme.SHADOW.SURFACE : 'none'};
`;
