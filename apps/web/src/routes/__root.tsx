import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { ModalProvider } from "@/components/modals/modal-provider";
import { Navbar } from "@/components/navbar";
import type { RootContext } from "@/router";

/** Pages reachable while signed out. Every other page requires sign-in. */
const PUBLIC_PATHS = new Set(["/hero", "/privacy", "/sign-up"]);

const RootLayout = () => (
  <div className="flex h-screen flex-col">
    <Navbar />
    <main className="w-full flex-1 overflow-auto scroll-smooth bg-white/70">
      <ModalProvider />
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </main>
  </div>
);

export const Route = createRootRouteWithContext<RootContext>()({
  // The single place auth redirects happen; it re-runs on every navigation and
  // whenever `RouterApp` invalidates the router after an auth change.
  beforeLoad: ({ context, location }) => {
    if (!(context.isAuthenticated || PUBLIC_PATHS.has(location.pathname))) {
      throw redirect({ to: "/hero" });
    }
    if (context.isAuthenticated && location.pathname === "/hero") {
      throw redirect({ to: "/" });
    }
  },
  component: RootLayout,
});
