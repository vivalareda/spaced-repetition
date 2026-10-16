import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useTranslation } from "react-i18next";
import { ApiKeyDisplay } from "@/components/api-key-display";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserQuery } from "@/hooks/use-user-data";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  // undefined while loading, null when the user has no key yet.
  const apiKey = useUserQuery(api.users.getApiKey, {});
  const createApiKey = useMutation(api.users.createUserApiKey);
  const deleteApiKey = useMutation(api.users.deleteApiKey);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="font-heading text-3xl">{t("settings.title")}</h1>
        <p className="mt-1 text-foreground/70 text-sm">
          {t("settings.description")}
        </p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{t("settings.apiKeys.title")}</CardTitle>
          <CardDescription>{t("settings.apiKeys.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {apiKey && (
            <ApiKeyDisplay apiKey={apiKey} onDelete={() => deleteApiKey()} />
          )}
          {apiKey === null && (
            <Button onClick={() => createApiKey()} type="button">
              {t("settings.apiKeys.createNew")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
