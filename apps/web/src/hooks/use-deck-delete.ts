import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import type {
  Card,
  Deck,
} from "@spaced-repetition-monorepo/backend/convex/types/convexTypes";
import { useMutation } from "convex/react";
import { useModalStore } from "./use-modal-store";

/** Delete actions that ask for confirmation first; the confirmation modal reports failures. */
export function useDeckDeletion() {
  const { onOpen } = useModalStore();
  const deleteDeck = useMutation(api.decks.deleteDeck);
  const deleteCard = useMutation(api.cards.deleteCard);

  const confirmDeleteDeck = (deckId: Deck["_id"]) => {
    onOpen("confirm", { onSubmit: () => deleteDeck({ deckId }) });
  };

  const confirmDeleteCard = (cardId: Card["_id"]) => {
    onOpen("confirm", { onSubmit: () => deleteCard({ cardId }) });
  };

  return { confirmDeleteDeck, confirmDeleteCard };
}
