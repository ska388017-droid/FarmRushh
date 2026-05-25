
"use client";

import React, { useState } from "react";
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
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdGate } from "@/components/ads/AdGate";
import { toast } from "@/hooks/use-toast";

export const MiningSystem = () => {
  const { user, mine, upgrade, getMiningPower, getPassiveIncome } = useGame();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; amount: number; isCritical: boolean }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Safe checks for user properties
  const coins = user?.wallet?.coins || 0;
  const energy = user?.energy || 0;
  const maxEnergy = user?.maxEnergy || 1000;
  const drillLvl = user?.upgrades?.drill || 0;
  const autoLvl = user?.upgrades?.autominer || 0;
  const energyLvl = user?.upgrades?.energy_core || 0;

  const handleMine = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

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

  return (
    <div className="space-y-8 pb-24">
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-morphism p-4 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Mining Power</span>
          </div>
          <p className="text-xl font-black text-white">{miningPower}<span className="text-[10px] ml-1 text-primary">/ TAP</span></p>
        </Card>
        <Card className="glass-morphism p-4 border-secondary/20 bg-secondary/5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-secondary" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Passive Income</span>
          </div>
          <p className="text-xl font-black text-white">{passiveIncome.toFixed(1)}<span className="text-[10px] ml-1 text-secondary">/ SEC</span></p>
        </Card>
      </div>

      <div className="relative flex flex-col items-center justify-center py-10">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150 animate-pulse" />
        
        <button
          onMouseDown={handleMine}
          onTouchStart={handleMine}
          className={cn(
            "relative z-10 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-75 active:scale-90 select-none",
            isAnimating ? "scale-95" : "scale-100"
          )}
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -inset-4 border-2 border-primary/20 rounded-full animate-[spin_10s_linear_infinite] border-t-primary" />
          
          <div className="relative w-36 h-36 bg-gradient-to-tr from-primary via-purple-500 to-secondary rounded-full shadow-[0_0_50px_rgba(163,92,255,0.4)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            <Diamond className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-bounce" />
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

        <div className="mt-8 w-full max-w-xs space-y-2">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-1.5">
              <CloudLightning className="w-3 h-3 text-secondary" />
              <span className="text-[10px] font-black text-white/70 uppercase">Energy</span>
            </div>
            <span className="text-[10px] font-black text-secondary tabular-nums">
              {Math.floor(energy)} / {maxEnergy}
            </span>
          </div>
          <Progress value={energyProgress} className="h-2 bg-white/5" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 flex items-center gap-2">
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
            canAfford={coins >= Math.floor(100 * Math.pow(1.5, drillLvl))}
          />
          <UpgradeCard 
            id="autominer" 
            name="Auto-Miner" 
            level={autoLvl} 
            icon={Cpu}
            benefit={`+2 Coins / Sec`}
            cost={Math.floor(500 * Math.pow(1.5, autoLvl))}
            onUpgrade={() => upgrade('autominer')}
            canAfford={coins >= Math.floor(500 * Math.pow(1.5, autoLvl))}
          />
          <UpgradeCard 
            id="energy_core" 
            name="Energy Core" 
            level={energyLvl} 
            icon={Zap}
            benefit={`+50 Max Energy`}
            cost={Math.floor(300 * Math.pow(1.5, energyLvl))}
            onUpgrade={() => upgrade('energy_core')}
            canAfford={coins >= Math.floor(300 * Math.pow(1.5, energyLvl))}
          />
        </div>
      </div>

      <Card className="glass-morphism p-6 border-secondary/30 bg-gradient-to-r from-secondary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20 relative">
              <Gift className="w-6 h-6 text-secondary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-tighter">Daily Supply Drop</p>
              <p className="text-[9px] text-muted-foreground uppercase font-bold">Watch ad to claim 2,500 Coins</p>
            </div>
          </div>
          <AdGate actionName="Claim Daily Gift" onReward={() => {
            toast({ title: "Gift Claimed!", description: "You received 2,500 coins!" });
          }}>
            <Button size="sm" className="bg-secondary text-secondary-foreground font-black text-[10px] h-8 rounded-xl">
              CLAIM
            </Button>
          </AdGate>
        </div>
      </Card>
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
