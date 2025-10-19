import type { Card, Deck } from "@shared/types";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useModalStore } from "./use-modal-store";

export function useDeckDeletion() {
  const { onOpen } = useModalStore();
  const deleteDeck = useMutation(api.decks.deleteDeck);
  const deleteCard = useMutation(api.cards.deleteCard);

  const confirmDeleteDeck = (deckId: Deck["_id"]) => {
    onOpen("confirm", true, () => {
      deleteDeck({ deckId });
    });
  };

  const confirmDeleteCard = (cardId: Card["_id"]) => {
    onOpen("confirm", true, () => {
      deleteCard({ cardId });
    });
  };

  return { confirmDeleteDeck, confirmDeleteCard };
}
