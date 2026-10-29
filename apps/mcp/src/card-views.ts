// How cards and decks are presented to the assistant. A card's question and
// answer are kept apart so a review can show one without giving away the
// other.

import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api.js";
import type { FunctionReturnType } from "convex/server";
import type { ToolContext } from "./tool-helpers.js";

export type Card = FunctionReturnType<typeof api.cards.getCard>;
export type Deck = FunctionReturnType<typeof api.decks.getUserDecks>[number];

const LETTER_A_CODE_POINT = 65;

/** "A. Paris" for option 0, as labelled in the web app. */
function optionLabel(options: string[], index: number) {
  return `${String.fromCodePoint(LETTER_A_CODE_POINT + index)}. ${options[index]}`;
}

function toIsoDate(timestamp: number | undefined) {
  return timestamp === undefined ? null : new Date(timestamp).toISOString();
}

/** Deck ids to names, to show each card's deck. */
export type DeckNames = Map<string, string>;

export function deckNames(decks: Deck[]): DeckNames {
  return new Map(decks.map((deck) => [deck._id, deck.deckName]));
}

function deckName(card: Card, names: DeckNames) {
  return card.deckId ? (names.get(card.deckId) ?? null) : null;
}

/** What to show when asking a card: everything but the answer. */
export function questionView(
  card: Card,
  names: DeckNames,
  questionImageUrl: string | null = null
) {
  return {
    cardId: card._id,
    type: card.cardType,
    deck: deckName(card, names),
    question: card.question,
    questionCode: card.questionCode,
    language: card.language,
    options: card.options?.map((_, index) =>
      optionLabel(card.options ?? [], index)
    ),
    questionImageUrl: questionImageUrl ?? undefined,
  };
}

/** The answer side of a card, including an MCQ's correct option. */
export function answerView(card: Card, answerImageUrl: string | null = null) {
  const { options, correctOptionIndex } = card;
  return {
    answer: card.answer,
    answerCode: card.answerCode,
    correctOption:
      options && correctOptionIndex !== undefined
        ? optionLabel(options, correctOptionIndex)
        : undefined,
    answerImageUrl: answerImageUrl ?? undefined,
  };
}

/** A one-line listing of a card, without its answer. */
export function cardSummary(card: Card, names: DeckNames) {
  return {
    cardId: card._id,
    type: card.cardType,
    deck: deckName(card, names),
    question: card.question,
    tags: card.tags,
    repetitions: card.repetitions,
    dueAt: toIsoDate(card.nextReviewDate),
  };
}

/** A card's scheduling state. */
export function scheduleView(card: Card) {
  return {
    repetitions: card.repetitions,
    intervalDays: card.intervalDays,
    easeFactor: card.easeFactor,
    dueAt: toIsoDate(card.nextReviewDate),
    lastReviewedAt: toIsoDate(card.lastReviewedAt),
  };
}

export function loadDecks({ client, apiKey }: ToolContext) {
  return client.query(api.decks.getUserDecks, { apiKey });
}

/**
 * The deck `ref` refers to: a deck id, or a deck name (ignoring case). Throws
 * a message listing the existing decks when there is none.
 */
export function findDeck(decks: Deck[], ref: string) {
  const name = ref.trim().toLowerCase();
  const deck = decks.find(
    (d) => d._id === ref || d.deckName.toLowerCase() === name
  );
  if (!deck) {
    const existing = decks.map((d) => `"${d.deckName}"`).join(", ");
    throw new Error(
      `No deck named "${ref}". Existing decks: ${existing || "none"}.`
    );
  }
  return deck;
}

/** Earliest due date among `cards`, as an ISO date, or null without cards. */
export function earliestDueAt(cards: Card[]) {
  const dueDates = cards.flatMap((card) => card.nextReviewDate ?? []);
  return dueDates.length > 0 ? toIsoDate(Math.min(...dueDates)) : null;
}
