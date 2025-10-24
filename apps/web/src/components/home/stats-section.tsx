import { BookOpen, CalendarDays, ListTodo } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatsCardProps = {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
};

export function StatsCard({ label, value, description, icon }: StatsCardProps) {
  return (
    <Card className="border-border/60 bg-white/90 backdrop-blur">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-2">
          <CardTitle className="space-x-2">
            <span className="font-bold text-5xl text-foreground">{value}</span>
            <span className="font-medium text-foreground/70 text-xl">
              {label}
            </span>
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

type StatsSectionProps = {
  dueTodayCount: number;
  totalCards: number;
  decks: number;
};

export function StatsSection({
  dueTodayCount,
  totalCards,
  decks,
}: StatsSectionProps) {
  const { t } = useTranslation();

  return (
    <>
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
    </>
  );
}
