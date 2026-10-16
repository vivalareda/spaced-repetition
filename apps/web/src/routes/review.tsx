import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Loading } from "@/components/dashboard/loading";
import { FlashCard } from "@/components/flashcard/base-flashcard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useReviewSession } from "@/hooks/use-review-session";

export const Route = createFileRoute("/review")({
  component: ReviewPage,
});

function ReviewPage() {
  const { t } = useTranslation();
  const session = useReviewSession();

  switch (session.status) {
    case "none":
      return <Navigate to="/dashboard" />;
    case "loading":
      return <Loading />;
    case "finished":
      return <SessionSummary reviewedCount={session.reviewedCount} />;
    case "reviewing":
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-18">
          <div className="w-full max-w-4xl p-[10px]">
            <FlashCard
              card={session.card}
              key={session.showingKey}
              onRate={session.rate}
              onReveal={session.reveal}
              pendingRating={session.pendingRating}
              questionIndex={session.position}
              showAnswer={session.isRevealed}
              totalQuestions={session.total}
            />
          </div>
          {session.rateFailed && (
            <p className="text-red-600 text-sm">{t("review.rateError")}</p>
          )}
          <p className="text-muted-foreground text-xs">
            {t("review.shortcutsHint")}
          </p>
        </div>
      );
    default:
      throw new Error(`Unknown session status: ${session satisfies never}`);
  }
}

function SessionSummary({ reviewedCount }: { reviewedCount: number }) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white text-center">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {t("review.summary.title")}
          </CardTitle>
          <CardDescription>
            {t("review.summary.description", { count: reviewedCount })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link to="/">{t("review.summary.backHome")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
