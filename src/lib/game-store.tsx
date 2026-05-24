
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Tier = "Silver" | "Gold" | "Diamond" | "God Elite";

export interface Referral {
  uid: string;
  username: string;
  adsWatched: number;
  joinedAt: number;
  isRewarded: boolean;
}

export interface Crop {
  id: string;
  name: string;
  growthTime: number; 
  plantedAt: number | null;
  readyAt: number | null;
  type: string;
}

export interface UserState {
  id: string;
  uid: string; 
  username: string;
  coins: number;
  xp: number;
  level: number;
  adsWatched: number;
  tasksCompleted: number;
  tier: Tier;
  spinTickets: number;
  lastWithdrawalAt: number | null;
  joinedAt: number;
  avatarUrl?: string;
  crops: Crop[];
  referralCode: string;
  referredBy: string | null;
  referralEarnings: number;
  referrals: Referral[];
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
  registerWithdrawal: () => void;
  claimReferralReward: (targetUid: string) => void;
}

const INITIAL_CROPS: Crop[] = [
  { id: "plot-1", name: "Plot 1", growthTime: 60, plantedAt: null, readyAt: null, type: "Wheat" },
  { id: "plot-2", name: "Plot 2", growthTime: 120, plantedAt: null, readyAt: null, type: "Corn" },
  { id: "plot-3", name: "Plot 3", growthTime: 180, plantedAt: null, readyAt: null, type: "Potato" },
  { id: "plot-4", name: "Plot 4", growthTime: 300, plantedAt: null, readyAt: null, type: "Carrot" },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState>(() => {
    const refCode = "REF" + Math.floor(100000 + Math.random() * 900000);
    return {
      id: "user_temp",
      uid: "CN" + Math.floor(100000 + Math.random() * 900000),
      username: "CyberFarmer",
      coins: 1000,
      xp: 0,
      level: 1,
      adsWatched: 0,
      tasksCompleted: 0,
      tier: "Silver",
      spinTickets: 5,
      lastWithdrawalAt: null,
      joinedAt: Date.now(),
      crops: INITIAL_CROPS,
      referralCode: refCode,
      referredBy: null,
      referralEarnings: 0,
      referrals: [],
    };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.expand();
        const tgUser = tg.initDataUnsafe?.user;
        const startParam = tg.initDataUnsafe?.start_param; // referral code from link

        if (tgUser) {
          setUser(u => ({
            ...u,
            username: tgUser.username || `${tgUser.first_name} ${tgUser.last_name || ""}`.trim(),
            avatarUrl: tgUser.photo_url,
            id: tgUser.id.toString(),
            referredBy: u.referredBy || (startParam && startParam !== u.referralCode ? startParam : null)
          }));

          // Simulation of the "New User gets 2000" if referred
          if (startParam && startParam !== user.referralCode) {
            // This would normally be handled by a backend function to prevent self-referral
            // For MVP: we set it if it's the first time
          }
        }
      }
    }
  }, []);

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
  const registerWithdrawal = () => setUser(u => ({ ...u, lastWithdrawalAt: Date.now() }));

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

  const claimReferralReward = (targetUid: string) => {
    setUser(u => {
      const ref = u.referrals.find(r => r.uid === targetUid);
      if (!ref || ref.isRewarded) return u;
      
      const isEligible = ref.adsWatched >= 5 && (Date.now() - ref.joinedAt > 24 * 60 * 60 * 1000);
      if (!isEligible) return u;

      return {
        ...u,
        coins: u.coins + 5000,
        referralEarnings: u.referralEarnings + 5000,
        referrals: u.referrals.map(r => r.uid === targetUid ? { ...r, isRewarded: true } : r)
      };
    });
  };

  return (
    <GameContext.Provider value={{ 
      user, addCoins, addXp, claimHarvest, plantCrop, watchAd, completeTask, spendTickets, registerWithdrawal, claimReferralReward 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
