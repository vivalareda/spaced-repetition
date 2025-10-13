import { convexQuery } from "@convex-dev/react-query";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { useConvexAuth } from "convex/react";

export function useUserData() {
  const { isAuthenticated } = useConvexAuth();

  const userCards = useQuery({
    ...convexQuery(api.cards.get, {}),
    staleTime: 300_000,
    enabled: isAuthenticated,
  });

  const userDecks = useQuery({
    ...convexQuery(api.decks.getUserDecks, {}),
    staleTime: 30_000,
    enabled: isAuthenticated,
  });

  const cardsDueToday = useQuery({
    ...convexQuery(api.cards.getDueToday, {}),
    staleTime: 30_000,
    enabled: isAuthenticated,
  });

  return {
    userCards: userCards.data || [],
    userDecks: userDecks.data || [],
    cardsDueToday: cardsDueToday.data || [],
    isLoading:
      (userCards.isLoading || userDecks.isLoading || cardsDueToday.isLoading) &&
      !userCards.data &&
      !userDecks.data &&
      !cardsDueToday.data,
    isAuthenticated,
    isEmpty: userDecks.data?.length === 0 && userCards.data?.length === 0,
  };
}
