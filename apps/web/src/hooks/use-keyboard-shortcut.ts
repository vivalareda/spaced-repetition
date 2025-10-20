import { useHotkeys } from "react-hotkeys-hook";
import { useModalStore } from "@/hooks/use-modal-store";

export function useKeyboardShortcut() {
  const { onOpen } = useModalStore();
  useHotkeys("c", () => {
    onOpen("create-card", true, "code");
  });

  useHotkeys("i", () => {
    onOpen("create-card", true, "image");
  });

  useHotkeys("t", () => {
    onOpen("create-card", true, "text");
  });

  useHotkeys(
    "d",
    (e) => {
      e.preventDefault();
      onOpen("create-deck", true);
    },
    {
      enableOnContentEditable: false,
      enableOnFormTags: false,
    }
  );
}
