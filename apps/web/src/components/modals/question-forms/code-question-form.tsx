import { type ChangeEvent, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { DropdownMenu } from "@/components/dropdown-menu";
import { CodeEditorModal } from "@/components/modals/code-editor-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CodeQuestionFormProps = {
  formData: {
    question: string;
    questionCode: string;
    answer: string;
    answerCode: string;
    deck: string;
    language: string;
  };
  userDecks: string[] | undefined;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onDeckSelect: (deck: string) => void;
  onLanguageChange: (language: string) => void;
  onQuestionCodeChange: (code: string) => void;
  onAnswerCodeChange: (code: string) => void;
};

export function CodeQuestionForm({
  formData,
  userDecks,
  onFieldChange,
  onDeckSelect,
  onLanguageChange,
  onQuestionCodeChange,
  onAnswerCodeChange,
}: CodeQuestionFormProps) {
  const PREVIEW_LINES = 3;

  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState<{
    codeBlockFor: "question" | "answer";
  } | null>(null);

  const handleOpenCodeEditor = (codeBlockFor: "question" | "answer") => {
    setIsCodeEditorOpen({ codeBlockFor });
  };

  const handleEditorClose = () => {
    setIsCodeEditorOpen(null);
  };

  const handleCodeEditorSave = (
    language: string,
    code: string,
    codeBlockFor: "question" | "answer"
  ) => {
    if (codeBlockFor === "question") {
      onLanguageChange(language);
      onQuestionCodeChange(code);
    } else {
      onLanguageChange(language);
      onAnswerCodeChange(code);
    }
    setIsCodeEditorOpen(null);
  };

  const getCodePreview = (code: string) => {
    if (!code) {
      return { preview: "", truncated: false, totalLines: 0 };
    }
    const lines = code.split("\n");
    const preview = lines.slice(0, PREVIEW_LINES).join("\n");
    const truncated = lines.length > PREVIEW_LINES;
    return { preview, truncated, totalLines: lines.length };
  };

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="question">Question</Label>
          <Textarea
            className="min-h-12"
            id="question"
            onChange={onFieldChange}
            required
            rows={1}
            value={formData.question}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <div className="flex flex-col gap-2">
              <Label>Question Code</Label>
              <Button
                onClick={() => handleOpenCodeEditor("question")}
                size="sm"
                type="button"
                variant="neutral"
              >
                {formData.questionCode ? "Edit Code" : "Add Code"}
              </Button>
            </div>
            {formData.questionCode && (
              <div className="max-h-24 overflow-y-auto rounded-md border">
                <SyntaxHighlighter
                  customStyle={{
                    margin: 0,
                    padding: "8px",
                    fontSize: "12px",
                    maxHeight: "96px",
                    overflow: "auto",
                  }}
                  language={formData.language || "javascript"}
                  style={atomOneLight}
                >
                  {getCodePreview(formData.questionCode)?.preview}
                </SyntaxHighlighter>
                {getCodePreview(formData.questionCode)?.truncated && (
                  <p className="mt-1 px-2 pb-1 text-gray-400 text-xs">
                    +
                    {getCodePreview(formData.questionCode)?.totalLines -
                      PREVIEW_LINES}{" "}
                    more lines
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              className="min-h-12"
              id="answer"
              onChange={onFieldChange}
              required
              value={formData.answer}
            />
          </div>

          <div className="grid gap-2">
            <div className="grid gap-2">
              <div className="flex flex-col gap-2">
                <Label>Answer Code</Label>
                <Button
                  onClick={() => handleOpenCodeEditor("answer")}
                  size="sm"
                  type="button"
                  variant="neutral"
                >
                  {formData.answerCode ? "Edit Code" : "Add Code"}
                </Button>
              </div>
            </div>
            {formData.answerCode && (
              <div className="max-h-24 overflow-y-auto rounded-md border">
                <SyntaxHighlighter
                  customStyle={{
                    margin: 0,
                    padding: "8px",
                    fontSize: "12px",
                    maxHeight: "96px",
                    overflow: "auto",
                  }}
                  language={formData.language || "javascript"}
                  style={atomOneLight}
                >
                  {getCodePreview(formData.answerCode)?.preview}
                </SyntaxHighlighter>
                {getCodePreview(formData.answerCode)?.truncated && (
                  <p className="mt-1 px-2 pb-1 text-gray-400 text-xs">
                    +
                    {getCodePreview(formData.answerCode)?.totalLines -
                      PREVIEW_LINES}{" "}
                    more lines
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="deck">Deck</Label>
          <DropdownMenu
            items={userDecks}
            onSelect={onDeckSelect}
            placeholder={
              userDecks?.length === 0
                ? "You don't have any decks"
                : "Select a deck"
            }
          />
        </div>
      </div>

      <CodeEditorModal
        answerCode={formData.answerCode}
        isOpen={isCodeEditorOpen}
        language={formData.language}
        onClose={handleEditorClose}
        onSave={handleCodeEditorSave}
        questionCode={formData.questionCode}
        setCode={onQuestionCodeChange}
        setField={onFieldChange}
        setLanguage={onLanguageChange}
      />
    </>
  );
}
