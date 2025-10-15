import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";

export function ConvexUserSync() {
  const { isAuthenticated } = useConvexAuth();
  const upsertUser = useMutation(api.users.upsertFromClerk);

  useEffect(() => {
    console.log("ConvexUserSync: isAuthenticated =", isAuthenticated);

    if (isAuthenticated) {
      console.log("ConvexUserSync: Calling upsertFromClerk...");

      upsertUser()
        .then((userId) => {
          console.log("ConvexUserSync: User synced successfully!", userId);
        })
        .catch((error) => {
          console.error("ConvexUserSync: Failed to sync user:", error);
        });
    }
  }, [isAuthenticated, upsertUser]);

  return null;
}
