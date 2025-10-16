import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import "i18next";
import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useModalStore } from "@/hooks/use-modal-store";

export const Route = createFileRoute("/hero")({
  component: HeroPage,
});

function HeroPage() {
  const { onOpen } = useModalStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-main/5 to-secondary-background/20 pt-22">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="font-heading text-4xl text-foreground tracking-tight sm:text-6xl lg:text-7xl">
              {t("hero.title")}{" "}
              <span className="text-main">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="mt-6 text-foreground/70 text-lg leading-8 sm:text-xl">
              {t("hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button onClick={() => onOpen("sign-up", true)} size="lg">
                {t("hero.startLearning")} <ArrowRight className="ml-2 size-5" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
