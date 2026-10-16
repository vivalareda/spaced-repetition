import type { CardType } from "@shared/types";
import {
  type Card,
  resolveCardType,
} from "@spaced-repetition-monorepo/backend/convex/types/convexTypes";
import { Code, FileText, ListChecks, type LucideIcon } from "lucide-react";

const ICONS: Record<CardType, { Icon: LucideIcon; color: string; bg: string }> =
  {
    code: { Icon: Code, color: "text-blue-600", bg: "bg-blue-50" },
    image: { Icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
    mcq: { Icon: ListChecks, color: "text-emerald-600", bg: "bg-emerald-50" },
    text: { Icon: FileText, color: "text-gray-600", bg: "bg-gray-50" },
  };

/** An icon for the card's type; `badge` puts it in a tinted circle. */
export function CardTypeIcon({ card, badge }: { card: Card; badge?: boolean }) {
  const { Icon, color, bg } = ICONS[resolveCardType(card)];
  const icon = <Icon className={`h-4 w-4 ${color}`} />;

  if (!badge) {
    return icon;
  }
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full ${bg}`}
    >
      {icon}
    </div>
  );
}
