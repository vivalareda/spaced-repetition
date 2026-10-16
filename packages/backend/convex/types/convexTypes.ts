import type { CardType } from "@shared/types";
import type { Doc } from "../_generated/dataModel";

export type Card = Doc<"cards">;
export type Deck = Doc<"decks">;

export type { CardType } from "@shared/types";

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
