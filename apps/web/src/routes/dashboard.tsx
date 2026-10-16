import type {
  Card as CardData,
  Deck as DeckType,
} from "@spaced-repetition-monorepo/backend/convex/types/convexTypes";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CircleQuestionMark } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Deck } from "@/components/dashboard/deck";
import { StandaloneCard } from "@/components/dashboard/standalone-card";
import { StatsSection } from "@/components/home/stats-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeckDeletion } from "@/hooks/use-deck-delete";
import { useUserData } from "@/hooks/use-user-data";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const userData = useUserData();
  const { confirmDeleteDeck, confirmDeleteCard } = useDeckDeletion();

  const [expandedDeck, setExpandedDeck] = useState<DeckType["_id"] | null>(
    null
  );

  if (!userData) {
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

  const { cards: userCards, decks: userDecks, dueToday } = userData;

  const getCardsForDeck = (deckId: DeckType["_id"]) =>
    userCards.filter((card) => card.deckId === deckId);

  const toggleDeckExpansion = (deckId: DeckType["_id"]) => {
    setExpandedDeck(expandedDeck === deckId ? null : deckId);
  };

  const cardsWithoutDeck = userCards.filter(
    (card) => card.deckId === undefined
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsSection
          decks={userDecks.length}
          dueTodayCount={dueToday.length}
          totalCards={userCards.length}
        />
      </div>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t("dashboard.yourDecks")}
          </CardTitle>
          <CardDescription>{t("dashboard.manageDecks")}</CardDescription>
        </CardHeader>
        <CardContent>
          {userDecks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>{t("dashboard.noDecks")}</p>
              <p className="text-sm">{t("dashboard.createFirstCard")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userDecks.map((deck) => (
                <Deck
                  cards={getCardsForDeck(deck._id)}
                  deck={deck}
                  isExpanded={expandedDeck === deck._id}
                  key={deck._id}
                  onDeleteCard={confirmDeleteCard}
                  onDeleteDeck={confirmDeleteDeck}
                  onToggleExpansion={toggleDeckExpansion}
                />
              ))}
            </div>
          )}
          {cardsWithoutDeck.length > 0 && (
            <CardsWithoutDeck
              cards={cardsWithoutDeck}
              decks={userDecks}
              onDeleteCard={confirmDeleteCard}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CardsWithoutDeck({
  cards,
  decks,
  onDeleteCard,
}: {
  cards: CardData[];
  decks: DeckType[];
  onDeleteCard: (cardId: CardData["_id"]) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <CircleQuestionMark className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">
          {t("dashboard.cardsWithoutDeck")}
        </h3>
        <span className="text-gray-500 text-sm">
          {t("dashboard.cardsCount", { count: cards.length })}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {cards.map((card) => (
          <StandaloneCard
            card={card}
            decks={decks}
            key={card._id}
            onDeleteCard={onDeleteCard}
          />
        ))}
      </div>
    </div>
  );
}
