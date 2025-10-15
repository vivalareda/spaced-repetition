import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";

export function useUserData() {
  const { isAuthenticated } = useConvexAuth();

  const currentUser = useQuery(
    api.users.current,
    isAuthenticated ? {} : "skip"
  );

  const userSynced = !!currentUser;
  const shouldRun = isAuthenticated && userSynced;

  const userCards = useQuery(api.cards.get, shouldRun ? {} : "skip");

  const userDecks = useQuery(api.decks.getUserDecks, shouldRun ? {} : "skip");

  const cardsDueToday = useQuery(
    api.cards.getDueToday,
    shouldRun ? {} : "skip"
  );

  const userDecksWithCardCount = useQuery(
    api.decks.getDecksWithCardCount,
    shouldRun ? {} : "skip"
  );

  const isLoading =
    (userCards === undefined ||
      userDecks === undefined ||
      cardsDueToday === undefined) &&
    isAuthenticated &&
    userSynced;

  return {
    userCards: userCards || [],
    userDecks: userDecks || [],
    userDecksWithCardCount: userDecksWithCardCount || [],
    cardsDueToday: cardsDueToday || [],
    userSynced,
    isLoading,
    isAuthenticated,
    isEmpty: userDecks?.length === 0 && userCards?.length === 0,
  };
}
