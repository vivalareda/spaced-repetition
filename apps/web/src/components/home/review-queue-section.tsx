import type { Card, Deck } from "@shared/types";
import { useTranslation } from "react-i18next";

type ReviewQueueListProps = {
  cards: Card[];
  userDecks: Deck[];
  emptyMessage: string;
};

export function ReviewQueueList({
  cards,
  userDecks,
  emptyMessage,
}: ReviewQueueListProps) {
  if (cards.length === 0) {
    return <p className="text-foreground/70 text-sm">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-4">
      {cards.map((card) => (
        <ReviewQueueCard card={card} key={card._id} userDecks={userDecks} />
      ))}
    </ul>
  );
}

type ReviewQueueCardProps = {
  card: Card;
  userDecks?: Deck[];
};

function ReviewQueueCard({ card, userDecks }: ReviewQueueCardProps) {
  const { t } = useTranslation();

  const deckName =
    userDecks?.find((deck) => deck._id === card.deckId)?.deckName ||
    t("index.reviewQueue.unclassified");

  const repetitionLabel =
    card.repetitions === 1
      ? t("index.reviewQueue.repetition")
      : t("index.reviewQueue.repetitions");

  return (
    <li className="rounded-2xl border border-border/60 bg-secondary-background/60 p-4 backdrop-blur">
      <p className="font-medium text-foreground">{card.question}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-foreground/70 text-xs">
        <span className="inline-flex items-center rounded-full bg-main/10 px-2 py-0.5 font-medium text-main">
          {deckName}
        </span>
        <span>
          {card.repetitions} {repetitionLabel}
        </span>
      </div>
    </li>
  );
}
