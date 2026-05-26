"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, doc, updateDoc, query, where, getDocs, getDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { toast } from "@/hooks/use-toast";

export type Tier = "Silver" | "Gold" | "Diamond" | "God Elite";
export type VIPPlan = "none" | "Silver" | "Gold" | "Diamond";
export type TaskStatus = 'not_started' | 'opened' | 'completed';

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
  isVerified: boolean;
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
  lastEnergyRegenAt: number;
  adsWatched: number;
  cinemaAdsWatched: number;
  lifetimeAds: number;
  adStreak: number;
  lastAdAt: number | null;
  lastHourlyAdAt: number | null;
  lotteryEntries: number;
  tasksCompleted: number;
  tier: Tier;
  vip: boolean;
  vipPlan: VIPPlan;
  vipExpire: number | null;
  lastWithdrawalAt: number | null;
  lastWithdrawalAmount: number | null;
  joinedAt: number;
  avatarUrl?: string;
  referralCode: string;
  referredBy: string | null; 
  referralBonusClaimed: boolean; 
  referralEarnings: number;
  referrals: Referral[];
  ownReferralProgress: ReferralTasks;
  socialTasks: Record<string, TaskStatus>;
  upgrades: Record<string, number>;
  lastPassiveCollection: number;
  boostEndTime: number | null;
  lastVaultClaimAt: number | null;
  comboStreak: number;
  claimedAdMilestones: string[];
  claimedReferralMilestones: string[];
  unlockedChests: string[]; 
  lastChestClaims: Record<string, number>;
  lastDailyRewardAt: number | null;
  lastCinemaClaimAt: number | null;
  inventory: {
    spinTickets: number;
  };
}

interface GameContextType {
  user: UserState;
  offlineEarnings: number;
  mine: () => { amount: number; isCritical: boolean } | null;
  upgrade: (upgradeId: string) => void;
  addCoins: (amount: number) => void;
  watchAd: (isCinema?: boolean) => void;
  claimHourlyAdBonus: () => void;
  enterAdLottery: () => void;
  claimAdChest: (chestId: string, reward: number) => boolean;
  activateBoost: () => void;
  completeTask: (taskId: string, reward: number) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  claimAdMilestone: (milestoneId: string, rewardCoins: number, rewardTickets?: number) => void;
  claimReferralMilestone: (milestoneId: string, rewardCoins: number) => void;
  registerWithdrawal: (method: string, address: string, coins: number, usdt: number) => void;
  submitVIPRequest: (plan: VIPPlan, txHash: string, price: number) => Promise<boolean>;
  claimReferralReward: (targetUid: string) => void;
  claimOfflineEarnings: (triple: boolean) => boolean;
  claimDailyReward: () => void;
  getMiningPower: () => number;
  getPassiveIncome: () => number;
  refillEnergy: () => void;
}

const UPGRADES: Upgrade[] = [
  { id: 'drill', name: 'Nano Drill', baseCost: 100, baseBenefit: 1, type: 'tap' },
  { id: 'energy_core', name: 'Energy Core', baseCost: 300, baseBenefit: 100, type: 'tap' },
];

