// The queue of a review session. Shared by the web app (which keeps it in
// sessionStorage) and the backend (which keeps it for API-key clients such as
// the MCP server), so both sessions behave the same way.

import type { Difficulty } from "./scheduler";

export type ReviewQueue<Id extends string = string> = {
  /** Cards still to review, in order. The first one is the current card. */
  remaining: Id[];
  /** Cards already sent back to the end of the queue after an "again". */
  requeued: Id[];
  /** Number of ratings given so far in this session. */
  reviewedCount: number;
};

/** A fresh session over `cardIds`, reviewed in the given order. */
export function startReviewQueue<Id extends string>(
  cardIds: Id[]
): ReviewQueue<Id> {
  return { remaining: cardIds, requeued: [], reviewedCount: 0 };
}

/**
 * The queue after `cardId` is rated `rating`: the card leaves the queue, and
 * an "again" card comes back once, at the end.
 */
export function completeReview<Id extends string>(
  queue: ReviewQueue<Id>,
  cardId: Id,
  rating: Difficulty
): ReviewQueue<Id> {
  const remaining = queue.remaining.filter((id) => id !== cardId);
  const shouldRequeue = rating === "again" && !queue.requeued.includes(cardId);
  return {
    remaining: shouldRequeue ? [...remaining, cardId] : remaining,
    requeued: shouldRequeue ? [...queue.requeued, cardId] : queue.requeued,
    reviewedCount: queue.reviewedCount + 1,
  };
}
