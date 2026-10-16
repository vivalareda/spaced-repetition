import { CircleCheck, CircleX } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

const LETTER_A_CODE_POINT = 65;

type OptionState = "unanswered" | "correct" | "wrong" | "other";

/** How option `index` shows once `selectedIndex` (null: not yet) is picked. */
function getOptionState(
  index: number,
  selectedIndex: number | null,
  correctOptionIndex: number
): OptionState {
  if (selectedIndex === null) {
    return "unanswered";
  }
  if (index === correctOptionIndex) {
    return "correct";
  }
  return index === selectedIndex ? "wrong" : "other";
}

const OPTION_STYLES: Record<OptionState, string> = {
  unanswered:
    "border-border bg-secondary-background hover:border-primary/40 hover:bg-primary/5 cursor-pointer",
  correct: "border-green-500 bg-green-50 text-green-800",
  wrong: "border-red-500 bg-red-50 text-red-800",
  other: "border-border bg-secondary-background opacity-50",
};

const INDICATOR_STYLES: Record<OptionState, string> = {
  unanswered: "border-border bg-white text-foreground/70",
  correct: "border-green-500 bg-green-100 text-green-700",
  wrong: "border-red-500 bg-red-100 text-red-700",
  other: "border-border bg-white text-foreground/70",
};

function optionLetter(index: number) {
  return String.fromCodePoint(LETTER_A_CODE_POINT + index);
}

function McqOptionIndicator({
  index,
  state,
}: {
  index: number;
  state: OptionState;
}) {
  let content: ReactNode = optionLetter(index);
  if (state === "correct") {
    content = <CircleCheck className="h-4 w-4" />;
  } else if (state === "wrong") {
    content = <CircleX className="h-4 w-4" />;
  }

  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-medium text-sm ${INDICATOR_STYLES[state]}`}
    >
      {content}
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

  return (
    <div className="col-span-full flex flex-col gap-3">
      <p className="font-medium text-foreground/70 text-sm">
        {t("flashcards.mcq.selectAnswer")}
      </p>
      {options.map((option, index) => {
        const state = getOptionState(index, selectedIndex, correctOptionIndex);
        return (
          <button
            aria-label={`${t("flashcards.mcq.option")} ${optionLetter(index)}: ${option}`}
            className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${OPTION_STYLES[state]}`}
            disabled={selectedIndex !== null}
            key={`review-opt-${optionLetter(index)}`}
            onClick={() => handleSelect(index)}
            type="button"
          >
            <McqOptionIndicator index={index} state={state} />
            <span className="flex-1">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
