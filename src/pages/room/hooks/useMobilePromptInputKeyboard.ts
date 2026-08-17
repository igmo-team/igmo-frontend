import { type TouchEvent, useEffect, useRef, useState } from 'react';

const MOBILE_PROMPT_INPUT_BOTTOM_PROPERTY = '--mobile-composer-bottom';
const KEYBOARD_DISMISS_DRAG_THRESHOLD = 10;
const TOUCH_FOCUS_MOVE_THRESHOLD = 8;

function getVisualViewportBottomOffset() {
  const visualViewport = window.visualViewport;

  if (!visualViewport) {
    return 0;
  }

  return Math.max(0, window.innerHeight - visualViewport.height);
}

export function useMobilePromptInputKeyboard() {
  const promptInputGroupRef = useRef<HTMLFormElement>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const touchFocusStartPointRef = useRef<{ x: number; y: number } | null>(null);
  const [isPromptInputFocused, setIsPromptInputFocused] = useState(false);

  useEffect(() => {
    const promptInputGroupElement = promptInputGroupRef.current;

    if (!promptInputGroupElement) {
      return;
    }

    if (!isPromptInputFocused) {
      promptInputGroupElement.style.removeProperty(
        MOBILE_PROMPT_INPUT_BOTTOM_PROPERTY,
      );
      return;
    }

    const visualViewport = window.visualViewport;
    const updatePromptInputBottom = () => {
      const bottomOffset = getVisualViewportBottomOffset();

      promptInputGroupElement.style.setProperty(
        MOBILE_PROMPT_INPUT_BOTTOM_PROPERTY,
        `${Math.ceil(bottomOffset)}px`,
      );
    };

    updatePromptInputBottom();
    visualViewport?.addEventListener('resize', updatePromptInputBottom);
    visualViewport?.addEventListener('scroll', updatePromptInputBottom);
    window.addEventListener('resize', updatePromptInputBottom);

    return () => {
      visualViewport?.removeEventListener('resize', updatePromptInputBottom);
      visualViewport?.removeEventListener('scroll', updatePromptInputBottom);
      window.removeEventListener('resize', updatePromptInputBottom);
      promptInputGroupElement.style.removeProperty(
        MOBILE_PROMPT_INPUT_BOTTOM_PROPERTY,
      );
    };
  }, [isPromptInputFocused]);

  useEffect(() => {
    const promptInputGroupElement = promptInputGroupRef.current;

    if (!promptInputGroupElement || !isPromptInputFocused) {
      return;
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let shouldDismissKeyboardOnDrag = false;

    const handleDocumentTouchStart = (event: globalThis.TouchEvent) => {
      const touch = event.touches[0];
      const eventTarget = event.target;

      if (!touch || !(eventTarget instanceof Node)) {
        shouldDismissKeyboardOnDrag = false;
        return;
      }

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      shouldDismissKeyboardOnDrag =
        !promptInputGroupElement.contains(eventTarget);
    };

    const handleDocumentTouchMove = (event: globalThis.TouchEvent) => {
      if (!shouldDismissKeyboardOnDrag) {
        return;
      }

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
      passive: true,
    });

    return () => {
      document.removeEventListener('touchstart', handleDocumentTouchStart);
      document.removeEventListener('touchmove', handleDocumentTouchMove);
    };
  }, [isPromptInputFocused]);

  const handlePromptInputBlur = () => {
    touchFocusStartPointRef.current = null;
    setIsPromptInputFocused(false);
  };

  const handlePromptInputFocus = () => {
    setIsPromptInputFocused(true);
  };

  const handlePromptInputTouchEnd = (
    e: TouchEvent<HTMLTextAreaElement>,
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

    promptTextareaRef.current?.focus({ preventScroll: true });
  };

  const handlePromptInputTouchStart = (
    e: TouchEvent<HTMLTextAreaElement>,
  ) => {
    const promptTextareaElement = promptTextareaRef.current;
    const touch = e.touches[0];

    if (
      !touch ||
      !promptTextareaElement ||
      document.activeElement === promptTextareaElement
    ) {
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
    promptInputGroupRef,
    promptTextareaRef,
    handlePromptInputBlur,
    handlePromptInputFocus,
    handlePromptInputTouchEnd,
    handlePromptInputTouchStart,
  };
}
