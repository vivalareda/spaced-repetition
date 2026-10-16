import { SignUp } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-md">
        <SignUp
          fallbackRedirectUrl={"/dashboard"}
          forceRedirectUrl={"/dashboard"}
          routing="hash"
        />
      </div>
    </div>
  );
}
