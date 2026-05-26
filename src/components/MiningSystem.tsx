
"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/lib/game-store";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Pickaxe, 
  CloudLightning,
  Gift,
  Package,
  Skull,
  Dices,
  Play,
  ZapOff,
  Diamond
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdGate } from "@/components/ads/AdGate";
import { toast } from "@/hooks/use-toast";
import { LuckyFlip } from "@/components/LuckyFlip";

export const MiningSystem = () => {
  const { user, mine, upgrade, getMiningPower, refillEnergy, addCoins } = useGame();
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
  const maxEnergy = user?.maxEnergy || 1000;
  const drillLvl = user?.upgrades?.drill || 0;
  const energyLvl = user?.upgrades?.energy_core || 0;

  const handleMine = (e: React.MouseEvent | React.TouchEvent) => {
    if (energy < 1) {
      toast({ variant: "destructive", title: "Energy Depleted", description: "Watch ad for recharge." });
      return;
    }

    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if (isBossEvent) {
      setBossHealth(prev => Math.max(0, prev - 2));
      if (bossHealth <= 2) {
        setIsBossEvent(false);
        addCoins(10000);
        toast({ title: "Boss Defeated!" });
      }
    }

    const result = mine();
    if (result) {
      setIsAnimating(true);
      const newParticle = { id: Date.now(), x, y, amount: result.amount, isCritical: result.isCritical };
      setParticles(prev => [...prev, newParticle]);
      setTimeout(() => setParticles(prev => prev.filter(p => p.id !== newParticle.id)), 1000);
      setTimeout(() => setIsAnimating(false), 100);
    }
  };

  const energyProgress = (energy / maxEnergy) * 100;
  const isLowEnergy = energy < (maxEnergy * 0.1);
  const isBoosted = boostTimeRemaining > 0;

  return (
    <div className="space-y-8 pb-24 w-full overflow-x-hidden">
      {showLuckyFlip && <LuckyFlip onClose={() => setShowLuckyFlip(false)} />}

      <div className="grid grid-cols-1 gap-4">
        <Card className={cn(
          "glass-morphism p-6 border-primary/20 transition-all relative overflow-hidden",
          isBoosted ? "bg-primary/20 shadow-[0_0_30px_rgba(163,92,255,0.4)]" : "bg-primary/5"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Pickaxe className={cn("w-4 h-4", isBoosted ? "text-secondary animate-pulse" : "text-primary")} />
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Mining Efficiency</span>
          </div>
          <div className="flex items-end gap-3">
             <p className="text-4xl font-black text-white italic tracking-tighter">
               {getMiningPower()}
             </p>
             <span className={cn("text-xs mb-1.5 uppercase font-bold", isBoosted ? "text-secondary" : "text-primary")}>
               {isBoosted ? "OVERCLOCK x2" : "COINS / TAP"}
             </span>
          </div>
          <div className="mt-4 text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2">
             <ZapOff className="w-3 h-3" /> Manual Protocol Engaged
          </div>
        </Card>
      </div>

      <Card className={cn("glass-morphism border-secondary/30 p-5 relative overflow-hidden", isLowEnergy ? "from-destructive/20 to-transparent border-destructive/50" : "from-secondary/5 to-transparent")}>
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
              <Zap className={cn("w-3 h-3", isLowEnergy ? "text-destructive" : "text-secondary animate-pulse")} /> 
              {isLowEnergy ? "CRITICAL POWER" : "ENERGY RESERVE"}
            </h3>
            <p className={cn("text-3xl font-black tabular-nums", isLowEnergy ? "text-destructive" : "text-secondary")}>
              {Math.floor(energy)} <span className="text-xs text-muted-foreground opacity-50">/ {maxEnergy}</span>
            </p>
          </div>
          
          <AdGate actionName="Full Energy Recharge" onReward={() => {
            refillEnergy();
            toast({ title: "CORE STABILIZED" });
          }}>
            <Button size="lg" className={cn("font-black text-[10px] h-12 rounded-xl px-4 uppercase tracking-widest", isLowEnergy ? "bg-destructive text-white animate-bounce" : "bg-secondary text-secondary-foreground")}>
              <CloudLightning className="w-4 h-4 mr-2" /> RECHARGE
            </Button>
          </AdGate>
        </div>
        
        <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden">
           <div className={cn("h-full transition-all duration-1000", isLowEnergy ? "bg-destructive shadow-[0_0_15px_rgba(255,50,50,0.8)]" : "bg-secondary shadow-[0_0_15px_rgba(57,255,20,0.5)]")} style={{ width: `${energyProgress}%` }} />
        </div>
      </Card>

      <div className="relative flex flex-col items-center justify-center py-10 overflow-hidden w-full">
        {isBossEvent && (
          <div className="absolute top-0 w-full max-w-[200px] space-y-2 animate-in fade-in zoom-in duration-500 z-20">
             <div className="flex justify-between items-center text-[10px] font-black text-destructive uppercase">
                <span>Cyber-Sentinel</span>
                <span>{bossHealth}% HP</span>
             </div>
             <Progress value={bossHealth} className="h-1.5 bg-destructive/10" />
          </div>
        )}
        
        <button onMouseDown={handleMine} onTouchStart={handleMine} disabled={energy < 1} className={cn("relative z-10 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-75 active:scale-90 select-none", isAnimating ? "scale-95" : "scale-100", energy < 1 ? "opacity-30 grayscale cursor-not-allowed" : "")}>
          <div className={cn("absolute inset-0 rounded-full blur-2xl transition-colors duration-500", isBoosted ? "bg-secondary/30" : isBossEvent ? "bg-destructive/40" : "bg-primary/20")} />
          <div className={cn("relative w-36 h-36 rounded-full shadow-2xl flex items-center justify-center overflow-hidden border-2", isBossEvent ? "bg-gradient-to-tr from-destructive via-red-900 to-black border-red-500/50" : isBoosted ? "bg-gradient-to-tr from-secondary via-green-400 to-primary border-green-500/50" : "bg-gradient-to-tr from-primary via-purple-500 to-secondary border-primary/50")}>
            {isBossEvent ? <Skull className="w-16 h-16 text-white animate-pulse" /> : <Pickaxe className={cn("w-16 h-16 text-white transition-transform duration-300", isAnimating ? "rotate-12 scale-110" : "rotate-0 scale-100")} />}
          </div>
        </button>

        {particles.map(p => (
          <div key={p.id} className="fixed pointer-events-none z-[100] animate-out fade-out slide-out-to-top-20 duration-1000 flex flex-col items-center" style={{ left: p.x - 20, top: p.y - 40 }}>
            <span className={cn("font-black text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]", p.isCritical ? "text-secondary text-2xl" : "text-white")}>
              +{p.amount}
              {p.isCritical && <span className="text-[10px] ml-1">CRIT!</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
         <Card className="glass-morphism p-4 border-white/10 hover:border-primary/40 transition-all relative overflow-hidden">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"><Dices className="w-4 h-4 text-primary" /></div>
               <div><p className="text-[10px] font-black text-white uppercase">Lucky Flip</p><p className="text-[8px] text-muted-foreground uppercase font-bold">10 NRG</p></div>
            </div>
            <AdGate actionName="Play Lucky Flip" onReward={() => {
              if (energy < 10) return;
              setShowLuckyFlip(true);
            }}><Button size="sm" className="w-full mt-3 h-7 bg-primary/20 text-primary border border-primary/30 text-[9px] font-black rounded-lg">PLAY</Button></AdGate>
         </Card>

         <Card className="glass-morphism p-4 border-white/10 hover:border-destructive/40 transition-all relative overflow-hidden">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20"><Skull className="w-4 h-4 text-destructive" /></div>
               <div><p className="text-[10px] font-black text-white uppercase">Daily Boss</p><p className="text-[8px] text-muted-foreground uppercase font-bold">50 NRG</p></div>
            </div>
            <AdGate actionName="Summon Boss" onReward={() => {
              if (energy < 50) return;
              setIsBossEvent(true);
              setBossHealth(100);
            }}><Button size="sm" className="w-full mt-3 h-7 bg-destructive/20 text-destructive border border-destructive/30 text-[9px] font-black rounded-lg">SUMMON</Button></AdGate>
         </Card>
      </div>

      <div className="space-y-4 w-full">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2"><Gift className="w-3 h-3" /> Quick Extraction</h3>
        <Card className="glass-morphism p-4 border-secondary/30 bg-secondary/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-secondary/20 flex items-center justify-center border border-secondary/40"><Play className="w-5 h-5 text-secondary" /></div>
              <div><p className="text-xs font-black text-white uppercase">Watch & Earn</p><p className="text-[9px] text-muted-foreground uppercase font-bold">500 C + Recharge</p></div>
            </div>
            <AdGate actionName="Watch Ad for Coins" onReward={() => {
              addCoins(500);
              refillEnergy();
            }}><Button size="sm" className="bg-secondary text-secondary-foreground font-black text-[10px] h-9 rounded-xl px-4 shadow-lg">WATCH</Button></AdGate>
          </div>
        </Card>

        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 pt-2 flex items-center gap-2"><Package className="w-3 h-3" /> Tooling Upgrades</h3>
        <div className="grid grid-cols-1 gap-3 w-full">
          <UpgradeCard id="drill" name="Nano Drill" level={drillLvl} icon={Pickaxe} benefit={`+2 Coins / Tap`} cost={Math.floor(100 * Math.pow(1.5, drillLvl))} onUpgrade={() => upgrade('drill')} canAfford={(user.wallet?.coins || 0) >= Math.floor(100 * Math.pow(1.5, drillLvl))} />
          <UpgradeCard id="energy_core" name="Energy Core" level={energyLvl} icon={Zap} benefit={`+100 Max Cap.`} cost={Math.floor(300 * Math.pow(1.5, energyLvl))} onUpgrade={() => upgrade('energy_core')} canAfford={(user.wallet?.coins || 0) >= Math.floor(300 * Math.pow(1.5, energyLvl))} />
        </div>
      </div>
    </div>
  );
};

const UpgradeCard = ({ name, level, icon: Icon, benefit, cost, onUpgrade, canAfford }: any) => (
  <Card className="glass-morphism p-4 border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-all">
        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all" />
      </div>
      <div>
        <div className="flex items-center gap-2"><p className="text-sm font-black text-white">{name}</p><Badge variant="outline" className="text-[8px] h-4 px-1 border-white/10">LVL {level}</Badge></div>
        <p className="text-[9px] text-primary font-bold uppercase">{benefit}</p>
      </div>
    </div>
    <Button size="sm" onClick={onUpgrade} disabled={!canAfford} className={cn("h-9 px-4 rounded-xl font-black text-[10px]", canAfford ? "bg-white/10 hover:bg-primary text-white" : "bg-white/5 text-muted-foreground")}>
      {cost.toLocaleString()} <Diamond className="w-3 h-3 ml-1" />
    </Button>
  </Card>
);
