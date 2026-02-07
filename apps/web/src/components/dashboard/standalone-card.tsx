import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import {
  type Card as CardType,
  type CardType as CardTypeEnum,
  type Deck as DeckType,
  resolveCardType,
} from "@spaced-repetition-monorepo/backend/convex/types/convexTypes";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Code, FileText, FolderPlus, ListChecks, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

function StandaloneCardTypeIcon({ cardType }: { cardType: CardTypeEnum }) {
  switch (cardType) {
    case "code":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
          <Code className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "image":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50">
          <FileText className="h-4 w-4 text-purple-600" />
        </div>
      );
    case "mcq":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
          <ListChecks className="h-4 w-4 text-emerald-600" />
        </div>
      );
    case "text":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50">
          <FileText className="h-4 w-4 text-gray-600" />
        </div>
      );
    default: {
      const _exhaustive: never = cardType;
      throw new Error(`Unknown card type: ${_exhaustive}`);
    }
  }
}

type StandaloneCardProps = {
  card: CardType;
  onDeleteCard: (cardId: CardType["_id"]) => void;
};

export function StandaloneCard({ card, onDeleteCard }: StandaloneCardProps) {
  const { isAuthenticated } = useConvexAuth();
  const decks = useQuery(
    api.decks.getUserDecks,
    isAuthenticated ? undefined : "skip"
  );
  const moveCardToDeck = useMutation(api.cards.moveCardToDeck);

  const handleMoveToDeck = async (deckId: string) => {
    if (deckId === "none") {
      return;
    }
    await moveCardToDeck({
      cardId: card._id,
      deckId: deckId as DeckType["_id"],
    });
  };

  return (
    <div className="group flex w-full items-center justify-between rounded-lg border border-border/60 bg-gradient-to-r from-white to-gray-50/50 p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <div className="flex flex-1 items-center gap-3 text-wrap">
        <StandaloneCardTypeIcon cardType={resolveCardType(card)} />
        <div className="mr-12 flex flex-1 items-center gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight">
            {card.question}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-100 transition-opacity duration-200 group-hover:opacity-100">
        <Select onValueChange={handleMoveToDeck}>
          <SelectTrigger
            className="flex h-8 w-8 items-center justify-center"
            noIcon={true}
          >
            <FolderPlus className="h-8 w-8" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem disabled value="none">
              Move to deck...
            </SelectItem>
            {decks?.map((deck) => (
              <SelectItem key={deck._id} value={deck._id}>
                {deck.deckName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
          onClick={() => onDeleteCard(card._id)}
          size="sm"
          variant="neutral"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
