import { MINIMUM_DEBOUNCE_TIME, QUESTION_TYPES } from "@shared/types";
import { isImageFormData, isMcqFormData } from "@shared/types/form-data";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import type { Id } from "@spaced-repetition-monorepo/backend/convex/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CodeQuestionForm } from "@/components/modals/question-forms/code-question-form";
import { ImageQuestionForm } from "@/components/modals/question-forms/image-question-form";
import { McqQuestionForm } from "@/components/modals/question-forms/mcq-question-form";
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
  const { onSubmit, isOpen, onClose, type, questionType } = useModalStore();
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

  useEffect(() => {
    if (isModalOpen && questionType) {
      handlers.questionTypeChange(questionType);
    }
  }, [isModalOpen, questionType, handlers]);

  const currentQuestionType = formData.type;

  const handleSubmit = () => {
    const base = {
      question: formData.question,
      answer: formData.answer,
      deck: formData.deck,
      tags: formData.tags,
    };

    if (isImageFormData(formData)) {
      createCard({
        ...base,
        cardType: "image",
        questionFile: (formData.questionFile || undefined) as Id<"_storage">,
        answerFile: (formData.answerFile || undefined) as Id<"_storage">,
      });
    } else if (isMcqFormData(formData)) {
      createCard({
        ...base,
        cardType: "mcq",
        options: formData.options,
        correctOptionIndex: formData.correctOptionIndex,
        answer:
          formData.answer ||
          formData.options.at(formData.correctOptionIndex) ||
          "",
      });
    } else if (formData.type === "code") {
      createCard({
        ...base,
        cardType: "code",
        language: formData.language,
        questionCode: formData.questionCode,
        answerCode: formData.answerCode,
      });
    } else {
      createCard({
        ...base,
        cardType: "text",
      });
    }

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
      case "mcq":
        return (
          <McqQuestionForm
            formData={formData}
            onCorrectOptionChange={handlers.correctOptionChange}
            onDeckSelect={handlers.deckSelect}
            onFieldChange={handlers.fieldChange}
            onOptionsChange={handlers.optionsChange}
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
          <div className="flex flex-wrap gap-2">{renderQuestionButtons()}</div>
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
