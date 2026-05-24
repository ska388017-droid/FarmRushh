
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Tier = "Silver" | "Gold" | "Diamond" | "God Elite";

export interface Crop {
  id: string;
  name: string;
  growthTime: number; // in seconds
  plantedAt: number | null; // timestamp
  readyAt: number | null; // timestamp
  type: string;
}

export interface UserState {
  id: string;
  username: string;
  coins: number;
  inr: number;
  usdt: number;
  xp: number;
  level: number;
  adsWatched: number;
  tasksCompleted: number;
  isVerified: boolean;
  tier: Tier;
  spinTickets: number;
  lastDailyCheckin: number | null;
  checkinStreak: number;
  joinedAt: number;
  crops: Crop[];
  pets: string[];
}

interface GameContextType {
  user: UserState;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  claimHarvest: (cropId: string) => void;
  plantCrop: (cropId: string, type: string) => void;
  watchAd: () => void;
  completeTask: () => void;
  spendTickets: (amount: number) => void;
  dailyCheckin: () => void;
}

const INITIAL_CROPS: Crop[] = [
  { id: "plot-1", name: "Plot 1", growthTime: 60, plantedAt: null, readyAt: null, type: "Wheat" },
  { id: "plot-2", name: "Plot 2", growthTime: 120, plantedAt: null, readyAt: null, type: "Corn" },
  { id: "plot-3", name: "Plot 3", growthTime: 180, plantedAt: null, readyAt: null, type: "Potato" },
  { id: "plot-4", name: "Plot 4", growthTime: 300, plantedAt: null, readyAt: null, type: "Carrot" },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState>({
    id: "user_123",
    username: "CyberFarmer",
    coins: 1000,
    inr: 0,
    usdt: 0,
    xp: 0,
    level: 1,
    adsWatched: 0,
    tasksCompleted: 0,
    isVerified: false,
    tier: "Silver",
    spinTickets: 5,
    lastDailyCheckin: null,
    checkinStreak: 0,
    joinedAt: Date.now() - (4 * 24 * 60 * 60 * 1000), // 4 days ago
    crops: INITIAL_CROPS,
    pets: ["CyberCat"],
  });

  const addCoins = (amount: number) => setUser(u => ({ ...u, coins: u.coins + amount }));
  const addXp = (amount: number) => {
    setUser(u => {
      const newXp = u.xp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      return { ...u, xp: newXp, level: newLevel };
    });
  };

  const watchAd = () => setUser(u => ({ ...u, adsWatched: u.adsWatched + 1 }));
  const completeTask = () => setUser(u => ({ ...u, tasksCompleted: u.tasksCompleted + 1 }));
  const spendTickets = (amount: number) => setUser(u => ({ ...u, spinTickets: Math.max(0, u.spinTickets - amount) }));

  const plantCrop = (cropId: string, type: string) => {
    setUser(u => ({
      ...u,
      crops: u.crops.map(c => {
        if (c.id === cropId) {
          const now = Date.now();
          return { ...c, plantedAt: now, readyAt: now + c.growthTime * 1000, type };
        }
        return c;
      })
    }));
  };

  const claimHarvest = (cropId: string) => {
    setUser(u => {
      const crop = u.crops.find(c => c.id === cropId);
      if (!crop || !crop.readyAt || Date.now() < crop.readyAt) return u;
      return {
        ...u,
        coins: u.coins + 250,
        xp: u.xp + 50,
        crops: u.crops.map(c => c.id === cropId ? { ...c, plantedAt: null, readyAt: null } : c)
      };
    });
  };

  const dailyCheckin = () => {
    setUser(u => ({
      ...u,
      coins: u.coins + 500,
      spinTickets: u.spinTickets + 1,
      checkinStreak: u.checkinStreak + 1,
      lastDailyCheckin: Date.now()
    }));
  };

  return React.createElement(
    GameContext.Provider,
    { value: { user, addCoins, addXp, claimHarvest, plantCrop, watchAd, completeTask, spendTickets, dailyCheckin } },
    children
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
