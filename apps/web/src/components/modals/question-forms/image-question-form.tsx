import type { ImageFormData } from "@shared/types";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileUploadModal } from "@/components/modals/file-upload-modal";
import { TextQuestionForm } from "@/components/modals/question-forms/text-question-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Side = "question" | "answer";

type ImageQuestionFormProps = {
  form: ImageFormData;
  onChange: (patch: Partial<ImageFormData>) => void;
};

export function ImageQuestionForm({ form, onChange }: ImageQuestionFormProps) {
  const { t } = useTranslation();
  const generateUploadUrl = useMutation(api.cards.generateUploadUrl);
  const [uploadSide, setUploadSide] = useState<Side | null>(null);

  // Uploads straight to Convex storage; the card only keeps the storage id.
  // Errors propagate to the upload modal, which shows them.
  const uploadImage = async (file: File, side: Side) => {
    const uploadUrl = await generateUploadUrl({
      fileSize: file.size,
      fileType: file.type,
    });
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!result.ok) {
      throw new Error(t("modals.createCard.uploadFailed"));
    }
    const { storageId } = await result.json();
    onChange(
      side === "question"
        ? { questionFile: storageId }
        : { answerFile: storageId }
    );
  };

  return (
    <>
      <TextQuestionForm form={form} onChange={onChange} />

      <div className="grid gap-2">
        <Label>{t("modals.createCard.addImageFileLabel")}</Label>
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => setUploadSide("question")}
            size="sm"
            type="button"
            variant="neutral"
          >
            {form.questionFile
              ? t("modals.createCard.editQuestionFile")
              : t("modals.createCard.addQuestionFile")}
          </Button>
          <Button
            onClick={() => setUploadSide("answer")}
            size="sm"
            type="button"
            variant="neutral"
          >
            {form.answerFile
              ? t("modals.createCard.editAnswerFile")
              : t("modals.createCard.addAnswerFile")}
          </Button>
        </div>
      </div>

      {uploadSide && (
        <FileUploadModal
          onClose={() => setUploadSide(null)}
          onSave={(file) => uploadImage(file, uploadSide)}
        />
      )}
    </>
  );
}
