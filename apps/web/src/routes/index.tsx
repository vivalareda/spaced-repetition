import { convexQuery } from "@convex-dev/react-query";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Loading } from "@/components/dashboard/loading";
import { HomePageActionButtons } from "@/components/home/action-buttons";
import { ReviewQueueList } from "@/components/home/review-queue-section";
import { StatsSection } from "@/components/home/stats-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersWithoutData } from "@/components/user-without-data";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
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

function Index() {
  const { t } = useTranslation();
  const { userCards, userDecks, cardsDueToday, isLoading, isEmpty } =
    useUserData();
  const { onOpen } = useModalStore();
  const { startSession } = useSessionStore();
  const navigate = useNavigate();
  useKeyboardShortcut();

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
            <HomePageActionButtons
              dueTodayCount={dueTodayCount}
              handleCreateCard={handleCreateCard}
              handleReviewCard={handleReviewCard}
              handleReviewDeck={handleReviewDeck}
            />
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
            <StatsSection
              decks={decks}
              dueTodayCount={dueTodayCount}
              totalCards={totalCards}
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
