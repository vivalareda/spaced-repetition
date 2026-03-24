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
  isOpen: { codeBlockFor: "question" | "answer" } | null;
  language: string;
  questionCode: string;
  answerCode: string;
  onClose: () => void;
  onSave: (
    language: string,
    code: string,
    codeBlockFor: "question" | "answer"
  ) => void;
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

export function CodeEditorModal({
  isOpen,
  onClose,
  onSave,
  questionCode,
  answerCode,
  language,
}: CodeEditorModalProps) {
  return (
    <Dialog onOpenChange={onClose} open={isOpen !== null}>
      {isOpen && (
        <CodeEditorModalContent
          answerCode={answerCode}
          codeBlockFor={isOpen.codeBlockFor}
          language={language}
          onClose={onClose}
          onSave={onSave}
          questionCode={questionCode}
        />
      )}
    </Dialog>
  );
}

function CodeEditorModalContent({
  codeBlockFor,
  onClose,
  onSave,
  questionCode,
  answerCode,
  language,
}: {
  codeBlockFor: "question" | "answer";
  language: string;
  questionCode: string;
  answerCode: string;
  onClose: () => void;
  onSave: (
    language: string,
    code: string,
    codeBlockFor: "question" | "answer"
  ) => void;
}) {
  const initialCode = codeBlockFor === "question" ? questionCode : answerCode;
  const [currentLanguage, setLanguage] = useState(language);
  const [code, setCode] = useState(initialCode);

  const handleSave = () => {
    onSave(currentLanguage, code, codeBlockFor);
    onClose();
  };

  const handleCancel = () => {
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
            currentLanguage={language}
            items={languages}
            onSelect={setLanguage}
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
        <Button onClick={handleCancel} variant="neutral">
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
}
