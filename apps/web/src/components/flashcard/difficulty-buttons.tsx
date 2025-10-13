import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { Card, Difficulty } from "@/types";

const HARD_DIFFICULTY_MULTIPLIER = 1.2;
const EASY_DIFFICULTY_MULTIPLIER = 1.3;

const LEARNING_STEP_1 = 1;
const LEARNING_STEP_2 = 6;

const HARD_LEARNING_STEP_1 = 1;
const HARD_LEARNING_STEP_2 = 3;

const EASY_LEARNING_STEP_1 = 4;
const EASY_LEARNING_STEP_2 = 10;

const AGAIN_INTERVAL = 1;

function getDaysCount(
  difficulty: Difficulty,
  currentEaseFactor: number,
  currentIntervalDays: number,
  repetitions: number
) {
  switch (difficulty) {
    case "again":
      return AGAIN_INTERVAL;
    case "hard":
      if (repetitions === 0) {
        return HARD_LEARNING_STEP_1;
      }
      if (repetitions === 1) {
        return HARD_LEARNING_STEP_2;
      }
      return Math.max(
        Math.round(currentIntervalDays * HARD_DIFFICULTY_MULTIPLIER),
        currentIntervalDays + 1
      );
    case "medium":
      if (repetitions === 0) {
        return LEARNING_STEP_1;
      }
      if (repetitions === 1) {
        return LEARNING_STEP_2;
      }
      return Math.round(currentIntervalDays * currentEaseFactor);
    case "easy":
      if (repetitions === 0) {
        return EASY_LEARNING_STEP_1;
      }
      if (repetitions === 1) {
        return EASY_LEARNING_STEP_2;
      }
      return Math.round(
        currentIntervalDays * currentEaseFactor * EASY_DIFFICULTY_MULTIPLIER
      );
    default:
      throw new Error(`Difficulty ${difficulty satisfies never} not supported`);
  }
}

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

  const formatDaysText = (days: number) => `${days}d`;

  if (difficulty) {
    const selectedDays = getDaysCount(
      difficulty,
      card.easeFactor,
      card.intervalDays,
      card.repetitions
    );

    return (
      <div className="flex w-full justify-center p-4 pt-12">
        <div className="fade-in animate-in text-center duration-500">
          <p className="font-medium text-gray-700 text-lg">
            {t("flashcards.difficulty.nextReview")} in{" "}
            {formatDaysText(selectedDays)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-4 pt-12 transition-opacity duration-300 sm:flex-row md:gap-12 md:p-4 ${difficulty ? "opacity-0" : "opacity-100"}`}
    >
      <Button
        className="fade-in slide-in-from-bottom-10 col-span-1 w-34 animate-in bg-green-300 duration-500"
        onClick={() => onDifficultyClick(card._id, "easy")}
        variant="default"
      >
        {t("flashcards.difficulty.easy")} (
        {formatDaysText(
          getDaysCount(
            "easy",
            card.easeFactor,
            card.intervalDays,
            card.repetitions
          )
        )}
        )
      </Button>
      <Button
        className="fade-in slide-in-from-bottom-10 col-span-1 w-34 animate-in bg-orange-300 duration-500"
        onClick={() => onDifficultyClick(card._id, "medium")}
        variant="default"
      >
        {t("flashcards.difficulty.medium")} (
        {formatDaysText(
          getDaysCount(
            "medium",
            card.easeFactor,
            card.intervalDays,
            card.repetitions
          )
        )}
        )
      </Button>
      <Button
        className="fade-in slide-in-from-bottom-10 col-span-1 w-34 animate-in bg-red-400 duration-500"
        onClick={() => onDifficultyClick(card._id, "hard")}
        variant="default"
      >
        {t("flashcards.difficulty.hard")} (
        {formatDaysText(
          getDaysCount(
            "hard",
            card.easeFactor,
            card.intervalDays,
            card.repetitions
          )
        )}
        )
      </Button>
      <Button
        className="fade-in slide-in-from-bottom-10 col-span-1 w-34 animate-in bg-gray-300 duration-500"
        onClick={() => onDifficultyClick(card._id, "again")}
        variant="default"
      >
        {t("flashcards.difficulty.again")} (
        {formatDaysText(
          getDaysCount(
            "again",
            card.easeFactor,
            card.intervalDays,
            card.repetitions
          )
        )}
        )
      </Button>
    </div>
  );
}
