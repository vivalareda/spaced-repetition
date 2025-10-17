import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUserData } from "@/hooks/use-user-data";

export const Route = createFileRoute("/settings/$userId")({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/hero" });
    }
  },
  component: RouteComponent,
});

const DEFAULT_THRESHOLD = 5;
const MASK_CHAR = "•";
const VISIBLE_CHARS = 4;

function RouteComponent() {
  const { t } = useTranslation();
  const [visibleKeyId, setVisibleKeyId] = useState(false);
  const [askAgainThreshold, setAskAgainThreshold] = useState(DEFAULT_THRESHOLD);
  const createApiKey = useMutation(api.users.createUserApiKey);
  const { userApiKey } = useUserData();
  const deleteApiKey = useMutation(api.users.deleteApiKey);
  const apiKey = userApiKey;

  const handleCreateApiKey = async () => {
    await createApiKey();
  };

  const handleDeleteApiKey = () => {
    deleteApiKey();
    setVisibleKeyId(false);
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const maskApiKey = (key: string) =>
    `${MASK_CHAR.repeat(key.length - VISIBLE_CHARS)}${key.slice(-VISIBLE_CHARS)}`;

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
          {apiKey ? (
            <div className="rounded-base border-2 border-border bg-secondary-background p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-xs">
                    {visibleKeyId ? apiKey : maskApiKey(apiKey)}
                  </code>
                  <button
                    aria-label={t(
                      visibleKeyId
                        ? "settings.apiKeys.hide"
                        : "settings.apiKeys.show"
                    )}
                    className="inline-flex items-center justify-center p-1 hover:bg-foreground/10"
                    onClick={() => setVisibleKeyId(!visibleKeyId)}
                    type="button"
                  >
                    {visibleKeyId ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    aria-label={t("settings.apiKeys.copy")}
                    className="inline-flex items-center justify-center p-1 hover:bg-foreground/10"
                    onClick={() => handleCopyApiKey(apiKey)}
                    type="button"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={t("settings.apiKeys.delete")}
                    className="inline-flex items-center justify-center p-1 text-destructive hover:bg-destructive/10"
                    onClick={handleDeleteApiKey}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Button onClick={handleCreateApiKey} type="button">
              {t("settings.apiKeys.createNew")}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{t("settings.reviewSettings.title")}</CardTitle>
          <CardDescription>
            {t("settings.reviewSettings.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div>
              <label
                className="block font-medium text-foreground text-sm"
                htmlFor="ask-again-threshold"
              >
                {t("settings.reviewSettings.askAgainThreshold")}
              </label>
              <p className="mt-1 text-muted-foreground text-xs">
                {t("settings.reviewSettings.askAgainDescription")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                className="w-24"
                id="ask-again-threshold"
                max="100"
                min="1"
                onChange={(e) =>
                  setAskAgainThreshold(
                    Math.max(1, Number.parseInt(e.target.value, 10) || 1)
                  )
                }
                type="number"
                value={askAgainThreshold}
              />
              <span className="font-medium text-foreground text-sm">
                {t("settings.reviewSettings.times")}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              {t("settings.reviewSettings.example")}
            </p>
          </div>

          <div className="flex gap-2 border-border border-t-2 pt-6">
            <Button type="button">
              {t("settings.reviewSettings.saveChanges")}
            </Button>
            <Button type="button" variant="neutral">
              {t("settings.reviewSettings.cancel")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
