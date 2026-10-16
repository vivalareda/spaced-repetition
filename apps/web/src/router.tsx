/** biome-ignore-all lint/nursery/useConsistentTypeDefinitions: <config file> */
/** biome-ignore-all lint/style/noNonNullAssertion: <config file> */
import { StrictMode, useEffect } from "react";

import "./index.css";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ConvexReactClient, useConvexAuth, useMutation } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { PostHogProvider } from "posthog-js/react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { useUserSynced } from "./hooks/use-user-data";
import i18n from "./i18n";
import { routeTree } from "./routeTree.gen";

/**
 * Available to every route's `beforeLoad`/`loader`. Auth redirects are handled
 * once, in the root route's `beforeLoad`.
 */
export type RootContext = {
  queryClient: QueryClient;
  isAuthenticated: boolean;
  /** Whether user-scoped queries can run yet (see `useUserSynced`). */
  userSynced: boolean;
};

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
      staleTime: 600_000,
      gcTime: 900_000,
    },
  },
});

convexQueryClient.connect(queryClient);

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    isAuthenticated: false,
    userSynced: false,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function RouterApp() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const userSynced = useUserSynced();
  const upsertUser = useMutation(api.users.upsertFromClerk);

  // Creates/updates the user's Convex record on login; `userSynced` flips to
  // true once it exists.
  useEffect(() => {
    if (isAuthenticated) {
      upsertUser();
    }
  }, [isAuthenticated, upsertUser]);

  // Re-runs the root auth redirect and the loaders when auth state changes
  // (sign in, sign out, user record created).
  // biome-ignore lint/correctness/useExhaustiveDependencies: the auth values are the triggers, not inputs
  useEffect(() => {
    if (!isLoading) {
      router.invalidate();
    }
  }, [isAuthenticated, isLoading, userSynced]);

  // Routes only render once auth is known, so redirects never act on a
  // provisional "signed out" state.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-main border-t-transparent" />
      </div>
    );
  }

  return (
    <RouterProvider
      context={{ queryClient, isAuthenticated, userSynced }}
      router={router}
    />
  );
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          defaults: "2025-05-24",
          capture_exceptions: true,
          debug: import.meta.env.MODE === "development",
        }}
      >
        <I18nextProvider i18n={i18n}>
          <ClerkProvider
            publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
          >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
              <QueryClientProvider client={queryClient}>
                <RouterApp />
              </QueryClientProvider>
            </ConvexProviderWithClerk>
          </ClerkProvider>
        </I18nextProvider>
      </PostHogProvider>
    </StrictMode>
  );
}
