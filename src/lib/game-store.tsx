
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export type Tier = "Silver" | "Gold" | "Diamond" | "God Elite";

export interface ReferralTasks {
  tgJoined: boolean;
  igFollowed: boolean;
  adsWatched: number;
}

export interface Referral {
  uid: string;
  username: string;
  tasks: ReferralTasks;
  joinedAt: number;
  isRewarded: boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  level: number;
  baseCost: number;
  baseBenefit: number;
  type: 'tap' | 'passive';
}

export interface WalletState {
  coins: number;
  usdt: number;
  ton: number;
  bnb: number;
}

export interface UserState {
  id: string;
  uid: string; 
  username: string;
  wallet: WalletState;
  xp: number;
  level: number;
  energy: number;
  maxEnergy: number;
  energyRegenRate: number;
  adsWatched: number;
  tasksCompleted: number;
  tier: Tier;
  lastWithdrawalAt: number | null;
  joinedAt: number;
  avatarUrl?: string;
  referralCode: string;
  referredBy: string | null; 
  referralBonusClaimed: boolean; 
  referralEarnings: number;
  referrals: Referral[];
  ownReferralProgress: ReferralTasks;
  upgrades: Record<string, number>;
  lastPassiveCollection: number;
  boostEndTime: number | null;
  lastVaultClaimAt: number | null;
  comboStreak: number;
  inventory: {
    petFood: number;
    spinTickets: number;
  };
}

interface GameContextType {
  user: UserState;
  offlineEarnings: number;
  mine: () => { amount: number; isCritical: boolean } | null;
  upgrade: (upgradeId: string) => void;
  addCoins: (amount: number) => void;
  watchAd: () => void;
  activateBoost: () => void;
  completeTask: (taskId: string) => void;
  registerWithdrawal: (method: string, address: string) => void;
  claimReferralReward: (targetUid: string) => void;
  claimOfflineEarnings: (triple: boolean) => void;
  getMiningPower: () => number;
  getPassiveIncome: () => number;
  refillEnergy: () => void;
  claimVault: () => void;
  feedPet: () => void;
  incrementStreak: () => void;
}

const UPGRADES: Upgrade[] = [
  { id: 'drill', name: 'Nano Drill', baseCost: 100, baseBenefit: 1, type: 'tap' },
  { id: 'autominer', name: 'Auto-Miner', baseCost: 500, baseBenefit: 2, type: 'passive' },
  { id: 'energy_core', name: 'Energy Core', baseCost: 300, baseBenefit: 50, type: 'tap' },
  { id: 'photon_collector', name: 'Photon Collector', baseCost: 1500, baseBenefit: 10, type: 'passive' },
];

