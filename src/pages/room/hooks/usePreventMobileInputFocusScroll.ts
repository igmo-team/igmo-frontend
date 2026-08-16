import { type TouchEvent, useRef } from 'react';

const TOUCH_FOCUS_MOVE_THRESHOLD = 8;

export function usePreventMobileInputFocusScroll() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const touchFocusStartPointRef = useRef<{ x: number; y: number } | null>(null);

  const handleInputTouchEnd = (e: TouchEvent<HTMLTextAreaElement>) => {
    const touchStartPoint = touchFocusStartPointRef.current;
    const changedTouch = e.changedTouches[0];

    touchFocusStartPointRef.current = null;

    if (!touchStartPoint || !changedTouch) {
      return;
    }

    const touchMoveDistanceX = Math.abs(
      changedTouch.clientX - touchStartPoint.x,
    );
    const touchMoveDistanceY = Math.abs(
      changedTouch.clientY - touchStartPoint.y,
    );

    if (
      touchMoveDistanceX > TOUCH_FOCUS_MOVE_THRESHOLD ||
      touchMoveDistanceY > TOUCH_FOCUS_MOVE_THRESHOLD
    ) {
      return;
    }

    inputRef.current?.focus({ preventScroll: true });
  };

  const handleInputTouchStart = (e: TouchEvent<HTMLTextAreaElement>) => {
    const inputElement = inputRef.current;
    const touch = e.touches[0];

    if (!touch || !inputElement || document.activeElement === inputElement) {
      touchFocusStartPointRef.current = null;
      return;
    }

    e.preventDefault();
    touchFocusStartPointRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  return {
    inputRef,
    handleInputTouchEnd,
    handleInputTouchStart,
  };
}
