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
  const { isOpen, type, onClose, onSubmit } = useModalStore();
  const isModalOpen = isOpen && type === "confirm";

  if (!isModalOpen) {
    return null;
  }

  const handleSubmit = async () => {
    await onSubmit?.();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog onOpenChange={onClose} open={isModalOpen}>
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
          <div className="flex items-center justify-end gap-2">
            <Button className="w-full" onClick={handleCancel} variant="neutral">
              {t("modals.confirmation.cancel")}
            </Button>
            <Button className="w-full" onClick={handleSubmit}>
              {t("modals.confirmation.confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
