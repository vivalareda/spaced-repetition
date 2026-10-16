import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/hooks/use-modal-store";

export function ConfirmationModal() {
  const { t } = useTranslation();
  const { type, onClose, onSubmit } = useModalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const isModalOpen = type === "confirm";

  if (!isModalOpen) {
    return null;
  }

  const handleClose = () => {
    setHasFailed(false);
    onClose();
  };

  // Stays open on failure so the user sees the error and can retry or cancel.
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setHasFailed(false);
    try {
      await onSubmit?.();
      handleClose();
    } catch {
      setHasFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={handleClose} open={isModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <p className="font-semibold text-base">
              {t("modals.confirmation.title")}
            </p>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <p className="text-base">{t("modals.confirmation.description")}</p>
          {hasFailed && (
            <p className="text-red-600 text-sm">
              {t("modals.confirmation.error")}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button className="w-full" onClick={handleClose} variant="neutral">
              {t("modals.confirmation.cancel")}
            </Button>
            <Button
              className="w-full"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {t("modals.confirmation.confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
