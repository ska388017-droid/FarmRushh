
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { toast } from "@/hooks/use-toast";

export type Tier = "Silver" | "Gold" | "Diamond" | "God Elite";
export type VIPPlan = "none" | "Silver" | "Gold" | "Diamond";

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
  vipStatus: VIPPlan;
  vipExpiry: number | null;
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
  upgrades: Record<string, number>;
  lastPassiveCollection: number;
  boostEndTime: number | null;
  lastVaultClaimAt: number | null;
  comboStreak: number;
  claimedAdMilestones: string[];
  claimedReferralMilestones: string[];
  unlockedChests: string[];
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
  watchAd: (isCinema?: boolean) => void;
  claimHourlyAdBonus: () => void;
  enterAdLottery: () => void;
  claimAdChest: (chestId: string, reward: number) => boolean;
  activateBoost: () => void;
  completeTask: (taskId: string) => void;
  claimAdMilestone: (milestoneId: string, rewardCoins: number, rewardTickets?: number) => void;
  claimReferralMilestone: (milestoneId: string, rewardCoins: number) => void;
  registerWithdrawal: (method: string, address: string, coins: number, usdt: number) => void;
  submitVIPRequest: (plan: VIPPlan, txHash: string, price: number) => Promise<boolean>;
  claimReferralReward: (targetUid: string) => void;
  claimOfflineEarnings: (triple: boolean) => boolean;
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
  { id: 'energy_core', name: 'Energy Core', baseCost: 300, baseBenefit: 100, type: 'tap' }, // Buffed for higher energy pool
  { id: 'photon_collector', name: 'Photon Collector', baseCost: 1500, baseBenefit: 10, type: 'passive' },
];

