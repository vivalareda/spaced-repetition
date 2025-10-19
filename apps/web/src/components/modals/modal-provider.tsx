import { lazy, Suspense } from "react";

const ChooseDeckModal = lazy(() =>
  import("@/components/modals/choose-deck").then((module) => ({
    default: module.ChooseDeckModal,
  }))
);
const ConfirmationModal = lazy(() =>
  import("@/components/modals/confirmation-modal").then((module) => ({
    default: module.ConfirmationModal,
  }))
);
const CreateCardModal = lazy(() =>
  import("@/components/modals/create-card").then((module) => ({
    default: module.CreateCardModal,
  }))
);
const CreateDeckModal = lazy(() =>
  import("@/components/modals/create-deck").then((module) => ({
    default: module.CreateDeckModal,
  }))
);
const SignInModal = lazy(() =>
  import("@/components/modals/sign-in-modal").then((module) => ({
    default: module.SignInModal,
  }))
);
const SignUpModal = lazy(() =>
  import("@/components/modals/sign-up-modal").then((module) => ({
    default: module.SignUpModal,
  }))
);

export function ModalProvider() {
  return (
    <Suspense fallback={null}>
      <ConfirmationModal />
      <ChooseDeckModal />
      <CreateCardModal />
      <CreateDeckModal />
      <SignInModal />
      <SignUpModal />
    </Suspense>
  );
}
