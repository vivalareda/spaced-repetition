import { useTranslation } from "react-i18next";
import { ClipboardIcon } from "@/components/ui/ClipboardIcon";
import { EyeOffIcon } from "@/components/ui/eye-off";
import { TrashIcon } from "@/components/ui/TrashIcon";
import { useCopyClipboard } from "@/hooks/use-copy-clipboard";

type ApiKeyDisplayProps = {
  apiKey: string;
  onDelete: () => void;
  maskChar?: string;
  visibleChars?: number;
};

const DEFAULT_MASK_CHAR = "•";
const DEFAULT_VISIBLE_CHARS = 4;

export function ApiKeyDisplay({
  apiKey,
  onDelete,
  maskChar = DEFAULT_MASK_CHAR,
  visibleChars = DEFAULT_VISIBLE_CHARS,
}: ApiKeyDisplayProps) {
  const { t } = useTranslation();
  const { isVisible, copy, toggleVisibility } = useCopyClipboard();

  const handleDelete = () => {
    onDelete();
  };

  const maskApiKey = (key: string) =>
    `${maskChar.repeat(key.length - visibleChars)}${key.slice(-visibleChars)}`;

  return (
    <div className="rounded-base border-2 border-border bg-secondary-background p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-xs">
            {isVisible ? apiKey : maskApiKey(apiKey)}
          </code>
          <button
            aria-label={t(
              isVisible ? "settings.apiKeys.hide" : "settings.apiKeys.show"
            )}
            className="inline-flex items-center justify-center p-1 hover:rounded-md hover:bg-foreground/10"
            onClick={toggleVisibility}
            type="button"
          >
            <EyeOffIcon className="h-5 w-5" />
          </button>
          <button
            aria-label={t("settings.apiKeys.copy")}
            className="inline-flex items-center justify-center p-1 hover:rounded-md hover:bg-foreground/10"
            onClick={() => copy(apiKey)}
            type="button"
          >
            <ClipboardIcon className="h-4 w-4" />
          </button>
          <button
            aria-label={t("settings.apiKeys.delete")}
            className="inline-flex items-center justify-center p-1 text-destructive hover:rounded-md hover:bg-foreground/10"
            onClick={handleDelete}
            type="button"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
