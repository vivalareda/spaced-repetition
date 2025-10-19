import { validateImageFile } from "@shared/types";
import { useEffect, useRef, useState } from "react";
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
  isOpen: { uploadFor: "question" | "answer" } | null;
  onClose: () => void;
  onSave: (file: File, uploadFor: "question" | "answer") => void;
};

export function FileUploadModal({
  isOpen,
  onClose,
  onSave,
}: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setError(null);
    }
  }, [isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (validation.valid) {
        setError(null);
        setSelectedFile(file);
      } else {
        setError(validation.error);
        setSelectedFile(null);
      }
    }
  };

  const handleSave = () => {
    if (!(isOpen && selectedFile)) {
      return;
    }
    onSave(selectedFile, isOpen.uploadFor);
    handleClose();
  };

  const handleCancel = () => {
    handleClose();
    onClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen !== null}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Select Image File</Label>
            <input
              accept="image/*"
              className="hidden"
              id="file"
              onChange={handleFileSelect}
              ref={fileInputRef}
              type="file"
            />
            <Button
              onClick={handleBrowseClick}
              size="sm"
              type="button"
              variant="neutral"
            >
              Browse Files
            </Button>
            {selectedFile && (
              <div className="text-gray-600 text-sm">
                Selected: {selectedFile.name}
              </div>
            )}
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCancel} variant="neutral">
            Cancel
          </Button>
          <Button disabled={!selectedFile || !!error} onClick={handleSave}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
