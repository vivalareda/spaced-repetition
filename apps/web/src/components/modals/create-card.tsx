import { MINIMUM_DEBOUNCE_TIME } from "@shared/types";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { type ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { CodeQuestionForm } from "./question-forms/code-question-form";
import { TextQuestionForm } from "./question-forms/text-question-form";

export function CreateCardModal() {
  const { t } = useTranslation();
  const { onSubmit, isOpen, onClose, type } = useModalStore();
  const navigate = useNavigate();
  const [shouldFetchDecks, setShouldFetchDecks] = useState(false);

  const isModalOpen = isOpen && type === "create-card";
  const createCard = useMutation(api.cards.createCard);
  const [isCodeQuestion, setIsCodeQuestion] = useState(false);

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

  const [formData, setFormData] = useState({
    question: "",
    questionCode: "",
    answer: "",
    answerCode: "",
    language: "",
    deck: "",
    tags: [],
  });

  const handleSubmit = () => {
    createCard(formData);
    if (onSubmit) {
      onSubmit();
    }
    navigate({ to: "/" });
    closeModal();
  };

  const closeModal = () => {
    onClose();
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.id;
    const value = event.target.value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDeckSelect = (deck: string) => {
    setFormData((prevState) => ({
      ...prevState,
      deck,
    }));
  };

  const handleLanguageChange = (language: string) => {
    setFormData((prevState) => ({
      ...prevState,
      language,
    }));
  };

  const handleQuestionCodeChange = (code: string) => {
    setFormData((prevState) => ({
      ...prevState,
      questionCode: code,
    }));
  };

  const handleAnswerCodeChange = (code: string) => {
    setFormData((prevState) => ({
      ...prevState,
      answerCode: code,
    }));
  };

  return (
    <Dialog onOpenChange={closeModal} open={isModalOpen}>
      <DialogContent
        className={`max-h-[85vh] overflow-y-auto ${
          isCodeQuestion ? "max-w-4xl sm:max-w-2xl" : "max-w-2xl sm:max-w-xl"
        }`}
      >
        <DialogHeader>
          <DialogTitle>{t("modals.createCard.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.createCard.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCodeQuestion(false)}
              size="sm"
              type="button"
              variant={isCodeQuestion ? "neutral" : "noShadow"}
            >
              {t("modals.createCard.textQuestion")}
            </Button>
            <Button
              onClick={() => setIsCodeQuestion(true)}
              size="sm"
              type="button"
              variant={isCodeQuestion ? "noShadow" : "neutral"}
            >
              {t("modals.createCard.codeQuestion")}
            </Button>
          </div>

          {isCodeQuestion ? (
            <CodeQuestionForm
              formData={formData}
              onAnswerCodeChange={handleAnswerCodeChange}
              onDeckSelect={handleDeckSelect}
              onFieldChange={handleChange}
              onLanguageChange={handleLanguageChange}
              onQuestionCodeChange={handleQuestionCodeChange}
              userDecks={userDecks}
            />
          ) : (
            <TextQuestionForm
              formData={formData}
              onDeckSelect={handleDeckSelect}
              onFieldChange={handleChange}
              userDecks={userDecks}
            />
          )}
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
