import type { Difficulty } from "@shared/types";
import {
  type Card as CardType,
  isCodeCard,
  isImageCard,
} from "@spaced-repetition-monorepo/backend/convex/types/convex-types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnswerFlashCard } from "@/components/flashcard/answer-flashcard";
import { CodeFlashCardContent } from "@/components/flashcard/code-flashcard-content";
import { DifficultyButtons } from "@/components/flashcard/difficulty-buttons";
import { ImageFlashCardContent } from "@/components/flashcard/image-flashcard-content";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

type FlashCardProps = {
  type: "text" | "code" | "image";
  card: CardType;
  totalQuestions: number;
  correctAnswer: string;
  questionIndex: number;
  onDifficultyClick: (cardId: CardType["_id"], difficulty: Difficulty) => void;
};

function FlashCardQuestion({ card }: { card: CardType }) {
  const handleCopyCodeBlock = (codeBlock: string, language: string) => {
    const formatedCodeBlock = `\`\`\`${language}\n${codeBlock}\n\`\`\``;
    navigator.clipboard.writeText(formatedCodeBlock);
  };

  if (isCodeCard(card) && card.answerCode) {
    return (
      <CodeFlashCardContent
        codeBlock={card.questionCode}
        handleCopyCodeBlock={handleCopyCodeBlock}
        language={card.language}
        showCopyCodeBlockTooltip={true}
      />
    );
  }

  if (isImageCard(card) && card.questionFile) {
    return <ImageFlashCardContent imageStorageId={card.questionFile} />;
  }

  return null;
}

function FlashCardAnswer({
  card,
  showAnswer,
}: {
  card: CardType;
  showAnswer: boolean;
}) {
  const handleCopyCodeBlock = (codeBlock: string, language: string) => {
    const formatedCodeBlock = `\`\`\`${language}\n${codeBlock}\n\`\`\``;
    navigator.clipboard.writeText(formatedCodeBlock);
  };

  if (showAnswer && isCodeCard(card) && card.answerCode) {
    return (
      <CodeFlashCardContent
        codeBlock={card.answerCode}
        handleCopyCodeBlock={handleCopyCodeBlock}
        language={card.language || "text"}
        showCopyCodeBlockTooltip={true}
      />
    );
  }

  if (isImageCard(card) && card.answerFile) {
    return <ImageFlashCardContent imageStorageId={card.answerFile} />;
  }

  return null;
}

const getCorrectAnswerText = (correctAnswer: string) => {
  const parts = correctAnswer.split(/(\*\*.*?\*\*)/g);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={part}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export function FlashCard(props: FlashCardProps) {
  const { t } = useTranslation();
  const {
    card,
    totalQuestions,
    correctAnswer,
    onDifficultyClick,
    questionIndex,
  } = props;

  const [showAnswer, setShowAnswer] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const handleDifficultyClick = (
    cardId: CardType["_id"],
    questionDifficulty: Difficulty
  ) => {
    setDifficulty(questionDifficulty);
    onDifficultyClick(cardId, questionDifficulty);
  };

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
          <FlashCardQuestion card={card} />
          <FlashCardAnswer card={card} showAnswer={showAnswer} />
        </CardContent>

        <CardFooter className="flex justify-center pt-4">
          <AnswerFlashCard
            getCorrectAnswerText={() => getCorrectAnswerText(correctAnswer)}
            setShowAnswer={setShowAnswer}
            showAnswer={showAnswer}
          />
        </CardFooter>
      </Card>

      {showAnswer && (
        <DifficultyButtons
          card={card}
          difficulty={difficulty}
          onDifficultyClick={handleDifficultyClick}
        />
      )}
    </>
  );
}
