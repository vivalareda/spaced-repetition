import { describe, expect, it } from "vitest";
import { completeReview, startReviewQueue } from "./review-queue";

describe("review queue", () => {
  it("starts with every card remaining and nothing reviewed", () => {
    expect(startReviewQueue(["a", "b"])).toEqual({
      remaining: ["a", "b"],
      requeued: [],
      reviewedCount: 0,
    });
  });

  it("removes a card rated anything but again", () => {
    const queue = completeReview(startReviewQueue(["a", "b"]), "a", "easy");
    expect(queue).toEqual({ remaining: ["b"], requeued: [], reviewedCount: 1 });
  });

  it("sends an again card to the end of the queue, only once", () => {
    let queue = completeReview(startReviewQueue(["a", "b"]), "a", "again");
    expect(queue.remaining).toEqual(["b", "a"]);

    queue = completeReview(queue, "b", "medium");
    queue = completeReview(queue, "a", "again");
    expect(queue).toEqual({ remaining: [], requeued: ["a"], reviewedCount: 3 });
  });

  it("counts ratings of cards that are not in the queue", () => {
    const queue = completeReview(startReviewQueue(["a"]), "z", "hard");
    expect(queue).toEqual({ remaining: ["a"], requeued: [], reviewedCount: 1 });
  });
});
