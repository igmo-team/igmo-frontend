import {
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const TOUCH_FOCUS_MOVE_THRESHOLD = 8;

type ScrollPoint = {
  x: number;
  y: number;
};

export function useMobileInputScrollLock() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollPointRef = useRef<ScrollPoint | null>(null);
  const touchFocusStartPointRef = useRef<{ x: number; y: number } | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const saveScrollPoint = useCallback(() => {
    scrollPointRef.current = {
      x: window.scrollX,
      y: window.scrollY,
    };
  }, []);

  const restoreScrollPoint = useCallback(() => {
    const scrollPoint = scrollPointRef.current;

    if (!scrollPoint) {
      return;
    }

    if (window.scrollX !== scrollPoint.x || window.scrollY !== scrollPoint.y) {
      window.scrollTo(scrollPoint.x, scrollPoint.y);
    }
  }, []);

  useEffect(() => {
    if (!isInputFocused) {
      return;
    }

    const visualViewport = window.visualViewport;

    restoreScrollPoint();
    visualViewport?.addEventListener('resize', restoreScrollPoint);
    visualViewport?.addEventListener('scroll', restoreScrollPoint);
    window.addEventListener('resize', restoreScrollPoint);
    window.addEventListener('scroll', restoreScrollPoint, { passive: true });

    return () => {
      visualViewport?.removeEventListener('resize', restoreScrollPoint);
      visualViewport?.removeEventListener('scroll', restoreScrollPoint);
      window.removeEventListener('resize', restoreScrollPoint);
      window.removeEventListener('scroll', restoreScrollPoint);
    };
  }, [isInputFocused, restoreScrollPoint]);

  const handleInputBlur = () => {
    scrollPointRef.current = null;
    touchFocusStartPointRef.current = null;
    setIsInputFocused(false);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

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
    saveScrollPoint();
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
