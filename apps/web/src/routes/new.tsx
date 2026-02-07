import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useModalStore } from "@/hooks/use-modal-store";

export const Route = createFileRoute("/new")({
  component: NewPage,
});

function NewPage() {
  const { onOpen } = useModalStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const routeToDashboard = () => {
    navigate({
      to: "/dashboard",
    });
  };

  const handleCreateDeck = () => {
    onOpen("create-deck", true, undefined, routeToDashboard);
  };

  const handleCreateQuestion = () => {
    onOpen("create-card", true, undefined, routeToDashboard);
  };

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center gap-4 bg-white70 px-4 py-10 sm:px-8 lg:px-12">
      <section>
        <Card className="w-full min-w-sm max-w-lg border-border/60 bg-white/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl">
              {t("new.createDeck.title")}
            </CardTitle>
            <CardDescription>{t("new.createDeck.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleCreateDeck}>
              {t("new.createDeck.button")}
            </Button>
          </CardContent>
        </Card>
      </section>
      <section>
        <Card className="w-full min-w-sm max-w-lg border-border/60 bg-white/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl">
              {t("new.createQuestion.title")}
            </CardTitle>
            <CardDescription>
              {t("new.createQuestion.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleCreateQuestion}>
              {t("new.createQuestion.button")}
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
