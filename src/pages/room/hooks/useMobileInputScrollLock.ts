import {
  type TouchEvent as ReactTouchEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

const TOUCH_FOCUS_MOVE_THRESHOLD = 8;
const KEYBOARD_DISMISS_DRAG_THRESHOLD = 10;

export function useMobileInputScrollLock() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const touchFocusStartPointRef = useRef<{ x: number; y: number } | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    if (!isInputFocused) {
      return;
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let shouldDismissKeyboardOnDrag = false;

    const handleDocumentTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      const eventTarget = event.target;
      const inputElement = inputRef.current;

      if (!touch || !inputElement || !(eventTarget instanceof Node)) {
        shouldDismissKeyboardOnDrag = false;
        return;
      }

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      shouldDismissKeyboardOnDrag = !inputElement.contains(eventTarget);
    };

    const handleDocumentTouchMove = (event: TouchEvent) => {
      if (!shouldDismissKeyboardOnDrag) {
        return;
      }

      event.preventDefault();

      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      const dragDistanceX = Math.abs(touch.clientX - touchStartX);
      const dragDistanceY = Math.abs(touch.clientY - touchStartY);

      if (
        dragDistanceY < KEYBOARD_DISMISS_DRAG_THRESHOLD ||
        dragDistanceY < dragDistanceX
      ) {
        return;
      }

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      shouldDismissKeyboardOnDrag = false;
    };

    document.addEventListener('touchstart', handleDocumentTouchStart, {
      passive: true,
    });
    document.addEventListener('touchmove', handleDocumentTouchMove, {
      passive: false,
    });

    return () => {
      document.removeEventListener('touchstart', handleDocumentTouchStart);
      document.removeEventListener('touchmove', handleDocumentTouchMove);
    };
  }, [isInputFocused]);

  const handleInputBlur = () => {
    touchFocusStartPointRef.current = null;
    setIsInputFocused(false);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputTouchEnd = (
    e: ReactTouchEvent<HTMLTextAreaElement>,
  ) => {
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

  const handleInputTouchStart = (
    e: ReactTouchEvent<HTMLTextAreaElement>,
  ) => {
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
    handleInputBlur,
    handleInputFocus,
    handleInputTouchEnd,
    handleInputTouchStart,
  };
}
