import { toast } from 'sonner';

import { GameToast } from '../../components';

import type { GameToastProps } from '../../components/GameToast';

const GAME_TOAST_DURATION_MS = 2400;
const GAME_TOAST_ID = 'game-toast';

type ShowGameToastOptions = GameToastProps & {
  onAutoClose?: () => void;
};

export function showGameToast({
  onAutoClose,
  ...message
}: ShowGameToastOptions) {
  return toast.custom(
    () => (
      <GameToast
        variant={message.variant}
        icon={message.icon}
        title={message.title}
        body={message.body}
      />
    ),
    {
      duration: GAME_TOAST_DURATION_MS,
      id: GAME_TOAST_ID,
      onAutoClose,
    },
  );
}
