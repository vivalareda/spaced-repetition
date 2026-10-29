import {
  completeReview,
  type Difficulty,
  RATINGS,
  type ReviewQueue,
  startReviewQueue,
} from "@shared/types";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import type { Card } from "@spaced-repetition-monorepo/backend/convex/types/convexTypes";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useUserQuery } from "@/hooks/use-user-data";

// ============================================
// Persisted session state
// ============================================

type CardId = Card["_id"];

/**
 * Only card ids are stored (in sessionStorage), so a page refresh resumes the
 * session and rebuilds it from fresh card data.
 */
type SessionStore = ReviewQueue<CardId> & {
  start: (cardIds: CardId[]) => void;
  /** Removes a rated card from the queue; an "again" card comes back once, at the end. */
  complete: (cardId: CardId, rating: Difficulty) => void;
};

const SESSION_STORAGE_KEY = "review-session";

const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      ...startReviewQueue<CardId>([]),
      start: (cardIds) => set(startReviewQueue(cardIds)),
      complete: (cardId, rating) =>
        set((state) => completeReview(state, cardId, rating)),
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// ============================================
// Starting a session
// ============================================

/**
 * Returns a function that starts reviewing `cards` and opens the review page.
 * Starting with no cards does nothing.
 */
export function useStartReview() {
  const start = useSessionStore((state) => state.start);
  const navigate = useNavigate();

  return (cards: Card[]) => {
    if (cards.length === 0) {
      return;
    }
    start(cards.map((card) => card._id));
    navigate({ to: "/review" });
  };
}

// ============================================
// Running a session
// ============================================

export type ReviewSession =
  | { status: "none" }
  | { status: "loading" }
  | { status: "finished"; reviewedCount: number }
  | {
      status: "reviewing";
      card: Card;
      /** Distinguishes repeated showings of the same card (after "again"). */
      showingKey: string;
      /** 0-based position of the current card in the session. */
      position: number;
      total: number;
      isRevealed: boolean;
      reveal: () => void;
      /** The rating being saved, or null when idle. */
      pendingRating: Difficulty | null;
      rateFailed: boolean;
      rate: (rating: Difficulty) => void;
    };

const REVEAL_HOTKEY = "space";
// "1" rates "again", ..., "4" rates "easy", following RATINGS' order.
const RATING_HOTKEYS = RATINGS.map((_, index) => String(index + 1));

/**
 * Drives the review page: the current card, revealing its answer, rating it
 * (space reveals, 1-4 rate), and moving on. Each card is rated at most once
 * per showing, and the next card only appears once the rating is saved.
 */
export function useReviewSession(): ReviewSession {
  const { remaining, reviewedCount, complete } = useSessionStore();
  const hasSession = remaining.length > 0 || reviewedCount > 0;
  const cards = useUserQuery(api.cards.get, hasSession ? {} : "skip");
  const updateNextReviewDate = useMutation(api.cards.updateNextReviewDate);

  // The answer is revealed for one showing only, so any change of current
  // card (rated, or deleted from another tab) hides it again.
  const [revealedShowingKey, setRevealedShowingKey] = useState<string | null>(
    null
  );
  // While a rating saves, Convex may already push the rescheduled card. Keep
  // the card as it was when rated so previews aren't computed from the new
  // state (which would look like the rating was applied twice).
  const [pending, setPending] = useState<{
    rating: Difficulty;
    card: Card;
  } | null>(null);
  const [rateFailed, setRateFailed] = useState(false);
  // Guards against double ratings (e.g. two quick key presses) before the
  // `pendingRating` state update has re-rendered.
  const isRatingRef = useRef(false);

  // Cards deleted since the session started are skipped.
  const queue = useMemo(() => {
    if (!cards) {
      return;
    }
    const cardsById = new Map(
      cards.map((userCard) => [userCard._id, userCard])
    );
    return remaining.flatMap((id) => cardsById.get(id) ?? []);
  }, [cards, remaining]);
  const card = pending?.card ?? queue?.[0];
  const showingKey = card ? `${card._id}-${reviewedCount}` : null;
  const isRevealed = showingKey !== null && revealedShowingKey === showingKey;

  const reveal = () => setRevealedShowingKey(showingKey);

  const rate = async (rating: Difficulty) => {
    if (!card || isRatingRef.current) {
      return;
    }
    isRatingRef.current = true;
    setPending({ rating, card });
    setRateFailed(false);
    try {
      await updateNextReviewDate({ cardId: card._id, difficulty: rating });
      complete(card._id, rating);
    } catch {
      setRateFailed(true);
    } finally {
      isRatingRef.current = false;
      setPending(null);
    }
  };

  useHotkeys(REVEAL_HOTKEY, reveal, {
    enabled: card !== undefined && !isRevealed,
    preventDefault: true,
  });
  useHotkeys(
    RATING_HOTKEYS,
    (event) => {
      const rating = RATINGS[Number(event.key) - 1];
      if (rating) {
        rate(rating);
      }
    },
    { enabled: card !== undefined && isRevealed, preventDefault: true },
    [card, isRevealed]
  );

  if (!hasSession) {
    return { status: "none" };
  }
  if (!queue) {
    return { status: "loading" };
  }
  if (!(card && showingKey)) {
    return { status: "finished", reviewedCount };
  }
  return {
    status: "reviewing",
    card,
    showingKey,
    position: reviewedCount,
    total: reviewedCount + queue.length,
    isRevealed,
    reveal,
    pendingRating: pending?.rating ?? null,
    rateFailed,
    rate,
  };
}
