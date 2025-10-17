import { convexQuery } from "@convex-dev/react-query";
import type { Card as CardType, Deck as DeckType } from "@shared/types";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { BookOpen, CircleQuestionMark } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Deck } from "@/components/dashboard/deck";
import { StandaloneCard } from "@/components/dashboard/standalone-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useModalStore } from "@/hooks/use-modal-store";
import { useUserData } from "@/hooks/use-user-data";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/hero" });
    }
  },
  loader: async ({ context }) => {
    if (context.userSynced) {
      await context.queryClient.prefetchQuery(
        convexQuery(api.decks.getDecksWithCardCount, {})
      );
    }
  },
});

function RouteComponent() {
  const { t } = useTranslation();
  const { onOpen } = useModalStore();
  const { userCards, userDecksWithCardCount } = useUserData();

  const deleteDeck = useMutation(api.decks.deleteDeck);
  const deleteCard = useMutation(api.cards.deleteCard);

  const [expandedDeck, setExpandedDeck] = useState<DeckType["_id"] | null>(
    null
  );

  if (userDecksWithCardCount === undefined || userCards === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Card className="w-full max-w-md border-border/60 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl">
              {t("dashboard.loading.title")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.loading.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full w-1/3 animate-pulse bg-main" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDeleteDeck = async (deckId: DeckType["_id"]) => {
    await deleteDeck({ deckId });
  };

  const handleDeleteCard = async (cardId: CardType["_id"]) => {
    await deleteCard({ cardId });
  };

  const handleOpenConfirmationDeck = (deckId: DeckType["_id"]) => {
    onOpen("confirm", true, () => handleDeleteDeck(deckId));
  };

  const handleOpenConfirmationCard = (cardId: CardType["_id"]) => {
    onOpen("confirm", true, () => handleDeleteCard(cardId));
  };

  const getCardsForDeck = (deckId: DeckType["_id"]) =>
    userCards.filter((card) => card.deckId === deckId);

  const toggleDeckExpansion = (deckId: DeckType["_id"]) => {
    setExpandedDeck(expandedDeck === deckId ? null : deckId);
  };

  const renderCardsWithoutDeck = () => {
    const cardsWithoutDeck = userCards.filter(
      (card) => card.deckId === undefined
    );
    if (cardsWithoutDeck.length === 0) {
      return null;
    }
    return (
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <CircleQuestionMark className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            {t("dashboard.cardsWithoutDeck")}
          </h3>
          <span className="text-gray-500 text-sm">
            {t("dashboard.cardsCount", { count: cardsWithoutDeck.length })}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {cardsWithoutDeck.map((card) => (
            <StandaloneCard
              card={card}
              key={card._id}
              onDeleteCard={handleOpenConfirmationCard}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t("dashboard.yourDecks")}
          </CardTitle>
          <CardDescription>{t("dashboard.manageDecks")}</CardDescription>
        </CardHeader>
        <CardContent>
          {userDecksWithCardCount.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>{t("dashboard.noDecks")}</p>
              <p className="text-sm">{t("dashboard.createFirstCard")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userDecksWithCardCount.map((deck) => (
                <Deck
                  cards={getCardsForDeck(deck._id)}
                  deck={deck}
                  isExpanded={expandedDeck === deck._id}
                  key={deck._id}
                  onDeleteCard={handleOpenConfirmationCard}
                  onDeleteDeck={handleOpenConfirmationDeck}
                  onToggleExpansion={toggleDeckExpansion}
                />
              ))}
            </div>
          )}
          {renderCardsWithoutDeck()}
        </CardContent>
      </Card>
    </div>
  );
}
