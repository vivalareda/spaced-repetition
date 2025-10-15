import type { Deck as DeckType } from "@shared/types";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";
import { useConvexAuth, useQuery } from "convex/react";
import { BookOpen, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/hooks/use-modal-store";
import { useSessionStore } from "@/hooks/use-session-store";

export function ChooseDeckModal() {
  const { isOpen, type, onClose } = useModalStore();
  const isModalOpen = isOpen && type === "choose-deck";
  const { startSession } = useSessionStore();
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  const [selectedDeckId, setSelectedDeckId] = useState<DeckType["_id"] | null>(
    null
  );

  const cardsInSelectedDeck = useQuery(
    api.cards.getByDeckId,
    selectedDeckId ? { deckId: selectedDeckId } : "skip"
  );
  const userDecks = useQuery(
    api.decks.getUserDecks,
    isAuthenticated && isModalOpen ? undefined : "skip"
  );

  const handleDeckSelect = (deckId: DeckType["_id"]) => {
    if (!deckId) {
      return;
    }
    setSelectedDeckId(deckId);
  };

  useEffect(() => {
    if (
      selectedDeckId &&
      cardsInSelectedDeck &&
      cardsInSelectedDeck.length > 0
    ) {
      startSession(cardsInSelectedDeck);
      navigate({ to: "/review" });
      onClose();
      setSelectedDeckId(null);
    }
  }, [selectedDeckId, cardsInSelectedDeck, startSession, navigate, onClose]);

  return (
    <Dialog onOpenChange={onClose} open={isModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Choose a Deck
          </DialogTitle>
          <DialogDescription className="text-base">
            Select a deck to start your review session
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {userDecks?.map((deck) => (
            <Button
              className="group h-auto w-full justify-start p-4 transition-all hover:border-primary hover:bg-primary/5"
              key={deck._id}
              onClick={() => handleDeckSelect(deck._id)}
              variant="neutral"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col items-start gap-1 text-left">
                  <span className="font-semibold text-base group-hover:text-primary">
                    {deck.deckName}
                  </span>
                  {deck.deckDescription && (
                    <span className="text-muted-foreground text-sm">
                      {deck.deckDescription}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Users className="h-3 w-3" />
                  <span>Review</span>
                </div>
              </div>
            </Button>
          ))}
          {!userDecks || userDecks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium text-lg text-muted-foreground">
                No decks available
              </p>
              <p className="text-muted-foreground/70 text-sm">
                Create a deck first to start reviewing!
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
