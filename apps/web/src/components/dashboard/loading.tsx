import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Loading() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      <Card className="w-full max-w-md border-border/60 bg-white/80 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">
            {t("index.loading.title")}
          </CardTitle>
          <CardDescription>{t("index.loading.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
            <div className="h-full w-1/3 animate-pulse bg-main" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
