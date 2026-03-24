import { MINIMUM_DEBOUNCE_TIME, QUESTION_TYPES } from "@shared/types";
import { isImageFormData, isMcqFormData } from "@shared/types/form-data";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import type { Id } from "@spaced-repetition-monorepo/backend/convex/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formData, dispatch, handlers } = useCardForm();

  const isModalOpen = isOpen && type === "create-card";
  const createCard = useMutation(api.cards.createCard);
  const currentUser = useQuery(api.users.current, isModalOpen ? {} : "skip");

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

  const appliedQuestionTypeRef = useRef(false);
  if (isModalOpen && questionType && !appliedQuestionTypeRef.current) {
    appliedQuestionTypeRef.current = true;
    handlers.questionTypeChange(questionType);
  }
  if (!isModalOpen) {
    appliedQuestionTypeRef.current = false;
  }

  const currentQuestionType = formData.type;
  const canSubmit =
    !isSubmitting && currentUser !== null && currentUser !== undefined;

  const getCreateCardArgs = () => {
    const base = {
      question: formData.question,
      answer: formData.answer,
      deck: formData.deck,
      tags: formData.tags,
    };

    if (isImageFormData(formData)) {
      return {
        ...base,
        cardType: "image" as const,
        questionFile: (formData.questionFile || undefined) as Id<"_storage">,
        answerFile: (formData.answerFile || undefined) as Id<"_storage">,
      };
    }

    if (isMcqFormData(formData)) {
      return {
        ...base,
        cardType: "mcq" as const,
        options: formData.options,
        correctOptionIndex: formData.correctOptionIndex,
        answer:
          formData.answer ||
          formData.options.at(formData.correctOptionIndex) ||
          "",
      };
    }

    if (formData.type === "code") {
      return {
        ...base,
        cardType: "code" as const,
        language: formData.language,
        questionCode: formData.questionCode,
        answerCode: formData.answerCode,
      };
    }

    return {
      ...base,
      cardType: "text" as const,
    };
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setSubmitError("Please wait for your account to finish syncing.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await createCard(getCreateCardArgs());

      if (onSubmit) {
        await onSubmit();
      }
      navigate({ to: "/" });
      closeModal();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create card"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSubmitError(null);
    setIsSubmitting(false);
    onClose();
    dispatch({ type: "RESET" });
  };

  const questionForm = (() => {
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
  })();

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
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPES.map((qt) => (
              <Button
                key={qt}
                onClick={() => handlers.questionTypeChange(qt)}
                size="sm"
                type="button"
                variant={currentQuestionType === qt ? "noShadow" : "neutral"}
              >
                {t(`modals.createCard.${qt}Question`)}
              </Button>
            ))}
          </div>
          {questionForm}
          {submitError ? (
            <div className="text-red-600 text-sm">{submitError}</div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            disabled={isSubmitting}
            onClick={closeModal}
            variant="neutral"
          >
            {t("modals.createCard.cancel")}
          </Button>
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            {t("modals.createCard.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
