import type { Doc } from "../_generated/dataModel";

export type Card = Doc<"cards">;
export type Deck = Doc<"decks">;
export type ApiKey = Doc<"apiKeys">;

export type TextCard = Omit<
  Card,
  `question${"Code" | "File"}` | `answer${"Code" | "File"}`
>;

export type CodeCard = Required<Omit<Card, "questionFile" | "answerFile">>;
export type ImageCard = Required<Omit<Card, "questionCode" | "answerCode">>;

// ============================================
// Type Guards
// ============================================
export const isCodeCard = (c: Card): c is CodeCard =>
  c.questionCode !== undefined || c.answerCode !== undefined;

export const isImageCard = (c: Card): c is ImageCard =>
  c.questionFile !== undefined || c.answerFile !== undefined;

export const isTextCard = (c: Card): c is TextCard =>
  !(isCodeCard(c) && isImageCard(c));
