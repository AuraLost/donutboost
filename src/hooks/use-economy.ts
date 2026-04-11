"use client";

import { create } from "zustand";

interface EconomyState {
  balance: number;
  totalWins: number;
  totalLosses: number;
  totalWagered: number;
  totalPayout: number;
  minDeposit: number;
  maxDeposit: number;
  minPayout: number;
  maxPayout: number;
  hydratedFromServer: boolean;

  hydrateFromUser: () => Promise<void>;
  setFromServer: (payload: {
    balance: number;
    totalWins: number;
    totalLosses: number;
    totalWagered: number;
    totalPayout: number;
  }) => void;
  deposit: (amount: number) => boolean;
  withdraw: (amount: number) => boolean;
  bet: (amount: number) => boolean;
  win: (amount: number) => void;
  recordLoss: (amount: number) => void;
  recordWin: (betAmount: number, payoutAmount: number) => void;
}

const pushEconomyToServer = async (state: EconomyState) => {
  try {
    await fetch("/api/economy/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        balance: state.balance,
        totalWins: state.totalWins,
        totalLosses: state.totalLosses,
        totalWagered: state.totalWagered,
        totalPayout: state.totalPayout,
      }),
    });
  } catch {
    // Silent retry on next local update.
  }
};

const commitAndSync = (next: EconomyState) => {
  void pushEconomyToServer(next);
  return next;
};

export const useEconomy = create<EconomyState>()((set, get) => ({
  balance: 0,
  totalWins: 0,
  totalLosses: 0,
  totalWagered: 0,
  totalPayout: 0,
  minDeposit: 1_000_000,
  maxDeposit: 1_000_000_000_000,
  minPayout: 10_000_000,
  maxPayout: 1_000_000_000,
  hydratedFromServer: false,

  hydrateFromUser: async () => {
    if (get().hydratedFromServer) return;
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!data?.user) return;

      set({
        balance: Number(data.user.balance || 0),
        totalWins: Number(data.user.totalWins || 0),
        totalLosses: Number(data.user.totalLosses || 0),
        totalWagered: Number(data.user.totalWagered || 0),
        totalPayout: Number(data.user.totalPayout || 0),
        hydratedFromServer: true,
      });
    } catch {
      // Leave local defaults.
    }
  },

  setFromServer: (payload) => {
    set({
      balance: Number(payload.balance || 0),
      totalWins: Number(payload.totalWins || 0),
      totalLosses: Number(payload.totalLosses || 0),
      totalWagered: Number(payload.totalWagered || 0),
      totalPayout: Number(payload.totalPayout || 0),
      hydratedFromServer: true,
    });
  },

  deposit: (amount: number) => {
    const state = get();
    if (amount >= state.minDeposit && amount <= state.maxDeposit) {
      set((current) => commitAndSync({ ...current, balance: current.balance + amount }));
      return true;
    }
    return false;
  },

  withdraw: (amount: number) => {
    const state = get();
    if (amount >= state.minPayout && amount <= state.maxPayout && state.balance >= amount) {
      set((current) => commitAndSync({ ...current, balance: current.balance - amount }));
      return true;
    }
    return false;
  },

  bet: (amount: number) => {
    const state = get();
    if (state.balance >= amount && amount >= 1000) {
      set((current) =>
        commitAndSync({
          ...current,
          balance: current.balance - amount,
          totalWagered: current.totalWagered + amount,
        })
      );
      return true;
    }
    return false;
  },

  win: (amount: number) => {
    set((current) => commitAndSync({ ...current, balance: current.balance + amount }));
  },

  recordLoss: () => {
    set((current) => commitAndSync({ ...current, totalLosses: current.totalLosses + 1 }));
  },

  recordWin: (_betAmount: number, payoutAmount: number) => {
    set((current) =>
      commitAndSync({
        ...current,
        totalWins: current.totalWins + 1,
        totalPayout: current.totalPayout + payoutAmount,
      })
    );
  },
}));
