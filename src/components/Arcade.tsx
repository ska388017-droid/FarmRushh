
"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdGate } from "@/components/ads/AdGate";
import { Gift, Package, Star, TrendingUp, Sparkles, Zap, Swords, Trophy, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const Arcade = () => {
  const { user, spendTickets, addCoins, addXp } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Duel State Machine
  const [duelStatus, setDuelStatus] = useState<'idle' | 'matching' | 'won' | 'rewarded' | 'choosing_card'>('idle');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [extraReward, setExtraReward] = useState<number>(0);

  const handleSpin = () => {
    if (user.spinTickets <= 0) {
      toast({ title: "No Tickets", description: "Earn more tickets via daily check-in.", variant: "destructive" });
      return;
    }
    
    setIsSpinning(true);
    setTimeout(() => {
      const win = Math.floor(Math.random() * 500) + 100;
      spendTickets(1);
      addCoins(win);
      setIsSpinning(false);
      toast({ title: "Big Win!", description: `You won ${win} CyberCoins!` });
    }, 2000);
  };

  const startDuel = () => {
    setDuelStatus('matching');
    setTimeout(() => {
      setDuelStatus('won');
      toast({ title: "VICTORY!", description: "You defeated the Cyber-Sentinel!" });
    }, 2500);
  };

  const handleClaimBaseReward = () => {
    addCoins(250);
    addXp(50);
    setDuelStatus('choosing_card');
  };

  const handleSelectCard = (index: number) => {
    if (selectedCard !== null) return;
    const bonus = Math.floor(Math.random() * 1000) + 500;
    setSelectedCard(index);
    setExtraReward(bonus);
    addCoins(bonus);
    
    setTimeout(() => {
      toast({ title: "Bonus Unlocked!", description: `Found ${bonus} extra coins!` });
      setDuelStatus('idle');
      setSelectedCard(null);
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black neon-text-primary tracking-tighter">ARCADE</h2>
        <div className="flex gap-2">
          <Card className="glass-morphism border-primary/20 px-4 py-1.5 flex items-center gap-2 bg-primary/5">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-black text-white">{user.spinTickets}</span>
          </Card>
        </div>
      </div>

      {/* NEON DUEL SECTION (New Requested Flow) */}
      <Card className="glass-morphism border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-black tracking-widest uppercase text-white">Neon Duel</h3>
          </div>
          <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none animate-pulse">LIVE MATCH</Badge>
        </div>

        {duelStatus === 'idle' && (
          <div className="text-center py-4 space-y-4">
            <p className="text-xs text-muted-foreground uppercase font-black">Challenge the Grid Master</p>
            <Button onClick={startDuel} className="w-full bg-secondary text-secondary-foreground font-black py-6 rounded-xl hover:bg-secondary/80">
              START MATCH (1 Ticket)
            </Button>
          </div>
        )}

        {duelStatus === 'matching' && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="w-12 h-12 text-secondary animate-spin" />
            <p className="text-xs font-black text-secondary animate-pulse uppercase tracking-[0.3em]">Synching Neural Link...</p>
          </div>
        )}

        {duelStatus === 'won' && (
          <div className="text-center py-6 space-y-6 animate-in zoom-in duration-500">
            <div className="relative inline-block">
               <Trophy className="w-20 h-20 text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
               <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-secondary animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black text-white italic">MATCH WON!</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Watch ad to unlock base 250 Coins</p>
            </div>
            <AdGate actionName="Claim Duel Reward" onReward={handleClaimBaseReward}>
              <Button className="w-full bg-primary font-black py-7 rounded-2xl shadow-xl uppercase tracking-tighter">
                <Zap className="w-5 h-5 mr-2" /> WATCH AD & CLAIM 250
              </Button>
            </AdGate>
          </div>
        )}

        {duelStatus === 'choosing_card' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-center text-xs font-black text-secondary uppercase tracking-widest">Select your Mystery Card</p>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  onClick={() => handleSelectCard(i)}
                  className={cn(
                    "aspect-[3/4] rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-500",
                    selectedCard === null ? "border-primary/40 bg-primary/5 hover:scale-105 hover:border-primary" : 
                    selectedCard === i ? "border-secondary bg-secondary/20 scale-110 rotate-y-180" : "opacity-20 grayscale"
                  )}
                >
                  {selectedCard === i ? (
                    <div className="text-center">
                      <p className="text-[8px] font-black text-secondary uppercase">Bonus</p>
                      <p className="text-sm font-black text-white">+{extraReward}</p>
                    </div>
                  ) : (
                    <Gift className="w-8 h-8 text-primary/40" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Hero Spin Section */}
      <Card className="glass-morphism border-primary/20 bg-gradient-to-b from-primary/10 via-background to-background p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(163,92,255,0.1),transparent_70%)]" />
        
        <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
          <div className={`relative flex items-center justify-center transition-all duration-[2000ms] ease-out ${isSpinning ? 'rotate-[1080deg] scale-110' : ''}`}>
            <div className="absolute -inset-10 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="w-48 h-48 rounded-full border-[1px] border-primary/20 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(163,92,255,0.1)]">
               <Gift className="w-24 h-24 text-primary drop-shadow-[0_0_15px_rgba(163,92,255,0.8)] animate-bounce" />
               <Sparkles className="absolute top-0 right-0 w-6 h-6 text-secondary animate-pulse" />
               <Zap className="absolute bottom-4 left-4 w-4 h-4 text-primary opacity-50" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black tracking-tighter italic uppercase text-white drop-shadow-lg">LUCKY NEON SPIN</h3>
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-4 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 text-secondary" />
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">JACKPOT: 10,000 COINS</p>
            </div>
          </div>

          <AdGate actionName="Lucky Spin" onReward={handleSpin}>
            <Button disabled={isSpinning} className="bg-primary text-white hover:bg-primary/80 font-black px-16 py-7 rounded-2xl shadow-[0_0_40px_rgba(163,92,255,0.3)] text-xl uppercase tracking-tighter transition-all active:scale-95">
              {isSpinning ? "CALCULATING..." : "SPIN NOW"}
            </Button>
          </AdGate>
        </div>
      </Card>

      {/* Mystery Crates Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <Package className="w-3 h-3" /> NEON SUPPLY DROPS
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <MysteryBoxCard tier="Silver" maxReward="10,000 COINS" />
          <MysteryBoxCard tier="Gold" maxReward="30,000 COINS" />
          <div className="col-span-2">
            <MysteryBoxCard tier="Diamond" maxReward="50,000 COINS" isLarge />
          </div>
        </div>
      </div>
    </div>
  );
};

const MysteryBoxCard = ({ tier, maxReward, isLarge }: { tier: string, maxReward: string, isLarge?: boolean }) => {
  const configs: Record<string, { color: string, glow: string, iconColor: string }> = {
    Silver: { color: "border-slate-500/20 text-slate-300", glow: "from-slate-500/10", iconColor: "text-slate-400" },
    Gold: { color: "border-yellow-500/20 text-yellow-500", glow: "from-yellow-500/10", iconColor: "text-yellow-400" },
    Diamond: { color: "border-cyan-500/30 text-cyan-400", glow: "from-cyan-500/20", iconColor: "text-cyan-400" },
  };
  
  const config = configs[tier] || configs.Silver;

  return (
    <Card className={`glass-morphism p-5 flex flex-col items-center text-center space-y-5 border-white/5 relative overflow-hidden group ${isLarge ? 'bg-gradient-to-br from-white/5 to-transparent' : ''}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${config.glow} to-transparent opacity-30`} />
      
      <div className={`relative ${isLarge ? 'p-2' : ''}`}>
        <Package className={`${isLarge ? 'w-16 h-16' : 'w-12 h-12'} ${config.iconColor} ${tier === 'Diamond' ? 'animate-bounce' : 'animate-pulse'} transition-transform group-hover:scale-110`} />
        {tier === 'Diamond' && <Zap className="absolute -top-1 -right-1 w-5 h-5 text-cyan-400 animate-flicker" />}
      </div>

      <div className="space-y-1 relative z-10">
        <p className={`font-black tracking-tighter uppercase ${isLarge ? 'text-lg' : 'text-sm'} text-white`}>{tier} CRATE</p>
        <p className="text-[9px] font-black text-white/50 tracking-widest uppercase">MAX REWARD: {maxReward}</p>
      </div>

      <AdGate actionName="Open Box" onReward={() => toast({ title: "Crate Unlocked", description: `Accessing ${tier} vault...` })}>
        <Button size="sm" variant="outline" className={`w-full border-white/10 hover:bg-white/10 uppercase font-black text-[10px] h-9 rounded-xl tracking-tighter relative z-10 transition-all active:scale-95 ${config.iconColor}`}>
          UNLOCK ACCESS
        </Button>
      </AdGate>
    </Card>
  );
};

const Badge = ({ children, variant, className }: any) => (
  <span className={cn(
    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
    variant === 'secondary' ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-primary/10 text-primary border-primary/20",
    className
  )}>
    {children}
  </span>
);
