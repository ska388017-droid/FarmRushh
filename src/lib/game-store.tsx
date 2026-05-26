
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
  claimVault: () => void;
  feedPet: () => void;
  incrementStreak: () => void;
}

const UPGRADES: Upgrade[] = [
  { id: 'drill', name: 'Nano Drill', baseCost: 100, baseBenefit: 1, type: 'tap' },
  { id: 'energy_core', name: 'Energy Core', baseCost: 300, baseBenefit: 100, type: 'tap' },
];

const STORAGE_KEY = 'farmrush_user_v8';

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
      inventory: { petFood: 0, spinTickets: 0 }
    };
  });

  // Sync user profile with Firestore
  useEffect(() => {
    if (!db || user.uid === "CN000000") return;
    
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<UserState>;
        setUser(u => ({ ...u, ...data }));
      } else {
        // Initialize doc if missing
        updateDoc(userRef, user).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, [db, user.uid === "CN000000"]);

  // Handle Referral Join Logic
  useEffect(() => {
    const initReferral = async () => {
      if (!db || user.uid === "CN000000") return;

      const tg = (window as any).Telegram?.WebApp;
      const startParam = tg?.initDataUnsafe?.start_param;

      if (startParam && !user.referredBy && startParam !== user.referralCode) {
        const usersRef = collection(db, "users");
        const q = query(where("referralCode", "==", startParam));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const inviterDoc = querySnapshot.docs[0];
          const inviterData = inviterDoc.data() as UserState;
          
          if (inviterData.uid === user.uid) {
            toast({ title: "Self-Referral Blocked", description: "You cannot refer yourself." });
            return;
          }

          const newReferral: Referral = {
            uid: user.uid,
            username: user.username,
            tasks: { tgJoined: false, igFollowed: false, adsWatched: 0 },
            joinedAt: Date.now(),
            isRewarded: false,
            isVerified: false
          };

          await updateDoc(doc(db, "users", inviterData.uid), {
            referrals: arrayUnion(newReferral)
          });

          setUser(u => ({ ...u, referredBy: inviterData.uid }));
          updateDoc(doc(db, "users", user.uid), { referredBy: inviterData.uid });
          toast({ title: "Welcome Bonus!", description: "You joined via referral! Complete 3 tasks to unlock bonus." });
        }
      }
    };

    initReferral();
  }, [db, user.uid === "CN000000"]);

  const syncReferralProgress = useCallback(async (updates: Partial<ReferralTasks>) => {
    if (!db || !user.referredBy) return;

    const inviterRef = doc(db, "users", user.referredBy);
    const inviterSnap = await getDoc(inviterRef);
    
    if (inviterSnap.exists()) {
      const inviterData = inviterSnap.data() as UserState;
      const updatedReferrals = inviterData.referrals.map(ref => {
        if (ref.uid === user.uid) {
          const newTasks = { ...ref.tasks, ...updates };
          const isVerified = newTasks.adsWatched >= 3 || Object.values(user.socialTasks).filter(s => s === 'completed').length >= 3;
          return { ...ref, tasks: newTasks, isVerified };
        }
        return ref;
      });

      await updateDoc(inviterRef, { referrals: updatedReferrals });
    }
  }, [db, user.referredBy, user.socialTasks]);

  // Passive Income is permanently disabled/set to 0
  const getPassiveIncome = useCallback(() => {
    return 0;
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    const now = Date.now();
    
    // Disable offline earnings calculation based on passive rate
    setOfflineEarnings(0);

    const generatedUid = "CN" + Math.floor(100000 + Math.random() * 900000);
    const generatedRefCode = "RN" + Math.floor(100000 + Math.random() * 900000);

    setUser(u => {
      let vMax = 1000;
      if (u.vipStatus === "Silver") vMax = 2500;
      if (u.vipStatus === "Gold") vMax = 5000;
      if (u.vipStatus === "Diamond") vMax = 10000;
      
      const lastClaim = u.lastCinemaClaimAt || 0;
      const dayPassed = now - lastClaim > 24 * 60 * 60 * 1000;
      const cinemaReset = dayPassed ? 0 : u.cinemaAdsWatched;

      return {
        ...u,
        uid: u.uid === "CN000000" ? generatedUid : u.uid,
        referralCode: u.referralCode === "RN000000" ? generatedRefCode : u.referralCode,
        maxEnergy: vMax + ((u.upgrades.energy_core || 0) * 100),
        cinemaAdsWatched: cinemaReset
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

  // Removed passive accumulation setInterval. 
  // Coins now only update via direct actions.
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
        
        return {
          ...u,
          vipStatus: newVip,
          vipExpiry: newExpiry,
          lastPassiveCollection: now
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getMiningPower = useCallback(() => {
    const drillLevel = user.upgrades.drill || 0;
    let basePower = 1 + drillLevel * 2;
    const isBoosted = user.boostEndTime && Date.now() < user.boostEndTime;
    let power = isBoosted ? basePower * 2 : basePower;
    
    if (user.vipStatus === "Silver") power *= 2.5; 
    if (user.vipStatus === "Gold") power *= 4.5;
    if (user.vipStatus === "Diamond") power *= 10.0;
    
    return Math.floor(power);
  }, [user.upgrades.drill, user.boostEndTime, user.vipStatus]);

  const mine = () => {
    if (user.energy < 1) return null;
    const power = getMiningPower();
    const isCritical = Math.random() < (user.vipStatus !== "none" ? 0.25 : 0.05);
    const amount = isCritical ? power * 5 : power;

    setUser(u => ({
      ...u,
      wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + amount },
      energy: Math.max(0, u.energy - 1),
      xp: u.xp + (isCritical ? 10 : 2),
      level: Math.floor((u.xp + 2) / 1000) + 1
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

  const claimDailyReward = () => {
    const now = Date.now();
    const lastClaim = user.lastDailyRewardAt || 0;
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (now - lastClaim < oneDay) {
      toast({ title: "Wait!", description: "Daily reward ready in " + Math.ceil((oneDay - (now - lastClaim)) / (1000 * 60 * 60)) + " hours." });
      return;
    }

    let reward = 5000;
    if (user.vipStatus === "Silver") reward = 15000;
    if (user.vipStatus === "Gold") reward = 40000;
    if (user.vipStatus === "Diamond") reward = 100000;

    setUser(u => ({
      ...u,
      wallet: { ...u.wallet, coins: u.wallet.coins + reward },
      lastDailyRewardAt: now
    }));
    toast({ title: "Daily Reward", description: `+${reward.toLocaleString()} coins collected!` });
  };

  const addCoins = (amount: number) => setUser(u => ({ 
    ...u, 
    wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + amount } 
  }));
  
  const watchAd = (isCinema: boolean = false) => {
    const now = Date.now();
    const newCount = user.adsWatched + 1;
    setUser(u => ({
      ...u,
      adsWatched: newCount,
      lifetimeAds: (u.lifetimeAds || 0) + 1,
      lastAdAt: now,
      cinemaAdsWatched: isCinema ? (u.cinemaAdsWatched || 0) + 1 : u.cinemaAdsWatched,
    }));
    syncReferralProgress({ adsWatched: newCount });
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
    const now = Date.now();
    setUser(u => {
      if (milestoneId === "cinema_daily") {
        const lastClaim = u.lastCinemaClaimAt || 0;
        if (now - lastClaim < 24 * 60 * 60 * 1000) return u;
        
        return {
          ...u,
          wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + rewardCoins },
          lastCinemaClaimAt: now,
          cinemaAdsWatched: 0
        };
      }

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
    const now = Date.now();
    const lastClaim = user.lastChestClaims?.[id] || 0;
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - lastClaim < oneDay) {
      toast({ title: "Cooldown Active", description: "This node is recharging. Try again tomorrow." });
      return false;
    }

    if (user.energy < 15) {
      toast({ variant: "destructive", title: "Low Energy", description: "You need 15 energy for extraction." });
      return false;
    }

    setUser(u => ({ 
      ...u, 
      wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + r }, 
      energy: u.energy - 15, 
      lastChestClaims: { ...(u.lastChestClaims || {}), [id]: now } 
    }));
    return true;
  };

  const enterAdLottery = () => setUser(u => ({ ...u, lotteryEntries: u.lotteryEntries + 1 }));
  const activateBoost = () => setUser(u => ({ ...u, boostEndTime: Date.now() + 60000 }));
  
  const claimReferralMilestone = async (id: string, r: number) => {
    if (!db) return;
    setUser(u => ({ ...u, wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + r }, claimedReferralMilestones: [...u.claimedReferralMilestones, id] }));
    await updateDoc(doc(db, "users", user.uid), {
      claimedReferralMilestones: arrayUnion(id),
      "wallet.coins": (user.wallet?.coins || 0) + r
    });
  };

  const claimReferralReward = async (targetUid: string) => {
    if (!db) return;

    const updatedReferrals = user.referrals.map(ref => {
      if (ref.uid === targetUid && ref.isVerified && !ref.isRewarded) {
        return { ...ref, isRewarded: true };
      }
      return ref;
    });

    const reward = 5000;
    setUser(u => ({ 
      ...u, 
      wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + reward },
      referralEarnings: u.referralEarnings + reward,
      referrals: updatedReferrals
    }));

    await updateDoc(doc(db, "users", user.uid), {
      referrals: updatedReferrals,
      "wallet.coins": (user.wallet?.coins || 0) + reward,
      referralEarnings: user.referralEarnings + reward
    });

    toast({ title: "Referral Claimed!", description: `+${reward.toLocaleString()} coins added to your vault.` });
  };

  const claimOfflineEarnings = (t: boolean) => {
    if (user.energy < 10) return false;
    const amount = t ? offlineEarnings * 3 : offlineEarnings;
    addCoins(amount);
    setUser(u => ({ ...u, energy: Math.max(0, u.energy - 10) }));
    setOfflineEarnings(0);
    return true;
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setUser(u => ({
      ...u,
      socialTasks: { ...u.socialTasks, [taskId]: status }
    }));
  };

  const completeTask = (taskId: string, reward: number) => {
    setUser(u => {
      if (u.socialTasks[taskId] === 'completed') return u;

      const newStatus = 'completed' as TaskStatus;
      const completedCount = Object.values({ ...u.socialTasks, [taskId]: newStatus }).filter(s => s === 'completed').length;

      if (u.referredBy && completedCount >= 3) {
        syncReferralProgress({ tgJoined: taskId === 'tg_join', igFollowed: taskId === 'ig_follow' });
      }

      return {
        ...u,
        wallet: { ...u.wallet, coins: (u.wallet?.coins || 0) + reward },
        tasksCompleted: u.tasksCompleted + 1,
        socialTasks: { ...u.socialTasks, [taskId]: newStatus },
      };
    });
  };

  const claimVault = () => {};
  const feedPet = () => {};
  const incrementStreak = () => {};
  const claimHourlyAdBonus = () => {};

  return (
    <GameContext.Provider value={{ 
      user, offlineEarnings, mine, upgrade, addCoins, watchAd, claimHourlyAdBonus, enterAdLottery, claimAdChest, activateBoost, completeTask, updateTaskStatus, claimAdMilestone, claimReferralMilestone, registerWithdrawal, submitVIPRequest, claimReferralReward, claimOfflineEarnings, getMiningPower, getPassiveIncome, refillEnergy, claimVault, feedPet, incrementStreak, claimDailyReward
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
