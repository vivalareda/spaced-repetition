import type { Card } from "@spaced-repetition-monorepo/backend/convex/types/convexTypes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/hooks/use-modal-store";
import { useStartReview } from "@/hooks/use-review-session";

/** The home page's actions: review what's due (or create a first card), and create/review shortcuts. */
export function HomePageActionButtons({ dueToday }: { dueToday: Card[] }) {
  const { t } = useTranslation();
  const { onOpen } = useModalStore();
  const startReview = useStartReview();
  const openCreateCard = () => onOpen("create-card");

  return (
    <div className="space-y-4">
      {dueToday.length > 0 ? (
        <Button
          className="w-full md:w-auto"
          onClick={() => startReview(dueToday)}
          size="lg"
        >
          {t("index.hero.startReview", { count: dueToday.length })}
        </Button>
      ) : (
        <Button className="w-full md:w-auto" onClick={openCreateCard} size="lg">
          {t("index.hero.createFirstCard")}
        </Button>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={openCreateCard} size="sm">
          {t("index.buttons.createFlashcard")}
        </Button>
        <Button onClick={() => onOpen("choose-deck")} size="sm">
          {t("index.buttons.reviewByDeck")}
        </Button>
        <Button onClick={() => onOpen("create-deck")} size="sm">
          {t("index.buttons.createDeck")}
        </Button>
      </div>
    </div>
  );
}
