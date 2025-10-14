import type { Doc } from "@spaced-repetition-monorepo/backend/convex/_generated/dataModel";

export type Card = Doc<"cards">;
export type Deck = Doc<"decks">;
export type CodeCard = Required<Card>;
export type Difficulty = "easy" | "medium" | "hard" | "again";

export const MINIMUM_DEBOUNCE_TIME = 300;

export const isCodeCard = (c: Card): c is CodeCard =>
  c.questionCode !== undefined || c.answerCode !== undefined;
