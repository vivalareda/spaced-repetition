import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import type { Card } from "@spaced-repetition-monorepo/backend/convex/types/convexTypes";
import { useQuery } from "convex/react";

type ImageFlashCardContentProps = {
  cardId: Card["_id"];
  side: "question" | "answer";
};

/** The image attached to one side of a card; renders nothing if there is none. */
export function ImageFlashCardContent({
  cardId,
  side,
}: ImageFlashCardContentProps) {
  const imageUrl = useQuery(api.cards.getImageUrl, { cardId, side });

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="col-span-1 sm:col-span-2">
      <img
        alt="Flashcard content"
        className="h-auto w-full rounded-lg object-cover"
        height={400}
        src={imageUrl}
        width={600}
      />
    </div>
  );
}
