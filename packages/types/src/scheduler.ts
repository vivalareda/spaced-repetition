// SM-2 variant used to schedule card reviews. Shared by the backend (which
// persists the result) and the web app (which previews it on the rating
// buttons), so both always agree on the next interval.

export const RATINGS = ["again", "hard", "medium", "easy"] as const;
export type Difficulty = (typeof RATINGS)[number];

export type SchedulingState = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export type ScheduleResult = SchedulingState & { nextReviewDate: number };

// ============================================
// Ease factor
// ============================================
export const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const AGAIN_EASE_PENALTY = 0.2;
const HARD_EASE_PENALTY = 0.15;
const EASY_EASE_BONUS = 0.15;

// ============================================
// Intervals (in days)
// ============================================
const AGAIN_INTERVAL = 1;
const MIN_INTERVAL = 1;
const HARD_INTERVAL_MULTIPLIER = 1.2;
const EASY_INTERVAL_BONUS = 1.3;

// Fixed intervals for the first two successful reviews, indexed by the number
// of repetitions before the review (0 or 1). After that, intervals grow
// multiplicatively from the previous one.
const HARD_LEARNING_STEP_1 = 1;
const HARD_LEARNING_STEP_2 = 3;
const MEDIUM_LEARNING_STEP_1 = 1;
const MEDIUM_LEARNING_STEP_2 = 6;
const EASY_LEARNING_STEP_1 = 4;
const EASY_LEARNING_STEP_2 = 10;
const LEARNING_STEPS: Record<Exclude<Difficulty, "again">, number[]> = {
  hard: [HARD_LEARNING_STEP_1, HARD_LEARNING_STEP_2],
  medium: [MEDIUM_LEARNING_STEP_1, MEDIUM_LEARNING_STEP_2],
  easy: [EASY_LEARNING_STEP_1, EASY_LEARNING_STEP_2],
};

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
export const MS_PER_DAY =
  HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

/** The scheduling fields a brand-new card starts with. */
export const INITIAL_SCHEDULING_STATE: SchedulingState = {
  easeFactor: INITIAL_EASE_FACTOR,
  intervalDays: 0,
  repetitions: 0,
};

function clampEase(easeFactor: number) {
  return Math.max(MIN_EASE_FACTOR, easeFactor);
}

function nextEaseFactor(easeFactor: number, rating: Difficulty) {
  switch (rating) {
    case "again":
      return clampEase(easeFactor - AGAIN_EASE_PENALTY);
    case "hard":
      return clampEase(easeFactor - HARD_EASE_PENALTY);
    case "medium":
      return easeFactor;
    case "easy":
      return easeFactor + EASY_EASE_BONUS;
    default:
      throw new Error(`Rating ${rating satisfies never} not supported`);
  }
}

/** Interval growth for a card that has passed its learning steps. */
function graduatedInterval(
  intervalDays: number,
  easeFactor: number,
  rating: Exclude<Difficulty, "again">
) {
  switch (rating) {
    case "hard":
      return Math.max(
        intervalDays * HARD_INTERVAL_MULTIPLIER,
        intervalDays + 1
      );
    case "medium":
      return intervalDays * easeFactor;
    case "easy":
      return intervalDays * easeFactor * EASY_INTERVAL_BONUS;
    default:
      throw new Error(`Rating ${rating satisfies never} not supported`);
  }
}

/**
 * Computes a card's next scheduling state after it is reviewed with `rating`
 * at time `now` (ms since epoch). `intervalDays` is always a whole number of
 * days, at least 1.
 */
export function schedule(
  state: SchedulingState,
  rating: Difficulty,
  now: number
): ScheduleResult {
  const easeFactor = nextEaseFactor(state.easeFactor, rating);

  let rawInterval: number;
  let repetitions: number;
  if (rating === "again") {
    rawInterval = AGAIN_INTERVAL;
    repetitions = 0;
  } else {
    rawInterval =
      LEARNING_STEPS[rating][state.repetitions] ??
      graduatedInterval(state.intervalDays, easeFactor, rating);
    repetitions = state.repetitions + 1;
  }

  const intervalDays = Math.max(MIN_INTERVAL, Math.round(rawInterval));

  return {
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewDate: now + intervalDays * MS_PER_DAY,
  };
}
