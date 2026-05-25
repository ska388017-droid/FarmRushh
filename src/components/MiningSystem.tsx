
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
  MousePointer2,
  Dices,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdGate } from "@/components/ads/AdGate";
import { toast } from "@/hooks/use-toast";
import { LuckyFlip } from "@/components/LuckyFlip";

export const MiningSystem = () => {
  const { user, mine, upgrade, getMiningPower, getPassiveIncome, activateBoost, refillEnergy, claimVault, addCoins } = useGame();
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

        <div className="mt-8 w-full max-w-xs space-y-2">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-1.5">
              <CloudLightning className="w-3 h-3 text-secondary" />
              <span className="text-[10px] font-black text-white/70 uppercase">Energy</span>
            </div>
            <AdGate actionName="Refill Energy" onReward={() => {
              refillEnergy();
              toast({ title: "Energy Refilled!", description: "Core re-stabilized at 100%." });
            }}>
              <Button variant="ghost" className="h-4 p-0 text-[8px] text-primary font-bold hover:bg-transparent">REFILL WITH AD</Button>
            </AdGate>
            <span className="text-[10px] font-black text-secondary tabular-nums">
              {Math.floor(energy)} / {maxEnergy}
            </span>
          </div>
          <Progress value={energyProgress} className="h-2 bg-white/5" />
        </div>
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
                  <p className="text-[8px] text-muted-foreground uppercase font-bold">Try your luck</p>
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
                  <p className="text-[8px] text-muted-foreground uppercase font-bold">10k Bounty</p>
               </div>
            </div>
            <AdGate actionName="Summon Boss" onReward={() => {
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
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Get 500 crystals instantly</p>
              </div>
            </div>
            <AdGate actionName="Watch Ad for Coins" onReward={() => {
              addCoins(500);
              toast({ title: "Crystals Received!", description: "500 coins added to your wallet." });
            }}>
              <Button size="sm" className="bg-secondary text-secondary-foreground font-black text-[10px] h-9 rounded-xl px-6 shadow-lg shadow-secondary/20">
                WATCH
              </Button>
            </AdGate>
          </div>
        </Card>

        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 pt-2 flex items-center gap-2">
          <Flame className="w-3 h-3" /> Quantum Boosters
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          <Card className={cn(
            "glass-morphism p-4 border-white/10 relative overflow-hidden group transition-all duration-500",
            isBoosted ? "border-secondary/50 bg-secondary/10" : "hover:border-primary/40"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                  isBoosted ? "bg-secondary/20 border-secondary/40 animate-pulse" : "bg-white/5 border-white/10"
                )}>
                  <Flame className={cn("w-6 h-6", isBoosted ? "text-secondary" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-tighter">
                    {isBoosted ? "Boost Active" : "2X Mining Multiplier"}
                  </p>
                  <p className={cn("text-[9px] uppercase font-bold", isBoosted ? "text-secondary" : "text-muted-foreground")}>
                    {isBoosted ? `${boostTimeRemaining}s Remaining` : "Double your taps for 60s"}
                  </p>
                </div>
              </div>
              
              {!isBoosted ? (
                <AdGate actionName="Activate 2X Boost" onReward={() => {
                  activateBoost();
                  toast({ title: "Boost Activated!", description: "Mining power doubled for 60 seconds." });
                }}>
                  <Button size="sm" className="bg-primary text-white font-black text-[10px] h-9 rounded-xl px-4 shadow-lg shadow-primary/20">
                    ACTIVATE
                  </Button>
                </AdGate>
              ) : (
                <Badge className="bg-secondary/20 text-secondary border-secondary/30 text-[9px] px-3 h-8 flex items-center gap-1.5 font-black">
                  <Clock className="w-3 h-3" /> {boostTimeRemaining}S
                </Badge>
              )}
            </div>
          </Card>

          <Card className={cn(
            "glass-morphism p-4 border-white/10 relative overflow-hidden group transition-all duration-500",
            vaultCooldown > 0 ? "opacity-50" : "hover:border-secondary/40"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                  {vaultCooldown > 0 ? <Lock className="w-6 h-6 text-muted-foreground" /> : <Package className="w-6 h-6 text-secondary" />}
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-tighter">Secret Vault</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">
                    {vaultCooldown > 0 ? `Ready in ${Math.ceil(vaultCooldown / 60)}m` : "Mystery treasure inside"}
                  </p>
                </div>
              </div>
              
              {vaultCooldown === 0 ? (
                <AdGate actionName="Claim Secret Vault" onReward={() => {
                  claimVault();
                  toast({ title: "Vault Unlocked!", description: "You found extra CyberCoins!" });
                }}>
                  <Button size="sm" className="bg-secondary text-secondary-foreground font-black text-[10px] h-9 rounded-xl px-4 shadow-lg">
                    UNLOCK
                  </Button>
                </AdGate>
              ) : (
                <Badge variant="outline" className="border-white/10 text-muted-foreground text-[9px] px-3 h-8 flex items-center gap-1.5 font-black">
                  <Clock className="w-3 h-3" /> {Math.ceil(vaultCooldown / 60)}M
                </Badge>
              )}
            </div>
          </Card>
        </div>

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
