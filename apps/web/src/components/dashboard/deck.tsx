import type {
  Card as CardType,
  Deck as DeckType,
} from "@spaced-repetition-monorepo/backend/convex/types/convexTypes";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { Button } from "@/components/ui/button";
import { useStartReview } from "@/hooks/use-review-session";

type DeckProps = {
  deck: DeckType;
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
  const startReview = useStartReview();

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
                {cards.length} cards
                {deck.deckDescription && ` • ${deck.deckDescription}`}
              </p>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => startReview(cards)} size="sm">
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
