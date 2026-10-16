import type { CodeFormData } from "@shared/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CodeEditorModal } from "@/components/modals/code-editor-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PREVIEW_LINES = 3;

type Side = "question" | "answer";

type CodeQuestionFormProps = {
  form: CodeFormData;
  onChange: (patch: Partial<CodeFormData>) => void;
};

export function CodeQuestionForm({ form, onChange }: CodeQuestionFormProps) {
  const { t } = useTranslation();
  const [editingSide, setEditingSide] = useState<Side | null>(null);

  const saveCode = (language: string, code: string) => {
    onChange(
      editingSide === "question"
        ? { language, questionCode: code }
        : { language, answerCode: code }
    );
  };

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="question">{t("modals.createCard.questionLabel")}</Label>
        <Textarea
          className="min-h-12"
          id="question"
          onChange={(event) => onChange({ question: event.target.value })}
          required
          rows={1}
          value={form.question}
        />
      </div>

      <CodeField
        code={form.questionCode}
        label={t("modals.createCard.questionCodeLabel")}
        language={form.language}
        onEdit={() => setEditingSide("question")}
      />

      <div className="grid gap-2">
        <Label htmlFor="answer">{t("modals.createCard.answerLabel")}</Label>
        <Textarea
          className="min-h-12"
          id="answer"
          onChange={(event) => onChange({ answer: event.target.value })}
          required
          value={form.answer}
        />
      </div>

      <CodeField
        code={form.answerCode}
        label={t("modals.createCard.answerCodeLabel")}
        language={form.language}
        onEdit={() => setEditingSide("answer")}
      />

      <CodeEditorModal
        code={editingSide === "answer" ? form.answerCode : form.questionCode}
        isOpen={editingSide !== null}
        language={form.language}
        onClose={() => setEditingSide(null)}
        onSave={saveCode}
      />
    </>
  );
}

/** A code snippet's add/edit button and a preview of its first lines. */
function CodeField({
  label,
  code,
  language,
  onEdit,
}: {
  label: string;
  code: string;
  language: string;
  onEdit: () => void;
}) {
  const lines = code.split("\n");
  const hiddenLineCount = lines.length - PREVIEW_LINES;

  return (
    <div className="grid gap-2">
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <Button onClick={onEdit} size="sm" type="button" variant="neutral">
          {code ? "Edit Code" : "Add Code"}
        </Button>
      </div>
      {code && (
        <div className="max-h-24 overflow-y-auto rounded-md border">
          <SyntaxHighlighter
            customStyle={{
              margin: 0,
              padding: "8px",
              fontSize: "12px",
              maxHeight: "96px",
              overflow: "auto",
            }}
            language={language}
            style={atomOneLight}
          >
            {lines.slice(0, PREVIEW_LINES).join("\n")}
          </SyntaxHighlighter>
          {hiddenLineCount > 0 && (
            <p className="mt-1 px-2 pb-1 text-gray-400 text-xs">
              +{hiddenLineCount} more lines
            </p>
          )}
        </div>
      )}
    </div>
  );
}
