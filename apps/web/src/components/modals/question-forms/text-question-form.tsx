import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type QuestionAnswer = { question: string; answer: string };

type TextQuestionFormProps = {
  form: QuestionAnswer;
  onChange: (patch: Partial<QuestionAnswer>) => void;
};

/** Question and answer inputs; also the top of the image form. */
export function TextQuestionForm({ form, onChange }: TextQuestionFormProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="question">{t("modals.createCard.questionLabel")}</Label>
        <Input
          id="question"
          onChange={(event) => onChange({ question: event.target.value })}
          required
          value={form.question}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="answer">{t("modals.createCard.answerLabel")}</Label>
        <Textarea
          id="answer"
          onChange={(event) => onChange({ answer: event.target.value })}
          required
          rows={3}
          value={form.answer}
        />
      </div>
    </>
  );
}
