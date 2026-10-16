import type { QUESTION_TYPES } from "@shared/types";
import { create } from "zustand";

type QuestionType = (typeof QUESTION_TYPES)[number];

type ModalType =
  | "create-card"
  | "create-deck"
  | "choose-deck"
  | "code-block"
  | "confirm"
  | "sign-in"
  | "sign-up";

type OpenOptions = {
  /** Preselects the question type of the create-card modal. */
  questionType?: QuestionType;
  /** The modal's primary action (e.g. confirm, after create); awaited if it returns a promise. */
  onSubmit?: () => unknown;
};

type ModalStore = OpenOptions & {
  /** The open modal, or null when none is open. */
  type: ModalType | null;
  onOpen: (type: ModalType, options?: OpenOptions) => void;
  onClose: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  onOpen: (type, options = {}) =>
    set({
      type,
      questionType: options.questionType,
      onSubmit: options.onSubmit,
    }),
  onClose: () =>
    set({ type: null, questionType: undefined, onSubmit: undefined }),
}));
