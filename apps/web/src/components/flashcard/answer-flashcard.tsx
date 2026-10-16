// Splits "a **b** c" into text and <strong> parts.
const BOLD_PATTERN = /(\*\*.*?\*\*)/g;

/** A card's revealed answer, with `**bold**` markup rendered. */
export function AnswerText({ answer }: { answer: string }) {
  const parts = answer.split(BOLD_PATTERN);

  return (
    <div className="fade-in slide-in-from-bottom-10 w-full max-w-2xl animate-in rounded-lg border-2 border-primary/20 bg-white/50 p-6 text-center duration-500">
      <p className="text-lg leading-relaxed">
        {parts.map((part, index) =>
          part.startsWith("**") && part.endsWith("**") ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: parts never reorder
            <strong key={index}>{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        )}
      </p>
    </div>
  );
}
