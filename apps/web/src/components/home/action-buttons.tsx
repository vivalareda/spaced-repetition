import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/hooks/use-modal-store";

type PrimaryActionButtonProps = {
  dueTodayCount: number;
  onCreateCard: () => void;
  onReviewCard: () => void;
};

function PrimaryActionButton({
  dueTodayCount,
  onCreateCard,
  onReviewCard,
}: PrimaryActionButtonProps) {
  const { t } = useTranslation();

  if (dueTodayCount > 0) {
    return (
      <Button className="w-full md:w-auto" onClick={onReviewCard} size="lg">
        {t("index.hero.startReview", { count: dueTodayCount })}
      </Button>
    );
  }

  return (
    <Button className="w-full md:w-auto" onClick={onCreateCard} size="lg">
      {t("index.hero.createFirstCard")}
    </Button>
  );
}

type ActionsButtonsProps = {
  onCreateCard: () => void;
  onReviewDeck: () => void;
};

function ActionsButtons({ onCreateCard, onReviewDeck }: ActionsButtonsProps) {
  const { t } = useTranslation();
  const { onOpen } = useModalStore();

  return (
    <>
      <Button onClick={onCreateCard} size="sm">
        {t("index.buttons.createFlashcard")}
      </Button>
      <Button onClick={onReviewDeck} size="sm">
        {t("index.buttons.reviewByDeck")}
      </Button>
      <Button onClick={() => onOpen("create-deck", true)} size="sm">
        {t("index.buttons.createDeck")}
      </Button>
    </>
  );
}

type HomePageActionButtonsProps = {
  dueTodayCount: number;
  handleCreateCard: () => void;
  handleReviewCard: () => void;
  handleReviewDeck: () => void;
};

export function HomePageActionButtons({
  dueTodayCount,
  handleCreateCard,
  handleReviewCard,
  handleReviewDeck,
}: HomePageActionButtonsProps) {
  return (
    <div className="space-y-4">
      <PrimaryActionButton
        dueTodayCount={dueTodayCount}
        onCreateCard={handleCreateCard}
        onReviewCard={handleReviewCard}
      />

      <div className="flex flex-wrap gap-2">
        <ActionsButtons
          onCreateCard={handleCreateCard}
          onReviewDeck={handleReviewDeck}
        />
      </div>
    </div>
  );
}
