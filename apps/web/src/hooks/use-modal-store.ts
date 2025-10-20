import { create } from "zustand";

type QuestionType = "text" | "code" | "image";

type ModalType =
  | "create-card"
  | "create-deck"
  | "choose-deck"
  | "code-block"
  | "confirm"
  | "sign-in"
  | "sign-up"
  | null;

type ModalStore = {
  type: ModalType;
  isOpen: boolean;
  modalData: null;
  onSubmit?: () => void | Promise<void>;
  questionType?: QuestionType;
  onOpen: (
    type: ModalType,
    isOpen: boolean,
    questionType?: QuestionType,
    onSubmit?: () => void | Promise<void>
  ) => void;
  onClose: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  modalData: null,
  onSubmit: undefined,
  onOpen: (type, isOpen, questionType, onSubmit) =>
    set({ type, isOpen, questionType, onSubmit }),
  onClose: () => set({ type: null, isOpen: false }),
}));
