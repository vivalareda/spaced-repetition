import { create } from "zustand";

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
  onOpen: (
    type: ModalType,
    isOpen: boolean,
    onSubmit?: () => void | Promise<void>
  ) => void;
  onClose: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  modalData: null,
  onSubmit: undefined,
  onOpen: (type, isOpen, onSubmit) => set({ type, isOpen, onSubmit }),
  onClose: () => set({ type: null, isOpen: false }),
}));
