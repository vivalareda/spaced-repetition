import {
  type CodeFormData,
  type FormDataType,
  MINIMUM_DEBOUNCE_TIME,
  QUESTION_TYPES,
} from "@shared/types";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { type ChangeEvent, useEffect, useState } from "react";
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

export function CreateCardModal() {
  const { t } = useTranslation();
  const { onSubmit, isOpen, onClose, type } = useModalStore();
  const navigate = useNavigate();
  const [shouldFetchDecks, setShouldFetchDecks] = useState(false);

  const isModalOpen = isOpen && type === "create-card";
  const createCard = useMutation(api.cards.createCard);
  const [questionType, setQuestionType] =
    useState<(typeof QUESTION_TYPES)[number]>("text");

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

  const [formData, setFormData] = useState<FormDataType>({
    type: "text",
    question: "",
    answer: "",
    deck: "",
    tags: [],
  });

  const handleQuestionTypeChange = (
    newType: (typeof QUESTION_TYPES)[number]
  ) => {
    setQuestionType(newType);
    switch (newType) {
      case "code":
        setFormData({
          ...formData,
          type: "code",
          questionCode: "",
          answerCode: "",
          language: "",
          answer: "",
        });

        break;
      case "image":
        setFormData({
          ...formData,
          type: "image",
          questionFile: "",
          answerFile: "",
          answer: "",
        });
        break;
      case "text":
        setFormData({
          ...formData,
          type: "text",
          answer: "",
        });
        break;
      default:
        throw new Error(`Invalid type, ${newType satisfies never}`);
    }
  };

  const handleSubmit = () => {
    const { type: _, ...dataWithoutType } = formData;

    const sanitizedData = {
      ...dataWithoutType,
      questionFile: dataWithoutType.questionFile || undefined,
      answerFile: dataWithoutType.answerFile || undefined,
    };

    createCard(sanitizedData);
    if (onSubmit) {
      onSubmit();
    }
    navigate({ to: "/" });
    closeModal();
  };

  const closeModal = () => {
    onClose();
    setFormData({
      type: "text",
      question: "",
      answer: "",
      deck: "",
      tags: [],
      questionCode: "",
      answerCode: "",
      language: "",
      questionFile: "",
      answerFile: "",
    });
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.id;
    const value = event.target.value;

    setFormData((prevState: FormDataType) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDeckSelect = (deck: string) => {
    setFormData((prevState: FormDataType) => ({
      ...prevState,
      deck,
    }));
  };

  const handleLanguageChange = (language: string) => {
    setFormData((prevState: CodeFormData) => ({
      ...prevState,
      language,
    }));
  };

  const handleQuestionCodeChange = (code: string) => {
    setFormData((prevState: FormDataType) => ({
      ...prevState,
      questionCode: code,
    }));
  };

  const handleAnswerCodeChange = (code: string) => {
    setFormData((prevState: FormDataType) => ({
      ...prevState,
      answerCode: code,
    }));
  };

  const handleFileUploadSave = (
    storageId: string,
    uploadFor: "question" | "answer"
  ) => {
    if (uploadFor === "question") {
      setFormData((prevState: FormDataType) => ({
        ...prevState,
        questionFile: storageId,
      }));
    }

    if (uploadFor === "answer") {
      setFormData((prevState: FormDataType) => ({
        ...prevState,
        answerFile: storageId,
      }));
    }
  };

  const renderQuestionForm = () => {
    switch (questionType) {
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
        throw new Error(`Invalid type, ${questionType satisfies never}`);
    }
  };

  const renderQuestionButtons = () =>
    QUESTION_TYPES.map((qt) => (
      <Button
        key={qt}
        onClick={() => handleQuestionTypeChange(qt)}
        size="sm"
        type="button"
        variant={questionType === qt ? "noShadow" : "neutral"}
      >
        {t(`modals.createCard.${qt}Question`)}
      </Button>
    ));

  return (
    <Dialog onOpenChange={closeModal} open={isModalOpen}>
      <DialogContent
        className={`max-h-[85vh] overflow-y-auto ${
          questionType === "code"
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
