import type { Card as CardType } from "@spaced-repetition-monorepo/backend/convex/types/convex-types";
import { Code, FileText, Trash2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";

const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((mod) => ({
    default: mod.Prism,
  }))
);

type CardProps = {
  card: CardType;
  onDeleteCard: (cardId: CardType["_id"]) => void;
};

export function Card({ card, onDeleteCard }: CardProps) {
  return (
    <div className="flex items-start justify-between rounded-md border p-3">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          {card.questionCode || card.answerCode ? (
            <Code className="h-4 w-4 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4 text-gray-500" />
          )}
          <span className="font-medium">{card.question}</span>
          {card.language && (
            <span className="rounded bg-blue-100 px-2 py-1 text-blue-800 text-xs">
              {card.language}
            </span>
          )}
        </div>
        {card.questionCode && (
          <div className="mt-2 pr-2">
            <p className="mb-1 text-gray-600 text-xs">Question Code:</p>
            <Suspense
              fallback={
                <div className="text-gray-400 text-xs">Loading code...</div>
              }
            >
              <SyntaxHighlighter
                customStyle={{
                  padding: "8px",
                  fontSize: "12px",
                  maxHeight: "120px",
                  overflow: "auto",
                  margin: 0,
                }}
                language={card.language?.toLowerCase() || "text"}
                style={oneLight}
              >
                {card.questionCode}
              </SyntaxHighlighter>
            </Suspense>
          </div>
        )}
      </div>
      <Button
        onClick={() => onDeleteCard(card._id)}
        size="sm"
        variant="neutral"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
