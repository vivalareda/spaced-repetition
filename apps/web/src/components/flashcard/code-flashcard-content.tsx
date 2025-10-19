import { lazy, Suspense } from "react";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyCodeBlockTooltip } from "@/components/modals/copy-code-block";

const SyntaxHighlighter = lazy(() => import("react-syntax-highlighter"));

type CodeFlashCardContentProps = {
  codeBlock: string;
  language: string;
  showCopyCodeBlockTooltip: boolean;
  handleCopyCodeBlock: (codeBlock: string, language: string) => void;
};

export function CodeFlashCardContent({
  codeBlock,
  language,
  showCopyCodeBlockTooltip,
  handleCopyCodeBlock,
}: CodeFlashCardContentProps) {
  return (
    <div className="relative col-span-1 sm:col-span-2">
      <Suspense fallback={<div>Loading...</div>}>
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
      </Suspense>
      {showCopyCodeBlockTooltip && (
        <CopyCodeBlockTooltip
          codeBlock={codeBlock}
          handleCopyCodeBlock={handleCopyCodeBlock}
          language={language}
        />
      )}
    </div>
  );
}
