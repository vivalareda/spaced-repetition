/** biome-ignore-all lint/performance/noImgElement: <explanation> */
import { Link, useNavigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModalStore } from "@/hooks/use-modal-store";

function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem("language", value);
  };

  return (
    <Select defaultValue={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="h-9 w-auto min-w-[70px] border-2 border-border bg-main text-sm">
        <Globe className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">EN</SelectItem>
        <SelectItem value="fr">FR</SelectItem>
      </SelectContent>
    </Select>
  );
}

function AuthenticatedNav({
  onDashboardClick,
  onHomeClick,
}: {
  onDashboardClick: () => void;
  onHomeClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-10 flex h-24 w-full items-center bg-white px-6 shadow-lg">
      <div className="hidden md:flex md:flex-1">
        <LanguageSelector />
      </div>

      <div className="md:-translate-x-1/2 -ml-14 md:-ml-8 md:absolute md:left-1/2">
        <Link to="/">
          <img
            alt="logo"
            className="cursor-pointer"
            height={300}
            src="/logo.png"
            width={300}
          />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <Button onClick={onHomeClick} size="sm">
          {t("navbar.home")}
        </Button>
        <Button onClick={onDashboardClick} size="sm">
          {t("navbar.dashboard")}
        </Button>
      </div>
    </div>
  );
}

function UnauthenticatedNav() {
  const { onOpen } = useModalStore();
  const { t } = useTranslation();

  const handleSignIn = () => {
    onOpen("sign-in", true);
  };

  const handleSignUp = () => {
    onOpen("sign-up", true);
  };

  return (
    <div className="sticky top-0 z-10 flex h-24 w-full items-center bg-white px-6 shadow-lg">
      <div className="hidden md:flex md:flex-1">
        <LanguageSelector />
      </div>

      <div className="md:-translate-x-1/2 -ml-14 md:-ml-8 md:absolute md:left-1/2">
        <Link to="/">
          <img
            alt="logo"
            className="cursor-pointer"
            height={300}
            src="/logo.png"
            width={300}
          />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <Button onClick={handleSignIn} size="sm" variant="neutral">
          {t("navbar.signIn")}
        </Button>
        <Button onClick={handleSignUp} size="sm">
          {t("navbar.signUp")}
        </Button>
      </div>
    </div>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useConvexAuth();

  const handleDashboardClick = () => {
    navigate({ to: "/dashboard" });
  };

  const handleHomeClick = () => {
    navigate({ to: "/" });
  };

  return !isAuthenticated || isLoading ? (
    <UnauthenticatedNav />
  ) : (
    <AuthenticatedNav
      onDashboardClick={handleDashboardClick}
      onHomeClick={handleHomeClick}
    />
  );
}
