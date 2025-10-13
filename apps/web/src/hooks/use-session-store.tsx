import type { Card } from "@shared/types";
import { create } from "zustand";

type SessionStore = {
  reviewQueue: Card[];
  currentIndex: number;
  startSession: (cards: Card[]) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
  reviewQueue: [],
  currentIndex: 0,
  startSession: (cards) =>
    set(() => ({
      reviewQueue: cards,
      currentIndex: 0,
    })),
  clearSession: () =>
    set(() => ({
      reviewQueue: [],
      currentIndex: 0,
    })),
}));
