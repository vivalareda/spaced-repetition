import { SignIn } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/hooks/use-modal-store";

export function SignInModal() {
  const { isOpen, type, onClose } = useModalStore();

  const isModalOpen = isOpen && type === "sign-in";

  return (
    <Dialog onOpenChange={onClose} open={isModalOpen}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="pt-6">
          <DialogTitle className="text-center font-heading text-xl">
            Welcome Back
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center px-6 pb-6">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-main hover:bg-main/90 text-main-foreground",
                card: "shadow-none",
              },
            }}
            fallbackRedirectUrl={"/"}
            routing="hash"
            signUpUrl="#"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
