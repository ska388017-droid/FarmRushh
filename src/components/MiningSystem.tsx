
"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/lib/game-store";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Diamond, 
  TrendingUp, 
  Cpu, 
  Pickaxe, 
  CloudLightning,
  Sparkles,
  Gift,
  Package,
  Flame,
  Clock,
  Lock,
  Skull,
  Dices,
  Play,
  Timer,
  ZapOff,
  BatteryMedium,
  BatteryFull,
  BatteryLow,
  ZapIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdGate } from "@/components/ads/AdGate";
import { toast } from "@/hooks/use-toast";
import { LuckyFlip } from "@/components/LuckyFlip";

export const MiningSystem = () => {
  const { user, mine, upgrade, getMiningPower, getPassiveIncome, activateBoost, refillEnergy, claimVault, addCoins, secondsToNextEnergy } = useGame();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; amount: number; isCritical: boolean }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [boostTimeRemaining, setBoostTimeRemaining] = useState(0);
  const [isBossEvent, setIsBossEvent] = useState(false);
  const [bossHealth, setBossHealth] = useState(100);
  const [showLuckyFlip, setShowLuckyFlip] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (user.boostEndTime) {
        const remaining = Math.max(0, Math.ceil((user.boostEndTime - Date.now()) / 1000));
        setBoostTimeRemaining(remaining);
      } else {
        setBoostTimeRemaining(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [user.boostEndTime]);

  const energy = user?.energy || 0;
  const maxEnergy = user?.maxEnergy || 20;
  const drillLvl = user?.upgrades?.drill || 0;
  const autoLvl = user?.upgrades?.autominer || 0;
  const energyLvl = user?.upgrades?.energy_core || 0;

  const handleMine = (e: React.MouseEvent | React.TouchEvent) => {
    if (energy < 1) {
      toast({ 
        variant: "destructive", 
        title: "Energy Depleted", 
        description: "Refill your core with an ad or wait for regeneration." 
      });
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if (isBossEvent) {
      setBossHealth(prev => Math.max(0, prev - 2));
      if (bossHealth <= 2) {
        setIsBossEvent(false);
        addCoins(10000);
        toast({ title: "Boss Defeated!", description: "You earned 10,000 bonus coins!" });
      }
    }

    const result = mine();
    if (result) {
      setIsAnimating(true);
      const newParticle = {
        id: Date.now(),
        x,
        y,
        amount: result.amount,
        isCritical: result.isCritical
      };
      setParticles(prev => [...prev, newParticle]);
      setTimeout(() => setParticles(prev => prev.filter(p => p.id !== newParticle.id)), 1000);
      setTimeout(() => setIsAnimating(false), 100);
    }
  };

  const miningPower = getMiningPower();
  const passiveIncome = getPassiveIncome();
  const energyProgress = (energy / maxEnergy) * 100;
  const isBoosted = boostTimeRemaining > 0;

  const vaultCooldown = user.lastVaultClaimAt ? Math.max(0, Math.ceil((user.lastVaultClaimAt + 3600000 - Date.now()) / 1000)) : 0;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const EnergyIcon = energy < (maxEnergy * 0.3) ? BatteryLow : energy < (maxEnergy * 0.8) ? BatteryMedium : BatteryFull;

  return (
    <div className="space-y-8 pb-24">
      {showLuckyFlip && <LuckyFlip onClose={() => setShowLuckyFlip(false)} />}

      <div className="grid grid-cols-2 gap-4">
        <Card className={cn(
          "glass-morphism p-4 border-primary/20 transition-all duration-500",
          isBoosted ? "bg-primary/20 shadow-[0_0_20px_rgba(163,92,255,0.3)]" : "bg-primary/5"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className={cn("w-3 h-3", isBoosted ? "text-secondary animate-pulse" : "text-primary")} />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Mining Power</span>
          </div>
          <p className="text-xl font-black text-white">
            {miningPower}
            <span className={cn("text-[10px] ml-1 uppercase font-bold", isBoosted ? "text-secondary" : "text-primary")}>
              {isBoosted ? "x2 Active" : "/ Tap"}
            </span>
          </p>
        </Card>
        <Card className="glass-morphism p-4 border-secondary/20 bg-secondary/5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-secondary" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Passive Income</span>
          </div>
          <p className="text-xl font-black text-white">{passiveIncome.toFixed(1)}<span className="text-[10px] ml-1 text-secondary">/ SEC</span></p>
        </Card>
      </div>

      {/* Energy System UI */}
      <Card className="glass-morphism border-secondary/30 bg-gradient-to-r from-secondary/5 to-transparent p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <EnergyIcon className="w-16 h-16 text-secondary" />
        </div>
        <div className="flex justify-between items-end mb-3">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <Zap className="w-3 h-3 text-secondary animate-pulse" /> Energy Reserve
            </h3>
            <p className="text-2xl font-black text-secondary tabular-nums">
              {Math.floor(energy)} <span className="text-xs text-muted-foreground">/ {maxEnergy}</span>
            </p>
          </div>
          <div className="text-right">
            {secondsToNextEnergy > 0 ? (
              <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">REGEN: {formatTime(secondsToNextEnergy)}</p>
            ) : (
              <p className="text-[9px] font-black text-secondary uppercase mb-1">CHARGED</p>
            )}
            <AdGate actionName="Refill Energy" onReward={() => {
              refillEnergy();
              toast({ title: "Energy Pulse", description: user.tier === "God Elite" ? "+2 Energy stabilized." : "+1 Energy stabilized." });
            }}>
              <Button size="sm" className="bg-secondary text-secondary-foreground font-black text-[10px] h-8 rounded-lg shadow-lg px-4">
                REFILL +{user.tier === "God Elite" ? '2' : '1'}
              </Button>
            </AdGate>
          </div>
        </div>
        <Progress value={energyProgress} className="h-1.5 bg-white/5" />
        {user.tier === "God Elite" && (
          <p className="text-[8px] text-primary font-black uppercase mt-2 tracking-widest">VIP Buff: 5min Regen Active</p>
        )}
      </Card>

      <div className="relative flex flex-col items-center justify-center py-6">
        {isBossEvent && (
          <div className="absolute top-0 w-full max-w-[200px] space-y-2 animate-in fade-in zoom-in duration-500">
             <div className="flex justify-between items-center text-[10px] font-black text-destructive uppercase tracking-widest">
                <span>Cyber-Sentinel</span>
                <span>{bossHealth}% HP</span>
             </div>
             <Progress value={bossHealth} className="h-1.5 bg-destructive/10" />
          </div>
        )}

        <div className={cn(
          "absolute inset-0 blur-3xl rounded-full scale-150 animate-pulse transition-colors duration-1000",
          isBoosted ? "bg-secondary/10" : isBossEvent ? "bg-destructive/10" : "bg-primary/5"
        )} />
        
        <button
          onMouseDown={handleMine}
          onTouchStart={handleMine}
          className={cn(
            "relative z-10 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-75 active:scale-90 select-none",
            isAnimating ? "scale-95" : "scale-100"
          )}
        >
          <div className={cn(
            "absolute inset-0 rounded-full blur-2xl animate-pulse transition-colors duration-500",
            isBoosted ? "bg-secondary/30" : isBossEvent ? "bg-destructive/40" : "bg-primary/20"
          )} />
          <div className={cn(
            "absolute -inset-4 border-2 rounded-full animate-[spin_10s_linear_infinite] border-t-primary transition-colors",
            isBoosted ? "border-secondary/20" : isBossEvent ? "border-destructive/20" : "border-primary/20"
          )} />
          
          <div className={cn(
            "relative w-36 h-36 rounded-full shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500",
            isBossEvent 
              ? "bg-gradient-to-tr from-destructive via-red-900 to-black shadow-[0_0_60px_rgba(255,50,50,0.5)]"
              : isBoosted 
                ? "bg-gradient-to-tr from-secondary via-green-400 to-primary shadow-[0_0_60px_rgba(57,255,20,0.5)]" 
                : "bg-gradient-to-tr from-primary via-purple-500 to-secondary shadow-[0_0_50px_rgba(163,92,255,0.4)]"
          )}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            {isBossEvent ? (
               <Skull className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(255,50,50,0.8)] animate-pulse" />
            ) : (
               <Diamond className={cn(
                "w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-transform duration-300",
                isAnimating ? "scale-110" : "scale-100"
              )} />
            )}
            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/50 animate-pulse" />
          </div>
        </button>

        {particles.map(p => (
          <div
            key={p.id}
            className="fixed pointer-events-none z-[100] animate-out fade-out slide-out-to-top-20 duration-1000 flex flex-col items-center"
            style={{ left: p.x - 20, top: p.y - 40 }}
          >
            <span className={cn(
              "font-black text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]",
              p.isCritical ? "text-secondary text-2xl" : "text-white"
            )}>
              +{p.amount}
              {p.isCritical && <span className="text-[10px] ml-1">CRIT!</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
         <Card className="glass-morphism p-4 border-white/10 hover:border-primary/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20" />
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Dices className="w-5 h-5 text-primary" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-white uppercase">Lucky Flip</p>
                  <p className="text-[8px] text-muted-foreground uppercase font-bold">1 Energy</p>
               </div>
            </div>
            <AdGate actionName="Play Lucky Flip" onReward={() => setShowLuckyFlip(true)}>
               <Button size="sm" className="w-full mt-3 h-7 bg-primary/20 text-primary border border-primary/30 text-[9px] font-black rounded-lg">PLAY GAME</Button>
            </AdGate>
         </Card>

         <Card className="glass-morphism p-4 border-white/10 hover:border-destructive/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-destructive/20" />
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
                  <Skull className="w-5 h-5 text-destructive" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-white uppercase">Daily Boss</p>
                  <p className="text-[8px] text-muted-foreground uppercase font-bold">3 Energy</p>
               </div>
            </div>
            <AdGate actionName="Summon Boss" onReward={() => {
              if (energy < 3) {
                toast({ variant: "destructive", title: "Low Energy", description: "You need 3 energy to start mining boss." });
                return;
              }
              setIsBossEvent(true);
              setBossHealth(100);
              toast({ title: "Boss Summoned!", description: "Defeat the Cyber-Sentinel for big rewards!" });
            }}>
               <Button size="sm" className="w-full mt-3 h-7 bg-destructive/20 text-destructive border border-destructive/30 text-[9px] font-black rounded-lg">SUMMON</Button>
            </AdGate>
         </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 flex items-center gap-2">
          <Gift className="w-3 h-3" /> Quick Earning
        </h3>
        
        <Card className="glass-morphism p-4 border-secondary/30 bg-secondary/5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center border border-secondary/40">
                <Play className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-tighter">Watch & Earn</p>
                <p className="text-[9px] text-muted-foreground uppercase font-bold">500 Crystals + 1 Energy</p>
              </div>
            </div>
            <AdGate actionName="Watch Ad for Coins" onReward={() => {
              addCoins(500);
              refillEnergy();
              toast({ title: "Rewards Received!", description: "500 coins + 1 energy core stabilized." });
            }}>
              <Button size="sm" className="bg-secondary text-secondary-foreground font-black text-[10px] h-9 rounded-xl px-6 shadow-lg shadow-secondary/20">
                WATCH
              </Button>
            </AdGate>
          </div>
        </Card>

        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 pt-2 flex items-center gap-2">
          <Package className="w-3 h-3" /> System Upgrades
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <UpgradeCard 
            id="drill" 
            name="Nano Drill" 
            level={drillLvl} 
            icon={Pickaxe}
            benefit={`+2 Coins / Tap`}
            cost={Math.floor(100 * Math.pow(1.5, drillLvl))}
            onUpgrade={() => upgrade('drill')}
            canAfford={user.wallet.coins >= Math.floor(100 * Math.pow(1.5, drillLvl))}
          />
          <UpgradeCard 
            id="autominer" 
            name="Auto-Miner" 
            level={autoLvl} 
            icon={Cpu}
            benefit={`+2 Coins / Sec`}
            cost={Math.floor(500 * Math.pow(1.5, autoLvl))}
            onUpgrade={() => upgrade('autominer')}
            canAfford={user.wallet.coins >= Math.floor(500 * Math.pow(1.5, autoLvl))}
          />
          <UpgradeCard 
            id="energy_core" 
            name="Energy Core" 
            level={energyLvl} 
            icon={Zap}
            benefit={`+2 Max Energy`}
            cost={Math.floor(300 * Math.pow(1.5, energyLvl))}
            onUpgrade={() => upgrade('energy_core')}
            canAfford={user.wallet.coins >= Math.floor(300 * Math.pow(1.5, energyLvl))}
          />
        </div>
      </div>
    </div>
  );
};

const UpgradeCard = ({ name, level, icon: Icon, benefit, cost, onUpgrade, canAfford }: any) => (
  <Card className="glass-morphism p-4 border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-white">{name}</p>
          <Badge variant="outline" className="text-[8px] h-4 px-1 border-white/10 text-muted-foreground">LVL {level}</Badge>
        </div>
        <p className="text-[9px] text-primary font-bold uppercase tracking-tight">{benefit}</p>
      </div>
    </div>
    <Button 
      size="sm" 
      onClick={onUpgrade}
      disabled={!canAfford}
      className={cn(
        "h-9 px-4 rounded-xl font-black text-[10px] transition-all",
        canAfford ? "bg-white/10 hover:bg-primary text-white" : "bg-white/5 text-muted-foreground cursor-not-allowed"
      )}
    >
      {cost.toLocaleString()} <Diamond className="w-3 h-3 ml-1" />
    </Button>
  </Card>
);
