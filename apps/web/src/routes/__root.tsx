import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { ModalProvider } from "@/components/modals/modal-provider";
import { Navbar } from "@/components/navbar";
import { useUserData } from "@/hooks/use-user-data";

type RootContext = {
  queryClient: QueryClient;
  isAuthenticated: boolean;
  isLoading: boolean | undefined;
};

const RootLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useUserData();
  const upsertUser = useMutation(api.users.upsertFromClerk);

  useEffect(() => {
    if (!(isLoading || isAuthenticated)) {
      navigate({ to: "/hero" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      upsertUser().catch(() => {
        // Handle user creation error silently
      });
    }
  }, [isAuthenticated, upsertUser]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-main border-t-transparent" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <main className="w-full flex-1 overflow-auto scroll-smooth bg-white/70">
        <ModalProvider />
        <Outlet />
        {/* <TanStackRouterDevtools /> */}
      </main>
    </div>
  );
};

export const Route = createRootRouteWithContext<RootContext>()({
  component: RootLayout,
});