// Incremented version to v9 for cache busting
const STORAGE_KEY = 'farmrush_user_v9';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const db = useFirestore();
  const [offlineEarnings, setOfflineEarnings] = useState(0);
  
  const [user, setUser] = useState<UserState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      id: "user_temp",
      uid: "CN000000",
      username: "Operator",
      wallet: { coins: 1000, usdt: 0 },
      xp: 0,
      level: 1,
      energy: 1000,
      maxEnergy: 1000,
      lastEnergyRegenAt: Date.now(),
      adsWatched: 0,
      cinemaAdsWatched: 0,
      lifetimeAds: 0,
      adStreak: 0,
      lastAdAt: null,
      lastHourlyAdAt: null,
      lotteryEntries: 0,
      tasksCompleted: 0,
      tier: "Silver",
      vip: false,
      vipPlan: "none",
      vipExpire: null,
      lastWithdrawalAt: null,
      lastWithdrawalAmount: null,
      joinedAt: Date.now(),
      referralCode: "RN000000",
      referredBy: null,
      referralBonusClaimed: false,
      referralEarnings: 0,
      referrals: [],
      ownReferralProgress: { tgJoined: false, igFollowed: false, adsWatched: 0 },
      socialTasks: {},
      upgrades: { drill: 0, energy_core: 0 },
      lastPassiveCollection: Date.now(),
      boostEndTime: null,
      lastVaultClaimAt: null,
      comboStreak: 0,
      claimedAdMilestones: [],
      claimedReferralMilestones: [],
      unlockedChests: [],
      lastChestClaims: {},
      lastDailyRewardAt: null,
      lastCinemaClaimAt: null,
      inventory: { spinTickets: 0 }
    };
  });

  useEffect(() => {
    if (!db || user.uid === "CN000000") return;
    
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<UserState>;
        setUser(u => ({ ...u, ...data }));
      } else {
        updateDoc(userRef, user).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, [db, user.uid]);

  // Persist to localstorage for instant load
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  const getMiningPower = useCallback(() => {
    const drillLevel = user.upgrades.drill || 0;
    let basePower = 1 + drillLevel * 2;
    const isBoosted = user.boostEndTime && Date.now() < user.boostEndTime;
    let power = isBoosted ? basePower * 2 : basePower;
    
    if (user.vipPlan === "Silver") power *= 2.5; 
    if (user.vipPlan === "Gold") power *= 4.5;
    if (user.vipPlan === "Diamond") power *= 10.0;
    
    return Math.floor(power);
  }, [user.upgrades.drill, user.boostEndTime, user.vipPlan]);

  const claimDailyReward = () => {
    const now = Date.now();
    const lastClaim = user.lastDailyRewardAt || 0;
    const oneDay = 24 * 60 * 60 * 1000;

    if (user.vip !== true) {
      toast({ title: "VIP Required", description: "This feature is for VIP members only.", variant: "destructive" });
      return;
    }

    if (now - lastClaim < oneDay) {
      const remaining = oneDay - (now - lastClaim);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      toast({ title: "Wait!", description: `Reward ready in ${hours}h.` });
      return;
    }

    let reward = 5000;
    if (user.vipPlan === "Silver") reward = 15000;
    if (user.vipPlan === "Gold") reward = 40000;
    if (user.vipPlan === "Diamond") reward = 100000;

    setUser(u => ({
      ...u,
      wallet: { ...u.wallet, coins: u.wallet.coins + reward },
      lastDailyRewardAt: now
    }));
    
    if (db) {
      updateDoc(doc(db, "users", user.uid), {
        "wallet.coins": user.wallet.coins + reward,
        lastDailyRewardAt: now
      });
    }

    toast({ title: "Success!", description: `+${reward.toLocaleString()} CyberCoins claimed.` });
  };

  const submitVIPRequest = async (plan: VIPPlan, txHash: string, price: number) => {
    if (!db) return false;
    try {
      const q = query(collection(db, "vip_requests"), where("txHash", "==", txHash));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        toast({ title: "Error", description: "Transaction already submitted.", variant: "destructive" });
        return false;
      }
      const requestData = { uid: user.uid, username: user.username, plan, txHash, price, status: "pending", createdAt: Date.now() };
      await addDoc(collection(db, "vip_requests"), requestData);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const mine = () => {
    if (user.energy < 1) return null;
    const power = getMiningPower();
    const isCritical = Math.random() < (user.vip ? 0.25 : 0.05);
    const amount = isCritical ? power * 5 : power;

    const newCoins = (user.wallet?.coins || 0) + amount;
    const newEnergy = Math.max(0, user.energy - 1);
    const newXp = user.xp + (isCritical ? 10 : 2);
    const newLevel = Math.floor(newXp / 1000) + 1;

    setUser(u => ({
      ...u,
      wallet: { ...u.wallet, coins: newCoins },
      energy: newEnergy,
      xp: newXp,
      level: newLevel
    }));
    return { amount, isCritical };
  };

  const addCoins = (amount: number) => setUser(u => ({ ...u, wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + amount } }));
  
  const watchAd = (isCinema: boolean = false) => {
    setUser(u => {
      const nextCinema = isCinema ? (u.cinemaAdsWatched || 0) + 1 : u.cinemaAdsWatched;
      return {
        ...u,
        adsWatched: u.adsWatched + 1,
        cinemaAdsWatched: nextCinema,
      };
    });
  };

  const claimAdMilestone = (milestoneId: string, rewardCoins: number) => {
    setUser(u => ({ 
      ...u, 
      wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + rewardCoins }, 
      claimedAdMilestones: [...(u.claimedAdMilestones || []), milestoneId] 
    }));
  };

  const registerWithdrawal = (method: string, address: string, coins: number, usdt: number) => {
    if (db) addDoc(collection(db, "withdrawals"), { uid: user.uid, username: user.username, coins, usdtAmount: usdt, method, address, status: "pending", createdAt: Date.now() });
    setUser(u => ({ ...u, wallet: { ...u.wallet, coins: Math.max(0, u.wallet.coins - coins) } }));
  };

  const refillEnergy = () => setUser(u => ({ ...u, energy: u.maxEnergy }));
  
  const claimAdChest = (id: string, r: number) => {
    setUser(u => ({ ...u, wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + r }, lastChestClaims: { ...(u.lastChestClaims || {}), [id]: Date.now() } }));
    return true;
  };

  const enterAdLottery = () => setUser(u => ({ ...u, lotteryEntries: u.lotteryEntries + 1 }));
  const activateBoost = () => setUser(u => ({ ...u, boostEndTime: Date.now() + 60000 }));
  
  const upgrade = (upgradeId: string) => {
    const upg = UPGRADES.find(x => x.id === upgradeId);
    if (!upg) return;
    const currentLevel = user.upgrades[upgradeId] || 0;
    const cost = Math.floor(upg.baseCost * Math.pow(1.5, currentLevel));
    if (user.wallet.coins >= cost) {
      setUser(u => ({
        ...u,
        wallet: { ...u.wallet, coins: u.wallet.coins - cost },
        upgrades: { ...u.upgrades, [upgradeId]: currentLevel + 1 }
      }));
    }
  };

  const completeTask = (id: string, r: number) => setUser(u => ({ ...u, wallet: { ...u.wallet, coins: u.wallet.coins + r }, socialTasks: { ...u.socialTasks, [id]: 'completed' } }));
  const updateTaskStatus = (id: string, s: TaskStatus) => setUser(u => ({ ...u, socialTasks: { ...u.socialTasks, [id]: s } }));
  const claimReferralMilestone = (id: string, r: number) => setUser(u => ({ ...u, wallet: { ...u.wallet, coins: u.wallet.coins + r }, claimedReferralMilestones: [...u.claimedReferralMilestones, id] }));
  const claimReferralReward = (uid: string) => setUser(u => ({ ...u, wallet: { ...u.wallet, coins: u.wallet.coins + 5000 }, referralEarnings: u.referralEarnings + 5000 }));
  const claimOfflineEarnings = (t: boolean) => true;
  const getPassiveIncome = () => 0;

  return (
    <GameContext.Provider value={{ 
      user, offlineEarnings, mine, upgrade, addCoins, watchAd, claimHourlyAdBonus: () => {}, enterAdLottery, claimAdChest, activateBoost, completeTask, updateTaskStatus, claimAdMilestone, claimReferralMilestone, registerWithdrawal, submitVIPRequest, claimReferralReward, claimOfflineEarnings, getMiningPower, getPassiveIncome, refillEnergy, claimDailyReward
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
