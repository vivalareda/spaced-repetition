import type { Doc } from "../_generated/dataModel";

export type Card = Doc<"cards">;
export type Deck = Doc<"decks">;
export type ApiKey = Doc<"apiKeys">;

export type CardType = "text" | "code" | "image" | "mcq";

// ============================================
// Discriminated Card Types
// ============================================

/** Resolves the cardType for legacy cards that don't have an explicit `cardType` field. */
export function resolveCardType(card: Card): CardType {
  if (card.cardType) {
    return card.cardType;
  }
  if (card.options !== undefined && card.correctOptionIndex !== undefined) {
    return "mcq";
  }
  if (card.questionCode !== undefined || card.answerCode !== undefined) {
    return "code";
  }
  if (card.questionFile !== undefined || card.answerFile !== undefined) {
    return "image";
  }
  return "text";
}

export type TextCard = Card & { cardType: "text" };
export type CodeCard = Card & {
  cardType: "code";
  questionCode: string;
  language: string;
};
export type ImageCard = Card & {
  cardType: "image";
  questionFile: NonNullable<Card["questionFile"]>;
};
export type McqCard = Card & {
  cardType: "mcq";
  options: string[];
  correctOptionIndex: number;
};

export type DiscriminatedCard = TextCard | CodeCard | ImageCard | McqCard;

/**
 * Narrows a raw `Card` doc into a `DiscriminatedCard` by resolving its type.
 * Useful when consuming cards fetched from the database.
 */
export function toDiscriminatedCard(card: Card): DiscriminatedCard {
  const type = resolveCardType(card);
  return { ...card, cardType: type } as DiscriminatedCard;
}

// ============================================
// Type Guards
// ============================================
export const isCodeCard = (c: Card): c is CodeCard =>
  resolveCardType(c) === "code";

export const isImageCard = (c: Card): c is ImageCard =>
  resolveCardType(c) === "image";

export const isTextCard = (c: Card): c is TextCard =>
  resolveCardType(c) === "text";

export const isMcqCard = (c: Card): c is McqCard =>
  resolveCardType(c) === "mcq";
