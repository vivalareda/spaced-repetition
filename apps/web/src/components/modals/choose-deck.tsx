import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import type { Deck } from "@spaced-repetition-monorepo/backend/convex/types/convexTypes";
import { BookOpen, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/hooks/use-modal-store";
import { useStartReview } from "@/hooks/use-review-session";
import { useUserQuery } from "@/hooks/use-user-data";

export function ChooseDeckModal() {
  const { t } = useTranslation();
  const { type, onClose } = useModalStore();
  const isModalOpen = type === "choose-deck";
  const startReview = useStartReview();
  // The deck the user last picked that turned out to have no cards.
  const [emptyDeckName, setEmptyDeckName] = useState<string | null>(null);

  const userDecks = useUserQuery(
    api.decks.getUserDecks,
    isModalOpen ? {} : "skip"
  );
  const userCards = useUserQuery(api.cards.get, isModalOpen ? {} : "skip");

  const handleClose = () => {
    setEmptyDeckName(null);
    onClose();
  };

  const handleDeckSelect = (deck: Deck) => {
    const deckCards =
      userCards?.filter((card) => card.deckId === deck._id) ?? [];
    if (deckCards.length === 0) {
      setEmptyDeckName(deck.deckName);
      return;
    }
    startReview(deckCards);
    handleClose();
  };

  return (
    <Dialog onOpenChange={handleClose} open={isModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            {t("modals.chooseDeck.title")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t("modals.chooseDeck.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {emptyDeckName && (
            <p className="rounded-lg border border-orange-300 bg-orange-50 p-3 text-orange-800 text-sm">
              {t("modals.chooseDeck.emptyDeck", { deckName: emptyDeckName })}
            </p>
          )}
          {userDecks?.map((deck) => (
            <Button
              className="group h-auto w-full justify-start p-4 transition-all hover:border-primary hover:bg-primary/5"
              disabled={userCards === undefined}
              key={deck._id}
              onClick={() => handleDeckSelect(deck)}
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
                  <span>{t("modals.chooseDeck.review")}</span>
                </div>
              </div>
            </Button>
          ))}
          {userDecks?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium text-lg text-muted-foreground">
                {t("modals.chooseDeck.noDecks")}
              </p>
              <p className="text-muted-foreground/70 text-sm">
                {t("modals.chooseDeck.createDeckFirst")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
