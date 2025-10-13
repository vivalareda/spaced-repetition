import Editor from "@monaco-editor/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CodeEditorModalProps = {
  isOpen: { codeBlockFor: "question" | "answer" } | null;
  onClose: () => void;
  onSave: (
    language: string,
    code: string,
    codeBlockFor: "question" | "answer"
  ) => void;
};

export function CodeEditorModal({
  isOpen,
  onClose,
  onSave,
}: CodeEditorModalProps) {
  const [language, setLanguage] = useState("");
  const [code, setCode] = useState("");

  const handleSave = () => {
    if (!isOpen) {
      return;
    }
    onSave(language, code, isOpen.codeBlockFor);
    handleClose();
    onClose();
  };

  const handleCancel = () => {
    handleClose();
    onClose();
  };

  const handleClose = () => {
    setLanguage("");
    setCode("");
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen !== null}>
      <DialogContent className="max-h-[70vh] min-w-4xl">
        <DialogHeader>
          <DialogTitle>Code Editor</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select onValueChange={setLanguage} value={language}>
              <SelectTrigger className="bg-white">
                <SelectValue
                  className="bg-white"
                  placeholder="Select a language"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="csharp">C#</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
                <SelectItem value="ruby">Ruby</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Code</Label>
            <div className="overflow-hidden rounded-md border">
              <Editor
                height="300px"
                language={language.toLowerCase() || "plaintext"}
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
    </Dialog>
  );
}
