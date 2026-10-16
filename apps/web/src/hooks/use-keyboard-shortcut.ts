import type { QUESTION_TYPES } from "@shared/types";
import { type Options, useHotkeys } from "react-hotkeys-hook";
import { useModalStore } from "@/hooks/use-modal-store";

/** Each key opens the create-card modal with that question type preselected. */
const CREATE_CARD_HOTKEYS: Record<string, (typeof QUESTION_TYPES)[number]> = {
  c: "code",
  i: "image",
  t: "text",
  m: "mcq",
};
const CREATE_DECK_HOTKEY = "d";

// Shortcuts never fire while typing, and the key press doesn't leak into the
// modal that opens.
const HOTKEY_OPTIONS: Options = {
  enableOnFormTags: false,
  enableOnContentEditable: false,
  preventDefault: true,
};

/** Global shortcuts for creating cards (c/i/t/m) and decks (d). */
export function useKeyboardShortcut() {
  const { onOpen } = useModalStore();

  useHotkeys(
    Object.keys(CREATE_CARD_HOTKEYS),
    (_, { hotkey }) => {
      onOpen("create-card", { questionType: CREATE_CARD_HOTKEYS[hotkey] });
    },
    HOTKEY_OPTIONS
  );

  useHotkeys(
    CREATE_DECK_HOTKEY,
    () => {
      onOpen("create-deck");
    },
    HOTKEY_OPTIONS
  );
}
