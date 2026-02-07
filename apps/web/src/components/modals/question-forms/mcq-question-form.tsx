import type { McqFormData } from "@shared/types";
import { CircleCheck, Plus, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { DropdownMenu } from "@/components/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const LETTER_A_CODE_POINT = 65;

type McqQuestionFormProps = {
  formData: McqFormData;
  userDecks: string[] | undefined;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onDeckSelect: (deck: string) => void;
  onOptionsChange: (options: string[]) => void;
  onCorrectOptionChange: (index: number) => void;
};

export function McqQuestionForm({
  formData,
  userDecks,
  onFieldChange,
  onDeckSelect,
  onOptionsChange,
  onCorrectOptionChange,
}: McqQuestionFormProps) {
  const { t } = useTranslation();
  const nextKeyId = useRef(formData.options.length);
  const optionKeys = useRef<string[]>(
    formData.options.map((_, i) => `opt-${i}`)
  );

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...formData.options];
    updated[index] = value;
    onOptionsChange(updated);
  };

  const handleAddOption = () => {
    if (formData.options.length >= MAX_OPTIONS) {
      return;
    }
    nextKeyId.current += 1;
    optionKeys.current = [...optionKeys.current, `opt-${nextKeyId.current}`];
    onOptionsChange([...formData.options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length <= MIN_OPTIONS) {
      return;
    }
    const updated = formData.options.filter((_, i) => i !== index);
    optionKeys.current = optionKeys.current.filter((_, i) => i !== index);
    onOptionsChange(updated);

    if (formData.correctOptionIndex === index) {
      onCorrectOptionChange(0);
    } else if (formData.correctOptionIndex > index) {
      onCorrectOptionChange(formData.correctOptionIndex - 1);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="question">{t("modals.createCard.questionLabel")}</Label>
        <Input
          id="question"
          onChange={onFieldChange}
          required
          value={formData.question}
        />
      </div>

      <div className="grid gap-2">
        <Label>{t("modals.createCard.optionsLabel")}</Label>
        <div className="flex flex-col gap-2">
          {formData.options.map((option, index) => (
            <div
              className="flex items-center gap-2"
              key={optionKeys.current.at(index)}
            >
              <button
                aria-label={
                  formData.correctOptionIndex === index
                    ? t("modals.createCard.correctOptionSelected", {
                        index: index + 1,
                      })
                    : t("modals.createCard.markCorrectOption", {
                        index: index + 1,
                      })
                }
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  formData.correctOptionIndex === index
                    ? "border-green-500 bg-green-50 text-green-600"
                    : "border-border bg-secondary-background text-foreground/50 hover:border-green-300 hover:bg-green-50/50"
                }`}
                onClick={() => onCorrectOptionChange(index)}
                type="button"
              >
                {formData.correctOptionIndex === index ? (
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
              {formData.options.length > MIN_OPTIONS && (
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
        {formData.options.length < MAX_OPTIONS && (
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
          onChange={onFieldChange}
          placeholder={t("modals.createCard.answerExplanationPlaceholder")}
          value={formData.answer}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="deck">{t("modals.createCard.deckLabel")}</Label>
        <DropdownMenu
          items={userDecks}
          onSelect={onDeckSelect}
          placeholder={
            userDecks?.length === 0
              ? t("modals.createCard.noDeckCreated")
              : t("modals.createCard.selectDeck")
          }
        />
      </div>
    </div>
  );
}
