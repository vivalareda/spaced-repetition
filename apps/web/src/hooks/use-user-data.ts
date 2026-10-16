import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import type {
  FunctionReference,
  FunctionReturnType,
  OptionalRestArgs,
} from "convex/server";
import { useRef } from "react";
import { useMinuteClock } from "@/hooks/use-minute-clock";

/**
 * True once the signed-in user's Convex record exists. The record is created
 * on login by `users.upsertFromClerk`, and user-scoped queries throw until then.
 */
export function useUserSynced() {
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(
    api.users.current,
    isAuthenticated ? {} : "skip"
  );
  return isAuthenticated && !!currentUser;
}

/**
 * `useQuery` for user-scoped queries: it waits until the user is synced, and
 * returns `undefined` while loading or when `args` is "skip".
 */
export function useUserQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"] | "skip"
): FunctionReturnType<Query> | undefined {
  const isSynced = useUserSynced();
  const queryArgs = isSynced ? args : "skip";
  return useQuery(
    query,
    ...([queryArgs] as unknown as OptionalRestArgs<Query>)
  );
}

/**
 * Keeps returning the last loaded value while a query re-loads with new
 * arguments, instead of flashing back to `undefined`.
 */
function useLastDefined<T>(value: T | undefined) {
  const last = useRef(value);
  if (value !== undefined) {
    last.current = value;
  }
  return last.current;
}

/**
 * The user's cards, decks and due cards, as shown on the home page and the
 * dashboard. `undefined` until all of them have loaded. Due cards are
 * re-evaluated every minute so cards that become due while the app is open
 * show up.
 */
export function useUserData() {
  const now = useMinuteClock();
  const cards = useUserQuery(api.cards.get, {});
  const decks = useUserQuery(api.decks.getUserDecks, {});
  const dueToday = useLastDefined(useUserQuery(api.cards.getDueToday, { now }));

  if (cards === undefined || decks === undefined || dueToday === undefined) {
    return;
  }
  return { cards, decks, dueToday };
}
