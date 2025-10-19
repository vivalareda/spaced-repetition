import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

type AnswerFlashCardProps = {
  showAnswer: boolean;
  setShowAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  getCorrectAnswerText: () => (string | JSX.Element)[];
};

export function AnswerFlashCard({
  showAnswer,
  setShowAnswer,
  getCorrectAnswerText,
}: AnswerFlashCardProps) {
  const { t } = useTranslation();

  return (
    <>
      {showAnswer ? (
        <div className="fade-in slide-in-from-bottom-10 w-full max-w-2xl animate-in rounded-lg border-2 border-primary/20 bg-white/50 p-6 text-center duration-500">
          <p className="text-lg leading-relaxed">{getCorrectAnswerText()}</p>
        </div>
      ) : (
        <Button className="w-full max-w-md" onClick={() => setShowAnswer(true)}>
          {t("flashcards.showAnswer")}
        </Button>
      )}
    </>
  );
}
