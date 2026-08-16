import { useEffect, useRef, useState } from 'react';

import { usePreventMobileInputFocusScroll } from './usePreventMobileInputFocusScroll';

const MOBILE_PROMPT_INPUT_BOTTOM_PROPERTY = '--mobile-composer-bottom';
const KEYBOARD_DISMISS_DRAG_THRESHOLD = 10;

function getVisualViewportBottomOffset() {
  const visualViewport = window.visualViewport;

  if (!visualViewport) {
    return 0;
  }

  return Math.max(0, window.innerHeight - visualViewport.height);
}

export function useMobilePromptInputKeyboard() {
  const promptInputGroupRef = useRef<HTMLFormElement>(null);
  const {
    inputRef: promptTextareaRef,
    handleInputTouchEnd,
    handleInputTouchStart,
  } = usePreventMobileInputFocusScroll();
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
    setIsPromptInputFocused(false);
  };

  const handlePromptInputFocus = () => {
    setIsPromptInputFocused(true);
  };

  return {
    promptInputGroupRef,
    promptTextareaRef,
    handlePromptInputBlur,
    handlePromptInputFocus,
    handlePromptInputTouchEnd: handleInputTouchEnd,
    handlePromptInputTouchStart: handleInputTouchStart,
  };
}
