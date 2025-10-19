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
  handleCopyCodeBlock: (codeBlock: string, language: string) => void;
};

const IS_COPIED_DELAY = 1000;

export function CopyCodeBlockTooltip({
  codeBlock,
  language,
  handleCopyCodeBlock,
}: CopyCodeBlockProps) {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCodeClick = (code: string, lang: string) => {
    handleCopyCodeBlock(code, lang);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, IS_COPIED_DELAY);
  };

  return (
    <TooltipProvider disableHoverableContent={true}>
      <Tooltip open={isCopied}>
        <TooltipTrigger asChild>
          <button
            aria-label="Copy flashcard content"
            className="absolute right-12 bottom-2 text-muted-foreground transition hover:text-foreground"
            onClick={() => handleCopyCodeClick(codeBlock, language)}
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
