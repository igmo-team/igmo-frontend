import { type PointerEvent, useEffect, useRef, useState } from 'react';

const MOBILE_PROMPT_INPUT_BOTTOM_PROPERTY = '--mobile-composer-bottom';
const KEYBOARD_DISMISS_DRAG_THRESHOLD = 10;

export function useMobilePromptInputKeyboard() {
  const promptInputRef = useRef<HTMLFormElement>(null);
  const [isPromptInputFocused, setIsPromptInputFocused] = useState(false);

  useEffect(() => {
    const promptInputElement = promptInputRef.current;

    if (!promptInputElement) {
      return;
    }

    if (!isPromptInputFocused) {
      promptInputElement.style.removeProperty(
        MOBILE_PROMPT_INPUT_BOTTOM_PROPERTY,
      );
      return;
    }

    const visualViewport = window.visualViewport;
    const updatePromptInputBottom = () => {
      const bottomOffset = visualViewport
        ? Math.max(0, window.innerHeight - visualViewport.height)
        : 0;

      promptInputElement.style.setProperty(
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
      promptInputElement.style.removeProperty(
        MOBILE_PROMPT_INPUT_BOTTOM_PROPERTY,
      );
    };
  }, [isPromptInputFocused]);

  useEffect(() => {
    const promptInputElement = promptInputRef.current;

    if (!promptInputElement || !isPromptInputFocused) {
      return;
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let shouldDismissKeyboardOnDrag = false;

    const handleDocumentTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      const eventTarget = event.target;

      if (!touch || !(eventTarget instanceof Node)) {
        shouldDismissKeyboardOnDrag = false;
        return;
      }

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      shouldDismissKeyboardOnDrag = !promptInputElement.contains(eventTarget);
    };

    const handleDocumentTouchMove = (event: TouchEvent) => {
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

  return {
    promptInputRef,
    handlePromptInputBlur: () => {
      setIsPromptInputFocused(false);
    },
    handlePromptInputFocus: () => {
      setIsPromptInputFocused(true);
    },
    handlePromptInputPointerDown: (
      event: PointerEvent<HTMLTextAreaElement>,
    ) => {
      if (
        event.pointerType === 'mouse' ||
        document.activeElement === event.currentTarget
      ) {
        return;
      }

      event.preventDefault();
      event.currentTarget.focus({ preventScroll: true });
    },
  };
}
