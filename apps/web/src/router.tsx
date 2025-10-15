/** biome-ignore-all lint/nursery/useConsistentTypeDefinitions: <config file> */
/** biome-ignore-all lint/style/noNonNullAssertion: <config file> */
import { StrictMode } from "react";

import "./index.css";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { PostHogProvider } from "posthog-js/react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { useUserData } from "./hooks/use-user-data";
import i18n from "./i18n";
import { routeTree } from "./routeTree.gen";

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
    isLoading: undefined,
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
  const { userSynced } = useUserData();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-main border-t-transparent" />
      </div>
    );
  }

  return (
    <RouterProvider
      context={{
        queryClient,
        isAuthenticated,
        isLoading,
        userSynced,
      }}
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
