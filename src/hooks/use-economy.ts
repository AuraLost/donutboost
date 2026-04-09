"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EconomyState {
  balance: number;
  initialBonusClaimed: boolean;
  minDeposit: number;
  maxDeposit: number;
  minPayout: number;
  maxPayout: number;
  
  deposit: (amount: number) => boolean;
  withdraw: (amount: number) => boolean;
  bet: (amount: number) => boolean;
  win: (amount: number) => void;
  claimInitialBonus: () => void;
}

export const useEconomy = create<EconomyState>()(
  persist(
    (set, get) => ({
      balance: 0,
      initialBonusClaimed: false,
      minDeposit: 1_000_000,
      maxDeposit: 1_000_000_000_000,
      minPayout: 10_000_000,
      maxPayout: 1_000_000_000,

      claimInitialBonus: () => {
        if (!get().initialBonusClaimed) {
          set((state) => ({ 
            balance: state.balance + 1_000_000, 
            initialBonusClaimed: true 
          }));
        }
      },

      deposit: (amount: number) => {
        if (amount >= get().minDeposit && amount <= get().maxDeposit) {
          set((state) => ({ balance: state.balance + amount }));
          return true;
        }
        return false;
      },

      withdraw: (amount: number) => {
        if (amount >= get().minPayout && amount <= get().maxPayout && get().balance >= amount) {
          set((state) => ({ balance: state.balance - amount }));
          return true;
        }
        return false;
      },

      bet: (amount: number) => {
        if (get().balance >= amount && amount >= 1000) {
          set((state) => ({ balance: state.balance - amount }));
          return true;
        }
        return false;
      },

      win: (amount: number) => {
        set((state) => ({ balance: state.balance + amount }));
      },
    }),
    {
      name: "donutboost-economy",
    }
  )
);
