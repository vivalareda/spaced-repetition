import { validateImageFile } from "@shared/types";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type FileUploadModalProps = {
  onClose: () => void;
  /** Uploads the picked image; a rejection is shown and keeps the modal open. */
  onSave: (file: File) => Promise<void>;
};

/**
 * Picks an allowed image and uploads it, closing only once the upload
 * succeeds. Render it only while open, so each opening starts fresh.
 */
export function FileUploadModal({ onClose, onSave }: FileUploadModalProps) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const validation = validateImageFile(file);
    setSelectedFile(validation.valid ? file : null);
    setError(validation.valid ? null : validation.error);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      await onSave(selectedFile);
      setIsUploading(false);
      onClose();
    } catch (uploadError) {
      setIsUploading(false);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : t("modals.createCard.uploadFailed")
      );
    }
  };

  return (
    <Dialog
      // An upload in flight can't be dismissed, so its result always lands.
      onOpenChange={() => !isUploading && onClose()}
      open
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("modals.fileUpload.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="file">{t("modals.fileUpload.selectLabel")}</Label>
            <input
              accept="image/*"
              className="hidden"
              id="file"
              onChange={handleFileSelect}
              ref={fileInputRef}
              type="file"
            />
            <Button
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              type="button"
              variant="neutral"
            >
              {t("modals.fileUpload.browse")}
            </Button>
            {selectedFile && (
              <div className="text-gray-600 text-sm">
                {t("modals.fileUpload.selected", {
                  fileName: selectedFile.name,
                })}
              </div>
            )}
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isUploading} onClick={onClose} variant="neutral">
            {t("modals.fileUpload.cancel")}
          </Button>
          <Button
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
          >
            {isUploading
              ? t("modals.fileUpload.uploading")
              : t("modals.fileUpload.upload")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
