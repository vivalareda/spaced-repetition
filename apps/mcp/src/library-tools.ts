// Tools for browsing and managing decks and cards, mirroring the web app's
// dashboard (plus editing, which the web app doesn't offer yet).

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api.js";
import type { Id } from "@spaced-repetition-monorepo/backend/convex/_generated/dataModel.js";
import type { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import {
  answerView,
  cardSummary,
  deckNames,
  findDeck,
  loadDecks,
  questionView,
  scheduleView,
} from "./card-views.js";
import { registerTool, type ToolContext } from "./tool-helpers.js";

const cardIdInput = z
  .string()
  .describe("The card's id (cardId), as returned by other tools");
const deckInput = z.string().describe("The deck's name or id");
const confirmInput = z
  .literal(true)
  .describe(
    "Must be true. Only set it after the user explicitly confirmed the deletion."
  );

const asCardId = (cardId: string) => cardId as Id<"cards">;

/**
 * Everything about one card: question, answer and schedule. MCQ options are
 * raw (unlabelled) with their correct index, as `update_card` takes them.
 */
async function fullCardView(context: ToolContext, cardId: string) {
  const [revealed, decks] = await Promise.all([
    context.client.query(api.reviews.reveal, {
      apiKey: context.apiKey,
      cardId: asCardId(cardId),
      now: Date.now(),
    }),
    loadDecks(context),
  ]);
  const { card } = revealed;
  return {
    ...questionView(card, deckNames(decks), revealed.questionImageUrl),
    ...answerView(card, revealed.answerImageUrl),
    options: card.options,
    correctOptionIndex: card.correctOptionIndex,
    tags: card.tags,
    schedule: scheduleView(card),
  };
}

function registerDeckTools(server: McpServer, client: ConvexHttpClient) {
  registerTool(server, client, "list_decks", {
    title: "List decks",
    description:
      "List the user's decks (projects) with their description, number of cards and number of cards due now, plus the same counts for cards without a deck.",
    inputSchema: {},
    annotations: { readOnlyHint: true },
    run: async (_args, context) => {
      const { apiKey } = context;
      const [decks, cards, due] = await Promise.all([
        loadDecks(context),
        client.query(api.cards.get, { apiKey }),
        client.query(api.cards.getDueToday, { apiKey, now: Date.now() }),
      ]);
      const counts = (deckId: string | undefined) => ({
        cardCount: cards.filter((card) => card.deckId === deckId).length,
        dueNowCount: due.filter((card) => card.deckId === deckId).length,
      });
      return {
        decks: decks.map((deck) => ({
          deckId: deck._id,
          name: deck.deckName,
          description: deck.deckDescription,
          ...counts(deck._id),
        })),
        withoutDeck: counts(undefined),
      };
    },
  });

  registerTool(server, client, "create_deck", {
    title: "Create deck",
    description: "Create a new deck (project) to organize cards.",
    inputSchema: {
      name: z.string().min(1).describe("Unique deck name"),
      description: z.string().optional(),
    },
    run: async ({ name, description }, { apiKey }) => {
      const deckId = await client.mutation(api.decks.createDeck, {
        apiKey,
        deckName: name,
        deckDescription: description,
      });
      return { deckId, name: name.trim() };
    },
  });

  registerTool(server, client, "update_deck", {
    title: "Update deck",
    description: "Rename a deck and/or change its description.",
    inputSchema: {
      deck: deckInput,
      name: z.string().min(1).optional().describe("New unique name"),
      description: z.string().optional().describe("New description"),
    },
    run: async ({ deck, name, description }, context) => {
      const { _id: deckId } = findDeck(await loadDecks(context), deck);
      await client.mutation(api.decks.updateDeck, {
        apiKey: context.apiKey,
        deckId,
        deckName: name,
        deckDescription: description,
      });
      const updated = findDeck(await loadDecks(context), deckId);
      return {
        deckId,
        name: updated.deckName,
        description: updated.deckDescription,
      };
    },
  });

  registerTool(server, client, "delete_deck", {
    title: "Delete deck",
    description:
      "Permanently delete a deck AND every card in it. Tell the user how many cards will be lost and get their explicit confirmation first.",
    inputSchema: { deck: deckInput, confirm: confirmInput },
    annotations: { destructiveHint: true },
    run: async ({ deck }, context) => {
      const { apiKey } = context;
      const { _id: deckId, deckName } = findDeck(
        await loadDecks(context),
        deck
      );
      const cards = await client.query(api.cards.get, { apiKey });
      await client.mutation(api.decks.deleteDeck, { apiKey, deckId });
      return {
        deletedDeck: deckName,
        deletedCardCount: cards.filter((card) => card.deckId === deckId).length,
      };
    },
  });
}

function registerCardTools(server: McpServer, client: ConvexHttpClient) {
  registerTool(server, client, "list_cards", {
    title: "List cards",
    description:
      "List cards (questions only, with deck, tags and next due date): all of them, those of one deck, or those without a deck.",
    inputSchema: {
      deck: z
        .string()
        .optional()
        .describe("Only cards of this deck (name or id)"),
      withoutDeck: z
        .boolean()
        .optional()
        .describe("Only cards that are in no deck"),
    },
    annotations: { readOnlyHint: true },
    run: async ({ deck, withoutDeck }, context) => {
      if (deck && withoutDeck) {
        throw new Error("Pass either deck or withoutDeck, not both.");
      }
      const [decks, cards] = await Promise.all([
        loadDecks(context),
        client.query(api.cards.get, { apiKey: context.apiKey }),
      ]);
      let matching = cards;
      if (deck) {
        const deckId = findDeck(decks, deck)._id;
        matching = cards.filter((card) => card.deckId === deckId);
      } else if (withoutDeck) {
        matching = cards.filter((card) => !card.deckId);
      }
      const names = deckNames(decks);
      return {
        count: matching.length,
        cards: matching.map((card) => cardSummary(card, names)),
      };
    },
  });

  registerTool(server, client, "get_card", {
    title: "Get card",
    description:
      "Everything about one card: question, answer, options, code, images, tags and schedule. Don't use it to ask a card during a review (it shows the answer); use get_next_card instead.",
    inputSchema: { cardId: cardIdInput },
    annotations: { readOnlyHint: true },
    run: async ({ cardId }, context) => await fullCardView(context, cardId),
  });

  registerTool(server, client, "update_card", {
    title: "Update card",
    description:
      "Edit a card's content. Only the given fields change; the card's type, images and schedule stay as they are. The result must still be valid (e.g. a multiple-choice card needs at least 2 options and a correctOptionIndex within them).",
    inputSchema: {
      cardId: cardIdInput,
      question: z.string().min(1).optional(),
      answer: z.string().optional(),
      questionCode: z.string().optional().describe("Code cards only"),
      answerCode: z.string().optional().describe("Code cards only"),
      language: z.string().min(1).optional().describe("Code cards only"),
      options: z
        .array(z.string())
        .optional()
        .describe(
          "Multiple-choice cards only: all the options, replacing the current ones"
        ),
      correctOptionIndex: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe(
          "Multiple-choice cards only: zero-based index of the correct option"
        ),
      tags: z
        .array(z.string())
        .optional()
        .describe("All the tags, replacing the current ones"),
    },
    run: async ({ cardId, ...changes }, context) => {
      await client.mutation(api.cards.updateCard, {
        apiKey: context.apiKey,
        cardId: asCardId(cardId),
        ...changes,
      });
      return await fullCardView(context, cardId);
    },
  });

  registerTool(server, client, "move_card", {
    title: "Move card",
    description: "Move a card to another deck, or out of any deck.",
    inputSchema: {
      cardId: cardIdInput,
      deck: deckInput
        .nullable()
        .describe("Destination deck (name or id), or null for no deck"),
    },
    run: async ({ cardId, deck }, context) => {
      const target = deck ? findDeck(await loadDecks(context), deck) : null;
      await client.mutation(api.cards.moveCardToDeck, {
        apiKey: context.apiKey,
        cardId: asCardId(cardId),
        deckId: target?._id,
      });
      return { cardId, deck: target?.deckName ?? null };
    },
  });

  registerTool(server, client, "delete_card", {
    title: "Delete card",
    description:
      "Permanently delete a card. Get the user's explicit confirmation first.",
    inputSchema: { cardId: cardIdInput, confirm: confirmInput },
    annotations: { destructiveHint: true },
    run: async ({ cardId }, { apiKey }) => {
      await client.mutation(api.cards.deleteCard, {
        apiKey,
        cardId: asCardId(cardId),
      });
      return { deletedCardId: cardId };
    },
  });
}

export function registerLibraryTools(
  server: McpServer,
  client: ConvexHttpClient
) {
  registerDeckTools(server, client);
  registerCardTools(server, client);
}