const STORAGE_KEY = 'farmrush_user_v1';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const db = useFirestore();
  const [offlineEarnings, setOfflineEarnings] = useState(0);
  const [user, setUser] = useState<UserState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
    return {
      id: "user_temp",
      uid: "CN000000",
      username: "Operator",
      wallet: { coins: 1000, usdt: 0, ton: 0, bnb: 0 },
      xp: 0,
      level: 1,
      energy: 1000,
      maxEnergy: 1000,
      energyRegenRate: 1,
      adsWatched: 0,
      tasksCompleted: 0,
      tier: "Silver",
      lastWithdrawalAt: null,
      joinedAt: Date.now(),
      referralCode: "RN000000",
      referredBy: null,
      referralBonusClaimed: false,
      referralEarnings: 0,
      referrals: [],
      ownReferralProgress: { tgJoined: false, igFollowed: false, adsWatched: 0 },
      upgrades: { drill: 0, autominer: 0, energy_core: 0, photon_collector: 0 },
      lastPassiveCollection: Date.now(),
      boostEndTime: null,
      lastVaultClaimAt: null,
      comboStreak: 0,
      inventory: { petFood: 0, spinTickets: 0 }
    };
  });

  const getPassiveIncome = useCallback(() => {
    const autoMinerLevel = user.upgrades.autominer || 0;
    const photonLevel = user.upgrades.photon_collector || 0;
    return (autoMinerLevel * 2) + (photonLevel * 10);
  }, [user.upgrades.autominer, user.upgrades.photon_collector]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    const now = Date.now();
    const elapsedSeconds = (now - user.lastPassiveCollection) / 1000;
    const passiveRate = getPassiveIncome();
    const earnings = Math.floor(elapsedSeconds * passiveRate);

    if (earnings > 1) {
      setOfflineEarnings(earnings);
    }

    const generatedUid = "CN" + Math.floor(100000 + Math.random() * 900000);
    const generatedRefCode = "RN" + Math.floor(100000 + Math.random() * 900000);

    setUser(u => ({
      ...u,
      uid: u.uid === "CN000000" ? generatedUid : u.uid,
      referralCode: u.referralCode === "RN000000" ? generatedRefCode : u.referralCode
    }));

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand();
      const tgUser = tg.initDataUnsafe?.user;
      const startParam = tg.initDataUnsafe?.start_param; 

      if (tgUser) {
        setUser(u => ({
          ...u,
          username: tgUser.username || `${tgUser.first_name} ${tgUser.last_name || ""}`.trim(),
          avatarUrl: tgUser.photo_url,
          id: tgUser.id.toString(),
          referredBy: !u.referredBy && startParam && startParam !== u.referralCode ? startParam : u.referredBy
        }));
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUser(u => {
        const passiveIncome = getPassiveIncome();
        const coinsAdded = (passiveIncome / 10);
        const newEnergy = Math.min(u.maxEnergy, u.energy + u.energyRegenRate / 10);
        
        return {
          ...u,
          wallet: {
            ...u.wallet,
            coins: (u.wallet?.coins || 0) + coinsAdded
          },
          energy: newEnergy,
          lastPassiveCollection: Date.now()
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, [getPassiveIncome]);

  const getMiningPower = useCallback(() => {
    const drillLevel = user.upgrades.drill || 0;
    const basePower = 1 + drillLevel * 2;
    const isBoosted = user.boostEndTime && Date.now() < user.boostEndTime;
    return isBoosted ? basePower * 2 : basePower;
  }, [user.upgrades.drill, user.boostEndTime]);

  const mine = () => {
    if (user.energy < 1) return null;
    
    const isCritical = Math.random() < 0.05;
    const power = getMiningPower();
    const amount = isCritical ? power * 5 : power;

    setUser(u => ({
      ...u,
      wallet: {
        ...u.wallet,
        coins: (u.wallet?.coins || 0) + amount
      },
      energy: Math.max(0, u.energy - 1),
      xp: u.xp + (isCritical ? 5 : 1),
      level: Math.floor((u.xp + (isCritical ? 5 : 1)) / 1000) + 1
    }));

    return { amount, isCritical };
  };

  const upgrade = (upgradeId: string) => {
    const upg = UPGRADES.find(x => x.id === upgradeId);
    if (!upg) return;

    const currentLevel = user.upgrades[upgradeId] || 0;
    const cost = Math.floor(upg.baseCost * Math.pow(1.5, currentLevel));

    if ((user.wallet?.coins || 0) >= cost) {
      setUser(u => ({
        ...u,
        wallet: {
          ...u.wallet,
          coins: (u.wallet?.coins || 0) - cost
        },
        upgrades: {
          ...u.upgrades,
          [upgradeId]: currentLevel + 1
        },
        maxEnergy: upgradeId === 'energy_core' ? u.maxEnergy + upg.baseBenefit : u.maxEnergy
      }));
    }
  };

  const addCoins = (amount: number) => setUser(u => ({ 
    ...u, 
    wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + amount } 
  }));
  
  const watchAd = () => {
    setUser(u => ({
      ...u,
      adsWatched: u.adsWatched + 1,
      ownReferralProgress: {
        ...u.ownReferralProgress,
        adsWatched: (u.ownReferralProgress?.adsWatched || 0) + 1
      }
    }));
  };

  const activateBoost = () => {
    setUser(u => ({
      ...u,
      boostEndTime: Date.now() + 60000
    }));
  };

  const refillEnergy = () => {
    setUser(u => ({
      ...u,
      energy: u.maxEnergy
    }));
  };

  const claimVault = () => {
    const reward = 5000 + Math.floor(Math.random() * 5000);
    setUser(u => ({
      ...u,
      wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + reward },
      lastVaultClaimAt: Date.now()
    }));
  };

  const feedPet = () => {
    setUser(u => ({
      ...u,
      inventory: { ...u.inventory, petFood: u.inventory.petFood + 1 }
    }));
  };

  const incrementStreak = () => {
    setUser(u => ({ ...u, comboStreak: u.comboStreak + 1 }));
  };

  const completeTask = (taskId: string) => {
    setUser(u => {
      const newTasks = { ...u.ownReferralProgress };
      if (taskId === "tg_join") newTasks.tgJoined = true;
      if (taskId === "ig_follow") newTasks.igFollowed = true;
      
      return {
        ...u,
        tasksCompleted: (u.tasksCompleted || 0) + 1,
        ownReferralProgress: newTasks
      };
    });
  };

  const registerWithdrawal = (method: string, address: string) => {
    const withdrawalData = {
      uid: user.uid,
      username: user.username,
      coins: user.wallet.coins,
      method: method,
      address: address,
      status: "pending",
      createdAt: Date.now()
    };

    const withdrawalRef = collection(db, "withdrawals");
    addDoc(withdrawalRef, withdrawalData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: withdrawalRef.path,
          operation: 'create',
          requestResourceData: withdrawalData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

    setUser(u => ({ 
      ...u, 
      lastWithdrawalAt: Date.now(),
      wallet: { ...u.wallet, coins: 0 }
    }));
  };

  const claimReferralReward = (targetUid: string) => {
    setUser(u => {
      const ref = u.referrals?.find(r => r.uid === targetUid);
      if (!ref || ref.isRewarded) return u;
      
      const { tgJoined, igFollowed, adsWatched } = ref.tasks || {};
      const isEligible = tgJoined && igFollowed && adsWatched >= 5;
      
      if (!isEligible) return u;

      return {
        ...u,
        wallet: {
          ...u.wallet,
          coins: (u.wallet?.coins || 0) + 5000
        },
        referralEarnings: (u.referralEarnings || 0) + 5000,
        referrals: u.referrals.map(r => r.uid === targetUid ? { ...r, isRewarded: true } : r)
      };
    });
  };

  const claimOfflineEarnings = (triple: boolean) => {
    const finalAmount = triple ? offlineEarnings * 3 : offlineEarnings;
    addCoins(finalAmount);
    setOfflineEarnings(0);
  };

  return (
    <GameContext.Provider value={{ 
      user, offlineEarnings, mine, upgrade, addCoins, watchAd, activateBoost, completeTask, registerWithdrawal, claimReferralReward, claimOfflineEarnings, getMiningPower, getPassiveIncome, refillEnergy, claimVault, feedPet, incrementStreak
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
