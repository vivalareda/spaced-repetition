import { ChooseDeckModal } from "@/components/modals/choose-deck";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";
import { CreateCardModal } from "@/components/modals/create-card";
import { CreateDeckModal } from "@/components/modals/create-deck";
import { SignInModal } from "@/components/modals/sign-in-modal";
import { SignUpModal } from "@/components/modals/sign-up-modal";

export function ModalProvider() {
  return (
    <>
      <ConfirmationModal />
      <ChooseDeckModal />
      <CreateCardModal />
      <CreateDeckModal />
      <SignInModal />
      <SignUpModal />
    </>
  );
}
