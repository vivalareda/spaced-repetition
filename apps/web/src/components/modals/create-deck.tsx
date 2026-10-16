import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { type ChangeEvent, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useModalStore } from "@/hooks/use-modal-store";

const EMPTY_FORM = { deckName: "", deckDescription: "" };

export function CreateDeckModal() {
  const { t } = useTranslation();
  const { onSubmit, onClose, type } = useModalStore();
  const navigate = useNavigate();
  const createDeck = useMutation(api.decks.createDeck);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [hasFailed, setHasFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isModalOpen = type === "create-deck";

  if (!isModalOpen) {
    return null;
  }

  const closeModal = () => {
    setFormData(EMPTY_FORM);
    setHasFailed(false);
    onClose();
  };

  // The backend rejects empty and duplicate names; keep the modal open so the
  // user can fix the name.
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setHasFailed(false);
    try {
      await createDeck(formData);
      if (onSubmit) {
        await onSubmit();
      } else {
        navigate({ to: "/" });
      }
      closeModal();
    } catch {
      setHasFailed(true);
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <Dialog onOpenChange={closeModal} open={isModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("modals.createDeck.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.createDeck.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="deckName">{t("modals.createDeck.nameLabel")}</Label>
            <Input
              id="deckName"
              onChange={handleChange}
              required
              value={formData.deckName}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deckDescription">
              {t("modals.createDeck.descriptionLabel")}
            </Label>
            <Textarea
              id="deckDescription"
              onChange={handleChange}
              value={formData.deckDescription}
            />
          </div>
          {hasFailed && (
            <p className="text-red-600 text-sm">
              {t("modals.createDeck.error")}
            </p>
          )}
          <DialogFooter>
            <Button onClick={closeModal}>
              {t("modals.createDeck.cancel")}
            </Button>
            <Button
              disabled={isSubmitting || formData.deckName.trim() === ""}
              onClick={handleSubmit}
            >
              {t("modals.createDeck.create")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
