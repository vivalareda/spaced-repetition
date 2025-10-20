import { MINIMUM_DEBOUNCE_TIME, QUESTION_TYPES } from "@shared/types";
import { isImageFormData } from "@shared/types/form-data";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import type { Id } from "@spaced-repetition-monorepo/backend/convex/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CodeQuestionForm } from "@/components/modals/question-forms/code-question-form";
import { ImageQuestionForm } from "@/components/modals/question-forms/image-question-form";
import { TextQuestionForm } from "@/components/modals/question-forms/text-question-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCardForm } from "@/hooks/use-card-form";
import { useModalStore } from "@/hooks/use-modal-store";

export function CreateCardModal() {
  const { t } = useTranslation();
  const { onSubmit, isOpen, onClose, type } = useModalStore();
  const navigate = useNavigate();
  const [shouldFetchDecks, setShouldFetchDecks] = useState(false);
  const { formData, dispatch, handlers } = useCardForm();

  const isModalOpen = isOpen && type === "create-card";
  const createCard = useMutation(api.cards.createCard);

  const shouldQuery = isModalOpen && shouldFetchDecks;
  const userDecks = useQuery(
    api.decks.getUserDecksNames,
    shouldQuery ? {} : "skip"
  );

  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        setShouldFetchDecks(true);
      }, MINIMUM_DEBOUNCE_TIME);

      return () => clearTimeout(timer);
    }
    setShouldFetchDecks(false);
  }, [isModalOpen]);

  const currentQuestionType = formData.type;

  const handleSubmit = () => {
    const { type: _, ...dataWithoutType } = formData;

    const sanitizedData = isImageFormData(formData)
      ? {
          ...dataWithoutType,
          questionFile: (formData.questionFile || undefined) as Id<"_storage">,
          answerFile: (formData.answerFile || undefined) as Id<"_storage">,
        }
      : dataWithoutType;

    createCard(sanitizedData);

    if (onSubmit) {
      onSubmit();
    }
    navigate({ to: "/" });
    closeModal();
  };

  const closeModal = () => {
    onClose();
    dispatch({ type: "RESET" });
  };

  const renderQuestionForm = () => {
    switch (formData.type) {
      case "code":
        return (
          <CodeQuestionForm
            formData={formData}
            onAnswerCodeChange={handlers.answerCodeChange}
            onDeckSelect={handlers.deckSelect}
            onFieldChange={handlers.fieldChange}
            onLanguageChange={handlers.languageChange}
            onQuestionCodeChange={handlers.questionCodeChange}
            userDecks={userDecks}
          />
        );
      case "image":
        return (
          <ImageQuestionForm
            formData={formData}
            onDeckSelect={handlers.deckSelect}
            onFieldChange={handlers.fieldChange}
            onFileUploadSave={handlers.fileUploadSave}
            userDecks={userDecks}
          />
        );
      case "text":
        return (
          <TextQuestionForm
            formData={formData}
            onDeckSelect={handlers.deckSelect}
            onFieldChange={handlers.fieldChange}
            userDecks={userDecks}
          />
        );
      default:
        throw new Error(`Invalid type, ${formData satisfies never}`);
    }
  };

  const renderQuestionButtons = () =>
    QUESTION_TYPES.map((qt) => (
      <Button
        key={qt}
        onClick={() => handlers.questionTypeChange(qt)}
        size="sm"
        type="button"
        variant={currentQuestionType === qt ? "noShadow" : "neutral"}
      >
        {t(`modals.createCard.${qt}Question`)}
      </Button>
    ));

  return (
    <Dialog onOpenChange={closeModal} open={isModalOpen}>
      <DialogContent
        className={`max-h-[85vh] overflow-y-auto ${
          currentQuestionType === "code"
            ? "max-w-4xl sm:max-w-2xl"
            : "max-w-2xl sm:max-w-xl"
        }`}
      >
        <DialogHeader>
          <DialogTitle>{t("modals.createCard.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.createCard.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">{renderQuestionButtons()}</div>
          {renderQuestionForm()}
        </div>

        <DialogFooter>
          <Button onClick={closeModal} variant="neutral">
            {t("modals.createCard.cancel")}
          </Button>
          <Button onClick={handleSubmit}>
            {t("modals.createCard.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
