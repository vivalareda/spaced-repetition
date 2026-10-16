import { lazy, Suspense, useState } from "react";
import { Combobox } from "@/components/combobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type CodeEditorModalProps = {
  isOpen: boolean;
  /** The snippet and language the editor starts with each time it opens. */
  code: string;
  language: string;
  onClose: () => void;
  onSave: (language: string, code: string) => void;
};

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "zig", label: "Zig" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
];

const Editor = lazy(() => import("@monaco-editor/react"));

export function CodeEditorModal({ isOpen, ...props }: CodeEditorModalProps) {
  return (
    <Dialog onOpenChange={props.onClose} open={isOpen}>
      {isOpen && <CodeEditorModalContent {...props} />}
    </Dialog>
  );
}

// Mounted only while open, so the draft restarts from the saved code each time.
function CodeEditorModalContent({
  code: initialCode,
  language,
  onClose,
  onSave,
}: Omit<CodeEditorModalProps, "isOpen">) {
  const [currentLanguage, setLanguage] = useState(language);
  const [code, setCode] = useState(initialCode);

  const handleSave = () => {
    onSave(currentLanguage, code);
    onClose();
  };

  return (
    <DialogContent className="max-h-[70vh] min-w-4xl">
      <DialogHeader>
        <DialogTitle>Code Editor</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="language">Language</Label>
          <Combobox
            items={languages}
            onSelect={setLanguage}
            value={currentLanguage}
          />
        </div>
        <div className="grid gap-2">
          <Label>Code</Label>
          <div className="overflow-hidden rounded-md border">
            <Suspense fallback={<div>Loading...</div>}>
              <Editor
                height="300px"
                language={currentLanguage.toLowerCase() || "plaintext"}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: "on",
                  wordWrap: "on",
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  automaticLayout: true,
                }}
                theme="vs-light"
                value={code}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onClose} variant="neutral">
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
}
