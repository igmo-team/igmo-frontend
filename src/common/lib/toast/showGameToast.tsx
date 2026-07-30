import { toast } from 'sonner';

import { GameToast } from '../../components';

import type { GameToastProps } from '../../components/GameToast';

const GAME_TOAST_DURATION_MS = 2400;

export function showGameToast(message: GameToastProps) {
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
    },
  );
}
