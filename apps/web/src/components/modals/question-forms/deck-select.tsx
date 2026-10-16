import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useTranslation } from "react-i18next";
import { DropdownMenu } from "@/components/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useUserQuery } from "@/hooks/use-user-data";

/** Picks one of the user's decks by name. */
export function DeckSelect({ onSelect }: { onSelect: (deck: string) => void }) {
  const { t } = useTranslation();
  const decks = useUserQuery(api.decks.getUserDecks, {});

  return (
    <div className="grid gap-2">
      <Label htmlFor="deck">{t("modals.createCard.deckLabel")}</Label>
      <DropdownMenu
        items={decks?.map((deck) => deck.deckName)}
        onSelect={onSelect}
        placeholder={
          decks?.length === 0
            ? t("modals.createCard.noDeckCreated")
            : t("modals.createCard.selectDeck")
        }
      />
    </div>
  );
}
