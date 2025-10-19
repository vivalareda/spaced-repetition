import type { ImageFormData } from "@shared/types";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DropdownMenu } from "@/components/dropdown-menu";
import { FileUploadModal } from "@/components/modals/file-upload-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ImageQuestionFormProps = {
  formData: ImageFormData;
  userDecks: string[] | undefined;
  onFileUploadSave: (
    storageId: string,
    uploadFor: "question" | "answer"
  ) => void;
  onDeckSelect: (deck: string) => void;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export function ImageQuestionForm({
  formData,
  userDecks,
  onFileUploadSave,
  onFieldChange,
  onDeckSelect,
}: ImageQuestionFormProps) {
  const { t } = useTranslation();
  const generateUploadUrl = useMutation(api.cards.generateUploadUrl);
  const [fileUploadTarget, setFileUploadTarget] = useState<
    "question" | "answer" | null
  >(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUploadClick = (target: "question" | "answer") => {
    setFileUploadTarget(target);
    setUploadError(null);
  };

  const handleFileUploadClose = () => {
    setFileUploadTarget(null);
    setUploadError(null);
  };

  const handleFileUploadSave = async (
    file: File,
    uploadFor: "question" | "answer"
  ) => {
    try {
      const uploadUrl = await generateUploadUrl({
        fileSize: file.size,
        fileType: file.type,
      });

      if (!uploadUrl) {
        throw new Error("Failed to generate upload URL");
      }

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      const { storageId } = await result.json();
      onFileUploadSave(storageId, uploadFor);
      setFileUploadTarget(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("modals.createCard.uploadFailed");
      setUploadError(errorMessage);
    }
  };

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="question">
            {t("modals.createCard.questionLabel")}
          </Label>
          <Input
            id="question"
            onChange={onFieldChange}
            required
            value={formData.question}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="answer">{t("modals.createCard.answerLabel")}</Label>
          <Textarea
            id="answer"
            onChange={onFieldChange}
            required
            rows={3}
            value={formData.answer}
          />
        </div>

        <div className="grid gap-2">
          <Label>{t("modals.createCard.addImageFileLabel")}</Label>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleFileUploadClick("question")}
              size="sm"
              type="button"
              variant="neutral"
            >
              {formData.questionFile
                ? t("modals.createCard.editQuestionFile")
                : t("modals.createCard.addQuestionFile")}
            </Button>
            <Button
              onClick={() => handleFileUploadClick("answer")}
              size="sm"
              type="button"
              variant="neutral"
            >
              {formData.answerFile
                ? t("modals.createCard.editAnswerFile")
                : t("modals.createCard.addAnswerFile")}
            </Button>
          </div>
          {uploadError && (
            <div className="text-red-600 text-sm">{uploadError}</div>
          )}
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

      <FileUploadModal
        isOpen={fileUploadTarget ? { uploadFor: fileUploadTarget } : null}
        onClose={handleFileUploadClose}
        onSave={handleFileUploadSave}
      />
    </>
  );
}
