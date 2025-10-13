import type { Card as CardType, Difficulty } from "@shared/types";
import { isCodeCard } from "@shared/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnswerFlashCard } from "@/components/flashcard/answer-flashcard";
import { CodeFlashCardContent } from "@/components/flashcard/code-flashcard-content";
import { DifficultyButtons } from "@/components/flashcard/difficulty-buttons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

type FlashCardProps = {
  type: "text" | "code";
  card: CardType;
  totalQuestions: number;
  correctAnswer: string;
  questionIndex: number;
  onDifficultyClick: (cardId: CardType["_id"], difficulty: Difficulty) => void;
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

  const getCorrectAnswerText = () => {
    const parts = correctAnswer.split(/(\*\*.*?\*\*)/g);

    return parts.map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={part}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleCopyCodeBlock = (codeBlock: string, language: string) => {
    const formatedCodeBlock = `\`\`\`${language}\n${codeBlock}\n\`\`\``;
    navigator.clipboard.writeText(formatedCodeBlock);
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
          {isCodeCard(card) && card.questionCode ? (
            <CodeFlashCardContent
              codeBlock={card.questionCode}
              handleCopyCodeBlock={handleCopyCodeBlock}
              language={card.language || "text"}
              showAnswer={showAnswer}
            />
          ) : null}
          {showAnswer && isCodeCard(card) && card.answerCode ? (
            <CodeFlashCardContent
              codeBlock={card.answerCode}
              handleCopyCodeBlock={handleCopyCodeBlock}
              language={card.language || "text"}
              showAnswer={showAnswer}
            />
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
          <AnswerFlashCard
            getCorrectAnswerText={getCorrectAnswerText}
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

// {
//   /* {options.map((option) => ( */
// }
//
// {
//   /*   <Button */
// }
//
// {
//   /*     className={cn( */
// }
//
// {
//   /*       getPostSelectionButtonColor(option), */
// }
//
// {
//   /*       "w-full cursor-pointer rounded-lg border-2 border-border p-4 text-left transition-all duration-200 hover:border-primary/50 hover:bg-accent disabled:opacity-80" */
// }
//
// {
//   /*     )} */
// }
//
// {
//   /*     disabled={selected !== null} */
// }
//
// {
//   /*     key={option} */
// }
//
// {
//   /*     onClick={() => handleClick(option)} */
// }
//
// {
//   /*   > */
// }
//
// {
//   /*     <div className="flex items-center gap-3"> */
// }
//
// {
//   /*       <span className="text-base">{option}</span> */
// }
//
// {
//   /*     </div> */
// }
//
// {
//   /*   </Button> */
// }
//
// {
//   /* ))} */
// }
