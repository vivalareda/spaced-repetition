import { type Difficulty, RATINGS, schedule } from "@shared/types";
import type { Card } from "@spaced-repetition-monorepo/backend/convex/types/convexTypes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

// Buttons are shown easiest-first; RATINGS is ordered hardest-first.
const BUTTON_ORDER = [...RATINGS].reverse();

const BUTTON_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-300",
  medium: "bg-orange-300",
  hard: "bg-red-400",
  again: "bg-gray-300",
};

/** Days until the next review if `card` were rated `rating` now. */
function previewIntervalDays(card: Card, rating: Difficulty) {
  return schedule(card, rating, Date.now()).intervalDays;
}

const formatDaysText = (days: number) => `${days}d`;

type DifficultyButtonsProps = {
  card: Card;
  difficulty: Difficulty | null;
  onDifficultyClick: (
    cardId: Card["_id"],
    questionDifficulty: Difficulty
  ) => void;
};

export function DifficultyButtons({
  card,
  difficulty,
  onDifficultyClick,
}: DifficultyButtonsProps) {
  const { t } = useTranslation();

  if (difficulty) {
    return (
      <div className="flex w-full justify-center p-4 pt-12">
        <div className="fade-in animate-in text-center duration-200">
          <p className="font-medium text-gray-700 text-lg">
            {t("flashcards.difficulty.nextReview")} in{" "}
            {formatDaysText(previewIntervalDays(card, difficulty))}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 pt-12 opacity-100 transition-opacity duration-200 sm:flex-row md:gap-12 md:p-4">
      {BUTTON_ORDER.map((rating) => (
        <Button
          className={`fade-in slide-in-from-bottom-10 col-span-1 w-34 animate-in duration-500 ${BUTTON_COLORS[rating]}`}
          key={rating}
          onClick={() => onDifficultyClick(card._id, rating)}
          variant="default"
        >
          {t(`flashcards.difficulty.${rating}`)} (
          {formatDaysText(previewIntervalDays(card, rating))})
        </Button>
      ))}
    </div>
  );
}
