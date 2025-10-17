import { useRef, useState } from "react";

const VISIBLE_TIMEOUT = 2000;

export function useCopyClipboard() {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const toggleVisibility = () => {
    if (isVisible && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, VISIBLE_TIMEOUT);
  };

  return {
    isVisible,
    toggleVisibility,
    copy,
    setIsVisible,
  };
}