const STORAGE_KEY = 'farmrush_user_v4';

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
      wallet: { coins: 1000, usdt: 0, ton: 0, bnb: 0 },
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
      vipStatus: "none",
      vipExpiry: null,
      lastWithdrawalAt: null,
      lastWithdrawalAmount: null,
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
      claimedAdMilestones: [],
      claimedReferralMilestones: [],
      unlockedChests: [],
      inventory: { petFood: 0, spinTickets: 0 }
    };
  });

  const getPassiveIncome = useCallback(() => {
    const autoMinerLevel = user.upgrades.autominer || 0;
    const photonLevel = user.upgrades.photon_collector || 0;
    let income = (autoMinerLevel * 2) + (photonLevel * 10);
    if (user.vipStatus === "Silver") income *= 1.2;
    if (user.vipStatus === "Gold") income *= 1.5;
    if (user.vipStatus === "Diamond") income *= 2.0;
    return income;
  }, [user.upgrades, user.vipStatus]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    const now = Date.now();
    const elapsedSeconds = (now - user.lastPassiveCollection) / 1000;
    const passiveRate = getPassiveIncome();
    const earnings = Math.floor(elapsedSeconds * passiveRate);

    if (earnings > 1) setOfflineEarnings(earnings);

    const generatedUid = "CN" + Math.floor(100000 + Math.random() * 900000);
    const generatedRefCode = "RN" + Math.floor(100000 + Math.random() * 900000);

    setUser(u => {
      let vMax = 1000;
      if (u.vipStatus === "Silver") vMax = 2500;
      if (u.vipStatus === "Gold") vMax = 5000;
      if (u.vipStatus === "Diamond") vMax = 10000;
      
      return {
        ...u,
        uid: u.uid === "CN000000" ? generatedUid : u.uid,
        referralCode: u.referralCode === "RN000000" ? generatedRefCode : u.referralCode,
        maxEnergy: vMax + (u.upgrades.energy_core * 100)
      };
    });

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand();
      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        setUser(u => ({
          ...u,
          username: tgUser.username || `${tgUser.first_name} ${tgUser.last_name || ""}`.trim(),
          avatarUrl: tgUser.photo_url,
          id: tgUser.id.toString(),
        }));
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUser(u => {
        let newVip = u.vipStatus;
        let newExpiry = u.vipExpiry;
        if (newExpiry && now > newExpiry) {
          newVip = "none";
          newExpiry = null;
        }

        const passiveIncome = getPassiveIncome();
        const coinsAdded = (passiveIncome / 10);
        
        // Remove incremental regen - energy is now primarily ad-based
        return {
          ...u,
          vipStatus: newVip,
          vipExpiry: newExpiry,
          wallet: {
            ...u.wallet,
            coins: (u.wallet?.coins || 0) + coinsAdded
          },
          lastPassiveCollection: now
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [getPassiveIncome]);

  const getMiningPower = useCallback(() => {
    const drillLevel = user.upgrades.drill || 0;
    let basePower = 1 + drillLevel * 2;
    const isBoosted = user.boostEndTime && Date.now() < user.boostEndTime;
    let power = isBoosted ? basePower * 2 : basePower;
    
    if (user.vipStatus === "Silver") power *= 1.5;
    if (user.vipStatus === "Gold") power *= 2.0;
    if (user.vipStatus === "Diamond") power *= 3.0;
    
    return Math.floor(power);
  }, [user.upgrades.drill, user.boostEndTime, user.vipStatus]);

  const mine = () => {
    if (user.energy < 1) return null;
    const power = getMiningPower();
    const isCritical = Math.random() < (user.vipStatus !== "none" ? 0.15 : 0.05);
    const amount = isCritical ? power * 5 : power;

    setUser(u => ({
      ...u,
      wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + amount },
      energy: Math.max(0, u.energy - 1),
      xp: u.xp + (isCritical ? 5 : 1),
      level: Math.floor((u.xp + 1) / 1000) + 1
    }));
    return { amount, isCritical };
  };

  const upgrade = (upgradeId: string) => {
    const upg = UPGRADES.find(x => x.id === upgradeId);
    if (!upg) return;
    const currentLevel = user.upgrades[upgradeId] || 0;
    const cost = Math.floor(upg.baseCost * Math.pow(1.5, currentLevel));
    if ((user.wallet?.coins || 0) >= cost) {
      setUser(u => {
        let vMax = 1000;
        if (u.vipStatus === "Silver") vMax = 2500;
        if (u.vipStatus === "Gold") vMax = 5000;
        if (u.vipStatus === "Diamond") vMax = 10000;
        
        return {
          ...u,
          wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) - cost },
          upgrades: { ...u.upgrades, [upgradeId]: currentLevel + 1 },
          maxEnergy: upgradeId === 'energy_core' ? vMax + ((currentLevel + 1) * 100) : u.maxEnergy
        }
      });
    }
  };

  const addCoins = (amount: number) => setUser(u => ({ 
    ...u, 
    wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + amount } 
  }));
  
  const watchAd = (isCinema: boolean = false) => {
    const now = Date.now();
    setUser(u => ({
      ...u,
      adsWatched: u.adsWatched + 1,
      lifetimeAds: (u.lifetimeAds || 0) + 1,
      lastAdAt: now,
      cinemaAdsWatched: isCinema ? (u.cinemaAdsWatched || 0) + 1 : u.cinemaAdsWatched,
      ownReferralProgress: { ...u.ownReferralProgress, adsWatched: u.ownReferralProgress.adsWatched + 1 }
    }));
  };

  const submitVIPRequest = async (plan: VIPPlan, txHash: string, price: number) => {
    if (!db) return false;
    const q = query(collection(db, "vip_requests"), where("txHash", "==", txHash));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      toast({ title: "Error", description: "This transaction hash has already been submitted.", variant: "destructive" });
      return false;
    }
    const requestData = { uid: user.uid, username: user.username, plan, txHash, price, status: "pending", createdAt: Date.now() };
    addDoc(collection(db, "vip_requests"), requestData).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/vip_requests', operation: 'create', requestResourceData: requestData }));
    });
    return true;
  };

  const claimAdMilestone = (milestoneId: string, rewardCoins: number, rewardTickets: number = 0) => {
    setUser(u => {
      if (u.claimedAdMilestones?.includes(milestoneId)) return u;
      return {
        ...u,
        wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + rewardCoins },
        claimedAdMilestones: [...(u.claimedAdMilestones || []), milestoneId]
      };
    });
  };

  const registerWithdrawal = (method: string, address: string, coins: number, usdt: number) => {
    const withdrawalData = { uid: user.uid, username: user.username, coins, usdtAmount: usdt, method, address, status: "pending", createdAt: Date.now() };
    addDoc(collection(db, "withdrawals"), withdrawalData);
    setUser(u => ({ 
      ...u, 
      lastWithdrawalAt: Date.now(),
      lastWithdrawalAmount: usdt,
      wallet: { ...u.wallet, coins: Math.max(0, u.wallet.coins - coins) }
    }));
  };

  const refillEnergy = () => setUser(u => ({ ...u, energy: u.maxEnergy }));
  const claimAdChest = (id: string, r: number) => {
    if (user.energy < 15) return false;
    setUser(u => ({ ...u, wallet: { ...u.wallet, coins: u.wallet.coins + r }, energy: u.energy - 15, unlockedChests: [...u.unlockedChests, id] }));
    return true;
  };
  const enterAdLottery = () => setUser(u => ({ ...u, lotteryEntries: u.lotteryEntries + 1 }));
  const activateBoost = () => setUser(u => ({ ...u, boostEndTime: Date.now() + 60000 }));
  const claimReferralMilestone = (id: string, r: number) => setUser(u => ({ ...u, wallet: { ...u.wallet, coins: u.wallet.coins + r }, claimedReferralMilestones: [...u.claimedReferralMilestones, id] }));
  const claimOfflineEarnings = (t: boolean) => {
    if (user.energy < 10) return false;
    const amount = t ? offlineEarnings * 3 : offlineEarnings;
    addCoins(amount);
    setUser(u => ({ ...u, energy: Math.max(0, u.energy - 10) }));
    setOfflineEarnings(0);
    return true;
  };

  const claimVault = () => {};
  const claimReferralReward = (uid: string) => {};
  const feedPet = () => {};
  const incrementStreak = () => {};
  const completeTask = (id: string) => setUser(u => ({ ...u, tasksCompleted: u.tasksCompleted + 1, ownReferralProgress: { ...u.ownReferralProgress, [id === 'tg_join' ? 'tgJoined' : 'igFollowed']: true } }));
  const claimHourlyAdBonus = () => {};

  return (
    <GameContext.Provider value={{ 
      user, offlineEarnings, mine, upgrade, addCoins, watchAd, claimHourlyAdBonus, enterAdLottery, claimAdChest, activateBoost, completeTask, claimAdMilestone, claimReferralMilestone, registerWithdrawal, submitVIPRequest, claimReferralReward, claimOfflineEarnings, getMiningPower, getPassiveIncome, refillEnergy, claimVault, feedPet, incrementStreak
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
