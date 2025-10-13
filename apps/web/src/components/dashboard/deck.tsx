import type { Card as CardType, Deck as DeckType } from "@shared/types";
import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/hooks/use-session-store";
import { Card } from "./card";

type DeckWithCards = {
  _id: DeckType["_id"];
  deckName: string;
  deckDescription?: string;
  cardCount: number;
};

type DeckProps = {
  deck: DeckWithCards;
  isExpanded: boolean;
  cards: CardType[];
  onToggleExpansion: (deckId: DeckType["_id"]) => void;
  onDeleteDeck: (deckId: DeckType["_id"]) => void;
  onDeleteCard: (cardId: CardType["_id"]) => void;
};

export function Deck({
  deck,
  isExpanded,
  cards,
  onToggleExpansion,
  onDeleteDeck,
  onDeleteCard,
}: DeckProps) {
  const { startSession } = useSessionStore();
  const navigate = useNavigate();

  const handleStartReviewSession = () => {
    startSession(cards);
    navigate({ to: "/review" });
  };

  return (
    <div className="rounded-lg border" key={deck._id}>
      <div className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <button
              className="flex-1 text-left"
              onClick={() => onToggleExpansion(deck._id)}
              type="button"
            >
              <h3 className="font-semibold">{deck.deckName}</h3>
              <p className="text-muted-foreground text-sm">
                {deck.cardCount} cards
                {deck.deckDescription && ` • ${deck.deckDescription}`}
              </p>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleStartReviewSession} size="sm">
            Review Deck
          </Button>
          <Button onClick={() => onToggleExpansion(deck._id)} size="sm">
            {isExpanded ? "Hide" : "View"} Cards
          </Button>
          <Button
            onClick={() => onDeleteDeck(deck._id)}
            size="sm"
            variant="neutral"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-muted/20 p-4">
          <div className="space-y-3">
            {cards.map((card) => (
              <Card card={card} key={card._id} onDeleteCard={onDeleteCard} />
            ))}
            {cards.length === 0 && (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No cards in this deck yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
