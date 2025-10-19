import type { TextFormData } from "@shared/types";
import type { ChangeEvent } from "react";
import { DropdownMenu } from "@/components/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TextQuestionFormProps = {
  formData: TextFormData;
  userDecks: string[] | undefined;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onDeckSelect: (deck: string) => void;
};

export function TextQuestionForm({
  formData,
  userDecks,
  onFieldChange,
  onDeckSelect,
}: TextQuestionFormProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          onChange={onFieldChange}
          required
          value={formData.question}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="answer">Answer</Label>
        <Textarea
          id="answer"
          onChange={onFieldChange}
          required
          rows={3}
          value={formData.answer}
        />
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
  );
}
