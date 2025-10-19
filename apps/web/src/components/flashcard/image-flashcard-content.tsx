import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import type { Id } from "@spaced-repetition-monorepo/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";

type ImageFlashCardContentProps = {
  imageStorageId: Id<"_storage">;
};

export function ImageFlashCardContent({
  imageStorageId,
}: ImageFlashCardContentProps) {
  const imageUrl = useQuery(api.cards.getImageUrl, { imageStorageId });

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
