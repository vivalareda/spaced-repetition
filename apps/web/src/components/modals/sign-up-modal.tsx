import { SignUp, useUser } from "@clerk/clerk-react";
import posthog from "posthog-js";
import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useModalStore } from "@/hooks/use-modal-store";

export function SignUpModal() {
  const { isOpen, type, onClose } = useModalStore();
  const { user, isSignedIn } = useUser();
  const isModalOpen = isOpen && type === "sign-up";

  useEffect(() => {
    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
      });
    }
  }, [isSignedIn, user]);

  return (
    <Dialog onOpenChange={onClose} open={isModalOpen}>
      <DialogContent className="max-w-[440px] border-0 p-0">
        <div className="flex justify-center p-6">
          <SignUp fallbackRedirectUrl={"/"} routing="hash" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
