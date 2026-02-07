import { CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const LETTER_A_CODE_POINT = 65;

type McqOptionIndicatorProps = {
  index: number;
  selectedIndex: number | null;
  correctOptionIndex: number;
};

function getIndicatorStyle(
  index: number,
  selectedIndex: number | null,
  correctOptionIndex: number
) {
  if (selectedIndex !== null && index === correctOptionIndex) {
    return "border-green-500 bg-green-100 text-green-700";
  }
  if (selectedIndex === index) {
    return "border-red-500 bg-red-100 text-red-700";
  }
  return "border-border bg-white text-foreground/70";
}

function McqOptionIndicator({
  index,
  selectedIndex,
  correctOptionIndex,
}: McqOptionIndicatorProps) {
  const isCorrectAndRevealed =
    selectedIndex !== null && index === correctOptionIndex;
  const isWrongSelection =
    selectedIndex === index && selectedIndex !== correctOptionIndex;

  const style = getIndicatorStyle(index, selectedIndex, correctOptionIndex);

  if (isCorrectAndRevealed) {
    return (
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-medium text-sm ${style}`}
      >
        <CircleCheck className="h-4 w-4" />
      </span>
    );
  }

  if (isWrongSelection) {
    return (
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-medium text-sm ${style}`}
      >
        <CircleX className="h-4 w-4" />
      </span>
    );
  }

  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-medium text-sm ${style}`}
    >
      {String.fromCodePoint(LETTER_A_CODE_POINT + index)}
    </span>
  );
}

type McqFlashCardContentProps = {
  options: string[];
  correctOptionIndex: number;
  onAnswerSelected: () => void;
};

export function McqFlashCardContent({
  options,
  correctOptionIndex,
  onAnswerSelected,
}: McqFlashCardContentProps) {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) {
      return;
    }
    setSelectedIndex(index);
    onAnswerSelected();
  };

  const getOptionStyle = (index: number) => {
    if (selectedIndex === null) {
      return "border-border bg-secondary-background hover:border-primary/40 hover:bg-primary/5 cursor-pointer";
    }
    if (index === correctOptionIndex) {
      return "border-green-500 bg-green-50 text-green-800";
    }
    if (index === selectedIndex) {
      return "border-red-500 bg-red-50 text-red-800";
    }
    return "border-border bg-secondary-background opacity-50";
  };

  return (
    <div className="col-span-full flex flex-col gap-3">
      <p className="font-medium text-foreground/70 text-sm">
        {t("flashcards.mcq.selectAnswer")}
      </p>
      {options.map((option, index) => (
        <button
          aria-label={`${t("flashcards.mcq.option")} ${String.fromCodePoint(LETTER_A_CODE_POINT + index)}: ${option}`}
          className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${getOptionStyle(index)}`}
          disabled={selectedIndex !== null}
          key={`review-opt-${String.fromCodePoint(LETTER_A_CODE_POINT + index)}`}
          onClick={() => handleSelect(index)}
          type="button"
        >
          <McqOptionIndicator
            correctOptionIndex={correctOptionIndex}
            index={index}
            selectedIndex={selectedIndex}
          />
          <span className="flex-1">{option}</span>
        </button>
      ))}
    </div>
  );
}
