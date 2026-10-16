import type { Difficulty } from "@shared/types";
import {
  type Card as CardType,
  resolveCardType,
} from "@spaced-repetition-monorepo/backend/convex/types/convexTypes";
import { useTranslation } from "react-i18next";
import { AnswerText } from "@/components/flashcard/answer-flashcard";
import { CodeFlashCardContent } from "@/components/flashcard/code-flashcard-content";
import { DifficultyButtons } from "@/components/flashcard/difficulty-buttons";
import { ImageFlashCardContent } from "@/components/flashcard/image-flashcard-content";
import { McqFlashCardContent } from "@/components/flashcard/mcq-flashcard-content";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

/**
 * A card being reviewed. Reveal and rating state are owned by the caller (the
 * review session), so keyboard shortcuts and buttons stay in sync.
 */
type FlashCardProps = {
  card: CardType;
  /** 0-based position of this card in the session. */
  questionIndex: number;
  totalQuestions: number;
  showAnswer: boolean;
  onReveal: () => void;
  /** The rating being saved, or null to show the rating buttons. */
  pendingRating: Difficulty | null;
  onRate: (difficulty: Difficulty) => void;
};

/** The code or image attached to one side of a card, if any. */
function CardMedia({
  card,
  side,
}: {
  card: CardType;
  side: "question" | "answer";
}) {
  const cardType = resolveCardType(card);
  const code = side === "question" ? card.questionCode : card.answerCode;
  const file = side === "question" ? card.questionFile : card.answerFile;

  if (cardType === "code" && code) {
    return (
      <CodeFlashCardContent
        codeBlock={code}
        language={card.language || "text"}
      />
    );
  }
  if (cardType === "image" && file) {
    return <ImageFlashCardContent cardId={card._id} side={side} />;
  }
  return null;
}

export function FlashCard({
  card,
  questionIndex,
  totalQuestions,
  showAnswer,
  onReveal,
  pendingRating,
  onRate,
}: FlashCardProps) {
  const { t } = useTranslation();
  const isMcq = resolveCardType(card) === "mcq";

  return (
    <>
      <Card
        aria-labelledby="q-title"
        className="mx-auto w-full max-w-[min(880px,92vw)] bg-white shadow-lg"
        role="group"
      >
        <CardHeader className="space-y-2">
          <p className="font-medium text-muted-foreground text-sm">
            {t("flashcards.questionProgress", {
              current: questionIndex + 1,
              total: totalQuestions,
            })}
          </p>
          <h2 className="font-semibold text-3xl leading-tight" id="q-title">
            {card.question}
          </h2>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-[clamp(12px,2vw,20px)] pt-4 text-left sm:grid-cols-2">
          {isMcq ? (
            // Picking an option is what reveals an MCQ card's answer.
            <McqFlashCardContent
              correctOptionIndex={card.correctOptionIndex ?? 0}
              onAnswerSelected={onReveal}
              options={card.options ?? []}
            />
          ) : (
            <>
              <CardMedia card={card} side="question" />
              {showAnswer && <CardMedia card={card} side="answer" />}
            </>
          )}
        </CardContent>

        {showAnswer && card.answer && (
          <CardFooter className="flex justify-center pt-4">
            <AnswerText answer={card.answer} />
          </CardFooter>
        )}
        {!(showAnswer || isMcq) && (
          <CardFooter className="flex justify-center pt-4">
            <Button className="w-full max-w-md" onClick={onReveal}>
              {t("flashcards.showAnswer")}
            </Button>
          </CardFooter>
        )}
      </Card>

      {showAnswer && (
        <DifficultyButtons
          card={card}
          difficulty={pendingRating}
          onRate={onRate}
        />
      )}
    </>
  );
}
