import { css } from '@emotion/react';

export const THEME = {
  COLOR: {
    BACKGROUND: '#FBE9FF',
    WHITE: '#FFFFFF',
    PINK50: '#FFF3FC',

    TEXT: '#1B1130',
    TEXT_SUBTLE: '#7A6A92',
    LINE: '#1B1130',

    PRIMARY100: '#FFF0FA',
    PRIMARY200: '#FFD6F2',
    PRIMARY300: '#FF9ADE',
    PRIMARY400: '#FF68CD',
    PRIMARY500: '#FF3FBE',
    PRIMARY600: '#E62EAA',
    PRIMARY700: '#C81F91',

    SECONDARY: '#22C9DD',
    LAVENDER: '#C8B6FF',
    PERIWINKLE: '#9AA0FF',

    SUCCESS: '#2BB673',
    DANGER: '#FF4D6D',
  },

  TYPOGRAPHY: {
    LOGO: css`
      font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 4.6rem;
      line-height: 1;
    `,

    DISPLAY: css`
      font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 4.2rem;
      line-height: 1.1;
    `,

    TITLE1: css`
      font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 2.8rem;
      line-height: 1.2;
    `,

    TITLE2: css`
      font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 2.4rem;
      line-height: 1.2;
    `,

    TITLE3: css`
      font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 2.2rem;
      line-height: 1.2;
    `,

    TITLE4: css`
      font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1.8rem;
      line-height: 1.2;
    `,

    BODY1: css`
      font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1.6rem;
      font-weight: 600;
      line-height: 1.5;
    `,

    BODY2: css`
      font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.5;
    `,

    BODY3: css`
      font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1.4rem;
      font-weight: 600;
      line-height: 1.5;
    `,

    BODY4: css`
      font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1.3rem;
      font-weight: 600;
      line-height: 1.5;
    `,

    BODY5: css`
      font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1.2rem;
      font-weight: 600;
      line-height: 1.5;
    `,

    BODY6: css`
      font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      line-height: 1.5;
    `,

    LABEL1: css`
      font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1.2rem;
      font-weight: 700;
      line-height: 1.4;
    `,

    LABEL2: css`
      font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      line-height: 1.4;
    `,

    LABEL3: css`
      font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1rem;
      font-weight: 800;
      line-height: 1.4;
    `,

    LABEL4: css`
      font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 0.9rem;
      font-weight: 800;
      line-height: 1.4;
    `,

    BUTTON1: css`
      font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 2rem;
      line-height: 1;
    `,

    BUTTON2: css`
      font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1.9rem;
      line-height: 1;
    `,

    BUTTON3: css`
      font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
      font-size: 1.8rem;
      line-height: 1;
    `,
  },

  BORDER: {
    DEFAULT: '0.25rem solid #1B1130',
    THIN: '0.2rem solid #1B1130',
  },

  RADIUS: {
    SM: '1.1rem',
    MD: '1.6rem',
    LG: '1.8rem',
    IMAGE: '2.2rem',
    PILL: '999px',
  },

  SHADOW: {
    BUTTON: '0 0.5rem 0 #1B1130',
    SURFACE: '0 0.6rem 0 #1B1130',
  },
} as const;
