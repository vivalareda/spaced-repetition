// biome-ignore-all lint/style/noMagicNumbers: expected intervals read more clearly as literals
import { describe, expect, it } from "vitest";
import {
  INITIAL_SCHEDULING_STATE,
  MS_PER_DAY,
  RATINGS,
  type SchedulingState,
  schedule,
} from "./scheduler";

const NOW = 1_700_000_000_000;

const NEW_CARD = INITIAL_SCHEDULING_STATE;
const SECOND_REVIEW: SchedulingState = {
  easeFactor: 2.5,
  intervalDays: 1,
  repetitions: 1,
};
const GRADUATED: SchedulingState = {
  easeFactor: 2.5,
  intervalDays: 10,
  repetitions: 3,
};

describe("schedule", () => {
  describe("again", () => {
    it.each([NEW_CARD, SECOND_REVIEW, GRADUATED])(
      "resets repetitions and reviews tomorrow (%o)",
      (state) => {
        const result = schedule(state, "again", NOW);
        expect(result.repetitions).toBe(0);
        expect(result.intervalDays).toBe(1);
        expect(result.easeFactor).toBeCloseTo(state.easeFactor - 0.2);
      }
    );
  });

  describe("hard", () => {
    it("uses learning steps for repetitions 0 and 1", () => {
      expect(schedule(NEW_CARD, "hard", NOW).intervalDays).toBe(1);
      expect(schedule(SECOND_REVIEW, "hard", NOW).intervalDays).toBe(3);
    });

    it("grows by 1.2x (at least +1 day) once graduated", () => {
      const result = schedule(GRADUATED, "hard", NOW);
      expect(result.intervalDays).toBe(12);
      expect(result.repetitions).toBe(4);
      expect(result.easeFactor).toBeCloseTo(2.35);

      const short = schedule({ ...GRADUATED, intervalDays: 2 }, "hard", NOW);
      expect(short.intervalDays).toBe(3);
    });
  });

  describe("medium", () => {
    it("uses learning steps for repetitions 0 and 1", () => {
      expect(schedule(NEW_CARD, "medium", NOW).intervalDays).toBe(1);
      expect(schedule(SECOND_REVIEW, "medium", NOW).intervalDays).toBe(6);
    });

    it("multiplies by the unchanged ease factor once graduated", () => {
      const result = schedule(GRADUATED, "medium", NOW);
      expect(result.intervalDays).toBe(25);
      expect(result.easeFactor).toBe(2.5);
      expect(result.repetitions).toBe(4);
    });
  });

  describe("easy", () => {
    it("uses learning steps for repetitions 0 and 1", () => {
      expect(schedule(NEW_CARD, "easy", NOW).intervalDays).toBe(4);
      expect(schedule(SECOND_REVIEW, "easy", NOW).intervalDays).toBe(10);
    });

    it("multiplies by the boosted ease factor and easy bonus once graduated", () => {
      const result = schedule(GRADUATED, "easy", NOW);
      // 10 * (2.5 + 0.15) * 1.3 = 34.45
      expect(result.intervalDays).toBe(34);
      expect(result.easeFactor).toBeCloseTo(2.65);
      expect(result.repetitions).toBe(4);
    });
  });

  it("never lets the ease factor drop below 1.3", () => {
    const lowEase = { ...GRADUATED, easeFactor: 1.35 };
    expect(schedule(lowEase, "again", NOW).easeFactor).toBe(1.3);
    expect(schedule(lowEase, "hard", NOW).easeFactor).toBe(1.3);
  });

  it.each(RATINGS)(
    "returns a whole number of days and a matching review date (%s)",
    (rating) => {
      const state = { easeFactor: 2.37, intervalDays: 7, repetitions: 5 };
      const result = schedule(state, rating, NOW);
      expect(Number.isInteger(result.intervalDays)).toBe(true);
      expect(result.intervalDays).toBeGreaterThanOrEqual(1);
      expect(result.nextReviewDate).toBe(
        NOW + result.intervalDays * MS_PER_DAY
      );
    }
  );
});
