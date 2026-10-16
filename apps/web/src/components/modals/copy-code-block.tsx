import { Copy } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CopyCodeBlockProps = {
  codeBlock: string;
  language: string;
};

const IS_COPIED_DELAY = 1000;

/** Copies the snippet as a fenced Markdown code block. */
export function CopyCodeBlockTooltip({
  codeBlock,
  language,
}: CopyCodeBlockProps) {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`\`\`\`${language}\n${codeBlock}\n\`\`\``);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, IS_COPIED_DELAY);
  };

  if (!codeBlock) {
    return;
  }

  return (
    <TooltipProvider disableHoverableContent={true}>
      <Tooltip open={isCopied}>
        <TooltipTrigger asChild>
          <button
            aria-label="Copy flashcard content"
            className="absolute right-12 bottom-2 text-muted-foreground transition hover:text-foreground"
            onClick={handleCopy}
            type="button"
          >
            <Copy size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent>{t("copyCodeBlock.copied")}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
