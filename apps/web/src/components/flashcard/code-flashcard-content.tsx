import { Copy } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CodeFlashCardContentProps = {
  codeBlock: string;
  language: string;
  showAnswer: boolean;
  handleCopyCodeBlock: (codeBlock: string, language: string) => void;
};

export function CodeFlashCardContent({
  codeBlock,
  language,
  showAnswer,
  handleCopyCodeBlock,
}: CodeFlashCardContentProps) {
  return (
    <div className="relative col-span-1 sm:col-span-2">
      <SyntaxHighlighter
        customStyle={{
          width: "100%",
          margin: 0,
          borderRadius: "0.5rem",
          backgroundColor: "transparent",
          padding: "1rem",
        }}
        language={language}
        style={atomOneLight}
      >
        {codeBlock}
      </SyntaxHighlighter>
      {!showAnswer && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Copy flashcard content"
                className="absolute right-12 bottom-2 text-muted-foreground transition hover:text-foreground"
                onClick={() => handleCopyCodeBlock(codeBlock, language)}
                type="button"
              >
                <Copy size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy code block</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
