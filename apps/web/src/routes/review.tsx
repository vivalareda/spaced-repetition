import type { Card } from "@shared/types";
import { isCodeCard } from "@shared/types";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { FlashCard } from "@/components/flashcard/base-flashcard";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useSessionStore } from "@/hooks/use-session-store";

export const Route = createFileRoute("/review")({
  component: ReviewPage,
});

function ReviewPage() {
  const { reviewQueue } = useSessionStore();
  const [carouselApi, setCarouselApi] = useState<CarouselApi | undefined>(
    undefined
  );
  const updateNextReviewDate = useMutation(api.cards.updateNextReviewDate);
  const navigate = useNavigate();

  if (!reviewQueue || reviewQueue.length === 0) {
    navigate({
      to: "/dashboard",
    });
  }

  const onDifficultyClick = (cardId: Card["_id"], difficulty: string) => {
    updateNextReviewDate({
      cardId,
      difficulty,
    });
    if (carouselApi?.canScrollNext()) {
      carouselApi.scrollNext();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-18">
      <Carousel className="w-full max-w-4xl" setApi={setCarouselApi}>
        <CarouselContent>
          {reviewQueue.map((data, index) => {
            const isCode = isCodeCard(data);
            const type = isCode ? "code" : "text";
            return (
              <CarouselItem key={data.question}>
                <div className="p-[10px]">
                  <FlashCard
                    card={data}
                    correctAnswer={data.answer}
                    onDifficultyClick={onDifficultyClick}
                    questionIndex={index}
                    totalQuestions={reviewQueue.length}
                    type={type}
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
