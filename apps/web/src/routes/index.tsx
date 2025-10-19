import { convexQuery } from "@convex-dev/react-query";
import type { Card as CardType, Deck } from "@shared/types";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { BookOpen, CalendarDays, ListTodo } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { useTranslation } from "react-i18next";
import { Loading } from "@/components/dashboard/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersWithoutData } from "@/components/user-without-data";
import { useModalStore } from "@/hooks/use-modal-store";
import { useSessionStore } from "@/hooks/use-session-store";
import { useUserData } from "@/hooks/use-user-data";

const PREVIEW_CARDS_COUNT = 4;
const MORNING_HOUR_THRESHOLD = 12;
const EVENING_HOUR_THRESHOLD = 18;

export const Route = createFileRoute("/")({
  component: Index,
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/hero" });
    }
  },
  loader: async ({ context }) => {
    if (context.isAuthenticated && context.userSynced) {
      await Promise.all([
        context.queryClient.prefetchQuery(convexQuery(api.cards.get, {})),
        context.queryClient.prefetchQuery(
          convexQuery(api.decks.getUserDecks, {})
        ),
        context.queryClient.prefetchQuery(
          convexQuery(api.cards.getDueToday, {})
        ),
      ]);
    }
  },
});

type ReviewQueueListProps = {
  cards: CardType[];
  userDecks: Deck[];
  emptyMessage: string;
};

function ReviewQueueList({
  cards,
  userDecks,
  emptyMessage,
}: ReviewQueueListProps) {
  if (cards.length === 0) {
    return <p className="text-foreground/70 text-sm">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-4">
      {cards.map((card) => (
        <ReviewQueueCard card={card} key={card._id} userDecks={userDecks} />
      ))}
    </ul>
  );
}

type ReviewQueueCardProps = {
  card: CardType;
  userDecks?: Deck[];
};

function ReviewQueueCard({ card, userDecks }: ReviewQueueCardProps) {
  const { t } = useTranslation();

  const deckName =
    userDecks?.find((deck) => deck._id === card.deckId)?.deckName ||
    t("index.reviewQueue.unclassified");

  const repetitionLabel =
    card.repetitions === 1
      ? t("index.reviewQueue.repetition")
      : t("index.reviewQueue.repetitions");

  return (
    <li className="rounded-2xl border border-border/60 bg-secondary-background/60 p-4 backdrop-blur">
      <p className="font-medium text-foreground">{card.question}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-foreground/70 text-xs">
        <span className="inline-flex items-center rounded-full bg-main/10 px-2 py-0.5 font-medium text-main">
          {deckName}
        </span>
        <span>
          {card.repetitions} {repetitionLabel}
        </span>
      </div>
    </li>
  );
}

type StatsCardProps = {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
};

function StatsCard({ label, value, description, icon }: StatsCardProps) {
  return (
    <Card className="border-border/60 bg-white/90 backdrop-blur">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-2">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="font-heading text-4xl text-foreground">
            {value}
          </CardTitle>
        </div>
        <span className="flex size-11 items-center justify-center rounded-full bg-main/10 text-main">
          {icon}
        </span>
      </CardHeader>
      <CardContent className="text-foreground/70 text-sm">
        {description}
      </CardContent>
    </Card>
  );
}

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

function Index() {
  const { t } = useTranslation();
  const { userCards, userDecks, cardsDueToday, isLoading, isEmpty } =
    useUserData();
  const { onOpen } = useModalStore();
  const { startSession } = useSessionStore();
  const navigate = useNavigate();
  useHotkeys("c", () => {
    onOpen("create-card", true);
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isEmpty) {
    return <UsersWithoutData />;
  }

  const dueToday = cardsDueToday || [];
  const allCards = userCards || [];

  const dueTodayCount = dueToday.length;
  const totalCards = allCards.length;
  const decks = userDecks?.length || 0;
  const nextUp = dueToday.slice(0, PREVIEW_CARDS_COUNT);

  const greeting = getTimeOfDayGreeting(t);
  const heroSubtitle =
    dueTodayCount > 0
      ? t("index.hero.subtitle.withReviews")
      : t("index.hero.subtitle.noReviews");

  const handleCreateCard = () => {
    onOpen("create-card", true);
  };

  const handleReviewDeck = () => {
    onOpen("choose-deck", true);
  };

  const handleReviewCard = () => {
    const cardsToReview = cardsDueToday || [];
    if (cardsToReview.length > 0) {
      startSession(cardsToReview);
      navigate({ to: "/" });
    }
    navigate({ to: "/review" });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-8 lg:px-12">
      <section className="rounded-3xl border border-border/60 bg-white/80 p-8 shadow-shadow backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="font-medium text-main text-sm uppercase tracking-widest">
              {greeting}
            </p>
            <h1 className="font-heading text-3xl text-foreground tracking-tight md:text-5xl">
              {t("index.hero.title")}
            </h1>
            <p className="max-w-2xl text-base text-foreground/70">
              {heroSubtitle}
            </p>
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
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-secondary-background/60 p-6 backdrop-blur">
            <p className="font-semibold text-foreground/60 text-xs uppercase tracking-[0.3em]">
              {t("index.stats.today")}
            </p>
            <p className="mt-3 font-heading text-5xl text-foreground">
              {dueTodayCount}
            </p>
            <p className="mt-2 text-foreground/70 text-sm">
              {dueTodayCount > 0
                ? t("index.stats.todayWithReviews")
                : t("index.stats.todayNoReviews")}
            </p>
            <div className="mt-5 flex gap-3">
              <span className="inline-flex items-center rounded-full bg-main/10 px-3 py-1 font-medium text-main text-xs">
                {t("index.stats.totalCards", { count: totalCards })}
              </span>
              <span className="inline-flex items-center rounded-full bg-foreground/10 px-3 py-1 font-medium text-foreground/80 text-xs">
                {t("index.stats.decks", { count: decks })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6 lg:flex-row">
        <section className="space-y-6">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
            <StatsCard
              description={
                dueTodayCount > 0
                  ? t("index.stats.todayWithReviews")
                  : t("index.stats.todayNoReviews")
              }
              icon={
                <CalendarDays aria-hidden className="size-5">
                  <title>Due today icon</title>
                </CalendarDays>
              }
              label={t("index.stats.dueToday")}
              value={dueTodayCount}
            />
            <StatsCard
              description={t("index.stats.cardsDescription")}
              icon={
                <ListTodo aria-hidden className="size-5">
                  <title>Learning cards icon</title>
                </ListTodo>
              }
              label={t("index.stats.cards")}
              value={totalCards}
            />
            <StatsCard
              description={t("index.stats.decksDescription")}
              icon={
                <BookOpen aria-hidden className="size-5">
                  <title>Subjects icon</title>
                </BookOpen>
              }
              label={t("index.stats.decksTitle")}
              value={decks}
            />
          </div>

          <Card className="border-border/60 bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="font-heading text-foreground text-xl">
                {t("index.reviewQueue.title")}
              </CardTitle>
              <CardDescription>
                {dueTodayCount > 0
                  ? t("index.reviewQueue.descriptionWithReviews")
                  : t("index.reviewQueue.descriptionNoReviews")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewQueueList
                cards={nextUp}
                emptyMessage={t("index.reviewQueue.emptyState")}
                userDecks={userDecks}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function getTimeOfDayGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();

  if (hour < MORNING_HOUR_THRESHOLD) {
    return t("index.greeting.morning");
  }

  if (hour < EVENING_HOUR_THRESHOLD) {
    return t("index.greeting.afternoon");
  }

  return t("index.greeting.evening");
}
