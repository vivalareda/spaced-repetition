import type { McqFormData } from "@shared/types";
import { CircleCheck, Plus, Trash2 } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const LETTER_A_CODE_POINT = 65;

type McqQuestionFormProps = {
  form: McqFormData;
  onChange: (patch: Partial<McqFormData>) => void;
};

export function McqQuestionForm({ form, onChange }: McqQuestionFormProps) {
  const { t } = useTranslation();
  const nextKeyId = useRef(form.options.length);
  const optionKeys = useRef<string[]>(form.options.map((_, i) => `opt-${i}`));

  const handleOptionChange = (index: number, value: string) => {
    const options = [...form.options];
    options[index] = value;
    onChange({ options });
  };

  const handleAddOption = () => {
    if (form.options.length >= MAX_OPTIONS) {
      return;
    }
    nextKeyId.current += 1;
    optionKeys.current = [...optionKeys.current, `opt-${nextKeyId.current}`];
    onChange({ options: [...form.options, ""] });
  };

  const handleRemoveOption = (index: number) => {
    if (form.options.length <= MIN_OPTIONS) {
      return;
    }
    optionKeys.current = optionKeys.current.filter((_, i) => i !== index);
    // Keep pointing at the same option; removing the correct one resets to A.
    const { correctOptionIndex } = form;
    let newCorrectIndex = correctOptionIndex;
    if (correctOptionIndex === index) {
      newCorrectIndex = 0;
    } else if (correctOptionIndex > index) {
      newCorrectIndex = correctOptionIndex - 1;
    }
    onChange({
      options: form.options.filter((_, i) => i !== index),
      correctOptionIndex: newCorrectIndex,
    });
  };

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="question">{t("modals.createCard.questionLabel")}</Label>
        <Input
          id="question"
          onChange={(event) => onChange({ question: event.target.value })}
          required
          value={form.question}
        />
      </div>

      <div className="grid gap-2">
        <Label>{t("modals.createCard.optionsLabel")}</Label>
        <div className="flex flex-col gap-2">
          {form.options.map((option, index) => (
            <div
              className="flex items-center gap-2"
              key={optionKeys.current.at(index)}
            >
              <button
                aria-label={
                  form.correctOptionIndex === index
                    ? t("modals.createCard.correctOptionSelected", {
                        index: index + 1,
                      })
                    : t("modals.createCard.markCorrectOption", {
                        index: index + 1,
                      })
                }
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  form.correctOptionIndex === index
                    ? "border-green-500 bg-green-50 text-green-600"
                    : "border-border bg-secondary-background text-foreground/50 hover:border-green-300 hover:bg-green-50/50"
                }`}
                onClick={() => onChange({ correctOptionIndex: index })}
                type="button"
              >
                {form.correctOptionIndex === index ? (
                  <CircleCheck className="h-4 w-4" />
                ) : (
                  <span className="font-medium text-xs">
                    {String.fromCodePoint(LETTER_A_CODE_POINT + index)}
                  </span>
                )}
              </button>
              <Input
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={t("modals.createCard.optionPlaceholder", {
                  letter: String.fromCodePoint(LETTER_A_CODE_POINT + index),
                })}
                value={option}
              />
              {form.options.length > MIN_OPTIONS && (
                <Button
                  className="h-8 w-8 shrink-0 p-0"
                  onClick={() => handleRemoveOption(index)}
                  size="sm"
                  type="button"
                  variant="neutral"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {form.options.length < MAX_OPTIONS && (
          <Button
            className="mt-1 w-fit"
            onClick={handleAddOption}
            size="sm"
            type="button"
            variant="neutral"
          >
            <Plus className="mr-1 h-4 w-4" />
            {t("modals.createCard.addOption")}
          </Button>
        )}
        <p className="text-foreground/60 text-xs">
          {t("modals.createCard.mcqHint")}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="answer">
          {t("modals.createCard.answerExplanationLabel")}
        </Label>
        <Input
          id="answer"
          onChange={(event) => onChange({ answer: event.target.value })}
          placeholder={t("modals.createCard.answerExplanationPlaceholder")}
          value={form.answer}
        />
      </div>
    </>
  );
}
