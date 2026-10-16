import { useClerk } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { Globe, Settings } from "lucide-react";
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

function AuthenticatedActions() {
  const { t } = useTranslation();
  const { signOut } = useClerk();

  return (
    <>
      <div className="hidden md:flex">
        <Button asChild size="sm">
          <Link to="/">{t("navbar.home")}</Link>
        </Button>
      </div>
      <Button asChild size="sm">
        <Link to="/dashboard">{t("navbar.dashboard")}</Link>
      </Button>
      <div className="hidden lg:flex">
        <Button asChild size="icon" variant="neutral">
          <Link to="/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <Button onClick={() => signOut()} size="sm" variant="neutral">
        {t("navbar.signOut")}
      </Button>
    </>
  );
}

function UnauthenticatedActions() {
  const { t } = useTranslation();
  const { onOpen } = useModalStore();

  return (
    <>
      <Button onClick={() => onOpen("sign-in")} size="sm" variant="neutral">
        {t("navbar.signIn")}
      </Button>
      <Button asChild size="sm">
        <Link to="/sign-up">{t("navbar.signUp")}</Link>
      </Button>
    </>
  );
}

export function Navbar() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const showSignedIn = isAuthenticated && !isLoading;

  return (
    <div className="sticky top-0 z-10 flex h-24 w-full items-center bg-white px-6 shadow-lg">
      <div className="hidden md:flex md:flex-1 md:gap-2">
        <LanguageSelector />
        {!showSignedIn && (
          <Link to="/privacy">
            <Button size="sm" variant="neutral">
              Privacy
            </Button>
          </Link>
        )}
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
        {showSignedIn ? <AuthenticatedActions /> : <UnauthenticatedActions />}
      </div>
    </div>
  );
}
