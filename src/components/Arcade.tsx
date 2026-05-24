
"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdGate } from "@/components/ads/AdGate";
import { RotateCw, Package, Star, Trophy, Gift } from "lucide-react";
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary">ARCADE</h2>
        <div className="flex gap-2">
          <Card className="bg-primary/10 border-primary/20 px-3 py-1 flex items-center gap-2">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-xs font-bold">{user.spinTickets}</span>
          </Card>
        </div>
      </div>

      <div className="relative">
        <Card className="glass-morphism bg-gradient-to-b from-primary/20 to-transparent p-8 flex flex-col items-center justify-center space-y-6">
          <div className={`w-40 h-40 rounded-full border-8 border-primary/30 relative flex items-center justify-center transition-all duration-[2000ms] ease-out ${isSpinning ? 'rotate-[1080deg]' : ''}`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-2 h-6 bg-secondary shadow-[0_0_10px_rgba(57,255,20,1)] rounded-full z-10" />
            <RotateCw className="w-16 h-16 text-primary opacity-20" />
            <Gift className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black italic">LUCKY NEON SPIN</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Jackpot: 10,000 Coins</p>
          </div>

          <AdGate actionName="Lucky Spin" onReward={handleSpin}>
            <Button disabled={isSpinning} className="bg-primary text-white hover:bg-primary/80 font-black px-12 py-6 rounded-full shadow-[0_0_30px_rgba(163,92,255,0.4)] text-lg uppercase tracking-tighter">
              {isSpinning ? "SPINNING..." : "SPIN NOW"}
            </Button>
          </AdGate>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
          <Package className="w-4 h-4" /> Mystery Boxes
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <MysteryBoxCard tier="Silver" cost={0} probability="10%" />
          <MysteryBoxCard tier="Gold" cost={0} probability="5%" />
        </div>
      </div>
    </div>
  );
};

const MysteryBoxCard = ({ tier, cost, probability }: { tier: string, cost: number, probability: string }) => {
  const colorClass = tier === "Gold" ? "text-yellow-400 border-yellow-400/30" : "text-slate-300 border-slate-300/30";
  
  return (
    <Card className={`glass-morphism p-4 flex flex-col items-center text-center space-y-3 ${colorClass}`}>
      <Package className={`w-12 h-12 ${tier === 'Gold' ? 'animate-bounce' : 'animate-pulse'}`} />
      <div>
        <p className="font-bold text-sm tracking-tight">{tier} Box</p>
        <p className="text-[10px] opacity-70">Rare Prob: {probability}</p>
      </div>
      <AdGate actionName="Open Box" onReward={() => toast({ title: "Box Opened", description: "You found 150 CyberCoins!" })}>
        <Button size="sm" variant="outline" className={`w-full border-white/20 hover:bg-white/10 uppercase font-bold text-[10px]`}>
          OPEN AD-GATED
        </Button>
      </AdGate>
    </Card>
  );
};
