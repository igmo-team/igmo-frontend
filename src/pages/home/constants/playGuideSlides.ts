import playGuideImage01 from '../../../assets/images/play-guide-01.png';
import playGuideImage02 from '../../../assets/images/play-guide-02.png';
import playGuideImage03 from '../../../assets/images/play-guide-03.png';
import playGuideImage04 from '../../../assets/images/play-guide-04.jpg';
import playGuideImage05 from '../../../assets/images/play-guide-05.jpg';
import playGuideImage06 from '../../../assets/images/play-guide-06.jpg';

import type { PlayGuideSlideData } from '../types/playGuide';

export const PLAY_GUIDE_COMPACT_MEDIA_QUERY = '(max-width: 60rem)';

export const PLAY_GUIDE_SLIDES: PlayGuideSlideData[] = [
  {
    image: playGuideImage01,
    imageAlt: '친구들과 방에 입장하는 화면',
    mainText: '친구들과 방에 입장해요',
    subText: '방을 만들고 초대 링크를 공유하면 친구들이 바로 참여할 수 있어요.',
  },
  {
    image: playGuideImage02,
    imageAlt: 'AI에게 문장을 입력하는 화면',
    mainText: 'AI에게 문장을 써 주세요',
    subText: '각자 떠오르는 장면을 한 문장으로 입력하면 AI가 그림을 그려요.',
  },
  {
    image: playGuideImage03,
    imageAlt: 'AI가 생성한 그림을 확인하는 화면',
    mainText: 'AI가 그림을 그려요',
    subText: '내가 쓴 문장이 어떤 그림으로 완성됐는지 확인해 보세요.',
  },
  {
    image: playGuideImage04,
    imageAlt: '그림을 보고 가짜 문장을 작성하는 화면',
    mainText: '진짜 같은 가짜 문장을 만들어요',
    subText:
      '그림을 보고, 정답처럼 보이는 가짜 문장을 적어 친구들을 속여 보세요.',
  },
  {
    image: playGuideImage05,
    imageAlt: '진짜 문장에 투표하는 화면',
    mainText: '진짜 문장에 투표해요',
    subText: '여러 문장 중 AI에게 처음 입력된 진짜 문장 하나를 골라 주세요.',
  },
  {
    image: playGuideImage06,
    imageAlt: '정답 공개와 점수를 확인하는 화면',
    mainText: '정답을 공개하고 점수를 확인해요',
    subText: '누가 정답을 맞혔는지, 누가 친구들을 잘 속였는지 확인해 보세요.',
  },
];
