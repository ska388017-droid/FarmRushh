
"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdGate } from "@/components/ads/AdGate";
import { Gift, Package, Star, TrendingUp, Sparkles, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const Arcade = () => {
  const { user, spendTickets, addCoins } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);

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
