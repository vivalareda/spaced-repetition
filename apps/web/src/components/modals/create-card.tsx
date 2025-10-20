import type { FormDataType } from "@shared/types";
import { MINIMUM_DEBOUNCE_TIME, QUESTION_TYPES } from "@shared/types";
import { isImageFormData } from "@shared/types/form-data";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import type { Id } from "@spaced-repetition-monorepo/backend/convex/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { type ChangeEvent, useEffect, useReducer, useState } from "react";
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
import { useModalStore } from "@/hooks/use-modal-store";

type FormAction =
  | { type: "CHANGE_TYPE"; payload: "text" | "code" | "image" }
  | { type: "UPDATE_FIELD"; payload: { field: string; value: string } }
  | { type: "SET_DECK"; payload: string }
  | {
      type: "SET_FILE";
      payload: { field: "questionFile" | "answerFile"; value: string };
    }
  | { type: "RESET" };

export function CreateCardModal() {
  const { t } = useTranslation();
  const { onSubmit, isOpen, onClose, type } = useModalStore();
  const navigate = useNavigate();
  const [shouldFetchDecks, setShouldFetchDecks] = useState(false);

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

  const formReducer = (
    state: FormDataType,
    action: FormAction
  ): FormDataType => {
    switch (action.type) {
      case "CHANGE_TYPE":
        switch (action.payload) {
          case "code":
            return {
              type: "code",
              questionCode: "",
              answerCode: "",
              language: "",
              deck: state.deck,
              tags: state.tags,
              question: state.question,
              answer: state.answer,
            };
          case "image":
            return {
              type: "image",
              questionFile: "",
              answerFile: "",
              answer: state.answer,
              deck: state.deck,
              tags: state.tags,
              question: state.question,
            };
          case "text":
            return {
              type: "text",
              question: state.question,
              answer: state.answer,
              deck: state.deck,
              tags: state.tags,
            };
          default:
            throw new Error(`Invalid type, ${action satisfies never}`);
        }
      case "UPDATE_FIELD":
        return {
          ...state,
          [action.payload.field]: action.payload.value,
        };
      case "SET_DECK":
        return {
          ...state,
          deck: action.payload,
        };
      case "RESET":
        return {
          type: "text",
          question: "",
          answer: "",
          deck: "",
          tags: [],
        };
      case "SET_FILE":
        return {
          ...state,
          [action.payload.field]: action.payload.value,
        };
      default:
        throw new Error(`Invalid action type, ${action satisfies never}`);
    }
  };

  const [formData, dispatch] = useReducer(formReducer, {
    type: "text",
    question: "",
    answer: "",
    deck: "",
    tags: [],
  });

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

  const handleQuestionTypeChange = (
    newType: (typeof QUESTION_TYPES)[number]
  ) => {
    dispatch({ type: "CHANGE_TYPE", payload: newType });
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.id;
    const value = event.target.value;
    dispatch({
      type: "UPDATE_FIELD",
      payload: { field: name, value },
    });
  };

  const handleDeckSelect = (deck: string) => {
    dispatch({ type: "SET_DECK", payload: deck });
  };

  const handleLanguageChange = (language: string) => {
    dispatch({
      type: "UPDATE_FIELD",
      payload: { field: "language", value: language },
    });
  };

  const handleQuestionCodeChange = (code: string) => {
    dispatch({
      type: "UPDATE_FIELD",
      payload: { field: "questionCode", value: code },
    });
  };

  const handleAnswerCodeChange = (code: string) => {
    dispatch({
      type: "UPDATE_FIELD",
      payload: { field: "answerCode", value: code },
    });
  };

  const handleFileUploadSave = (
    storageId: string,
    uploadFor: "question" | "answer"
  ) => {
    const field = uploadFor === "question" ? "questionFile" : "answerFile";
    dispatch({
      type: "SET_FILE",
      payload: { field, value: storageId },
    });
  };

  const renderQuestionForm = () => {
    switch (formData.type) {
      case "code":
        return (
          <CodeQuestionForm
            formData={formData}
            onAnswerCodeChange={handleAnswerCodeChange}
            onDeckSelect={handleDeckSelect}
            onFieldChange={handleChange}
            onLanguageChange={handleLanguageChange}
            onQuestionCodeChange={handleQuestionCodeChange}
            userDecks={userDecks}
          />
        );
      case "image":
        return (
          <ImageQuestionForm
            formData={formData}
            onDeckSelect={handleDeckSelect}
            onFieldChange={handleChange}
            onFileUploadSave={handleFileUploadSave}
            userDecks={userDecks}
          />
        );
      case "text":
        return (
          <TextQuestionForm
            formData={formData}
            onDeckSelect={handleDeckSelect}
            onFieldChange={handleChange}
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
        onClick={() => handleQuestionTypeChange(qt)}
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
