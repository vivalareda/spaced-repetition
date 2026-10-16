import {
  CARD_TYPES,
  type CardType,
  type CodeFormData,
  changeCardType,
  emptyCardForm,
  type FormDataType,
  type ImageFormData,
  type McqFormData,
  patchCardForm,
  type TextFormData,
  toCardInput,
} from "@shared/types";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import type { Id } from "@spaced-repetition-monorepo/backend/convex/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";
import { CodeQuestionForm } from "@/components/modals/question-forms/code-question-form";
import { DeckSelect } from "@/components/modals/question-forms/deck-select";
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
import { useModalStore } from "@/hooks/use-modal-store";
import { useUserSynced } from "@/hooks/use-user-data";

export function CreateCardModal() {
  const { type, questionType, onSubmit, onClose } = useModalStore();

  // Mounted only while open, so every opening starts from a blank form.
  if (type !== "create-card") {
    return null;
  }
  return (
    <CreateCardDialog
      initialType={questionType ?? "text"}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

type CreateCardDialogProps = {
  initialType: CardType;
  onClose: () => void;
  /** Runs after the card is created; without it the app goes home. */
  onSubmit?: () => unknown;
};

function CreateCardDialog({
  initialType,
  onClose,
  onSubmit,
}: CreateCardDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createCard = useMutation(api.cards.createCard);
  // The backend rejects cards until the user's record exists.
  const isUserSynced = useUserSynced();
  const [form, setForm] = useState(() => emptyCardForm(initialType));
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const input = toCardInput(form);
      // Image ids are kept as plain strings in the form; they come from the
      // storage upload endpoint, so they are real storage ids.
      await createCard(
        input as typeof input & {
          questionFile?: Id<"_storage">;
          answerFile?: Id<"_storage">;
        }
      );
      if (onSubmit) {
        await onSubmit();
      } else {
        navigate({ to: "/" });
      }
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create card"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={onClose} open>
      <DialogContent
        className={`max-h-[85vh] overflow-y-auto ${
          form.type === "code"
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
            {CARD_TYPES.map((cardType) => (
              <Button
                key={cardType}
                onClick={() =>
                  setForm((current) => changeCardType(current, cardType))
                }
                size="sm"
                type="button"
                variant={form.type === cardType ? "noShadow" : "neutral"}
              >
                {t(`modals.createCard.${cardType}Question`)}
              </Button>
            ))}
          </div>
          <div className="grid gap-4">
            <CardTypeFields form={form} setForm={setForm} />
            <DeckSelect
              onSelect={(deck) => setForm((current) => ({ ...current, deck }))}
            />
          </div>
          {submitError ? (
            <div className="text-red-600 text-sm">{submitError}</div>
          ) : null}
        </div>

        <DialogFooter>
          <Button disabled={isSubmitting} onClick={onClose} variant="neutral">
            {t("modals.createCard.cancel")}
          </Button>
          <Button
            disabled={isSubmitting || !isUserSynced}
            onClick={handleSubmit}
          >
            {t("modals.createCard.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** The inputs specific to the form's card type, plus question and answer. */
function CardTypeFields({
  form,
  setForm,
}: {
  form: FormDataType;
  setForm: Dispatch<SetStateAction<FormDataType>>;
}) {
  // Patches apply to the latest form state, since some (uploads) land late.
  const patcher =
    <Form extends FormDataType>(type: Form["type"]) =>
    (patch: Partial<Omit<Form, "type">>) =>
      setForm((current) => patchCardForm<Form>(current, type, patch));

  switch (form.type) {
    case "text":
      return (
        <TextQuestionForm
          form={form}
          onChange={patcher<TextFormData>("text")}
        />
      );
    case "code":
      return (
        <CodeQuestionForm
          form={form}
          onChange={patcher<CodeFormData>("code")}
        />
      );
    case "image":
      return (
        <ImageQuestionForm
          form={form}
          onChange={patcher<ImageFormData>("image")}
        />
      );
    case "mcq":
      return (
        <McqQuestionForm form={form} onChange={patcher<McqFormData>("mcq")} />
      );
    default:
      throw new Error(`Unknown card type: ${form satisfies never}`);
  }
}
