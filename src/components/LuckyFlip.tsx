
"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { Button } from "@/components/ui/button";
import { Diamond, Coins, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface LuckyFlipProps {
  onClose: () => void;
}

export const LuckyFlip = ({ onClose }: LuckyFlipProps) => {
  const { addCoins } = useGame();
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  
  // Weighted rewards: Common (500) is more likely than Rare (3000)
  const [rewards] = useState(() => {
    const pool = [
      { type: 'coins', amount: 300, label: "300 COINS" },
      { type: 'coins', amount: 500, label: "500 COINS" },
      { type: 'coins', amount: 800, label: "800 COINS" },
      { type: 'coins', amount: 1200, label: "1,200 COINS" },
      { type: 'coins', amount: 3000, label: "3,000 COINS" }, // Max Cap
    ];
    
    // Pick 3 rewards with weighted chance (simplified as random shuffle of selected sub-pool)
    return pool.sort(() => Math.random() - 0.5).slice(0, 3);
  });

  const handleFlip = (index: number) => {
    if (flippedIndex !== null) return;
    setFlippedIndex(index);
    const reward = rewards[index];
    addCoins(reward.amount);
    toast({ title: "Reward Claimed!", description: `You won ${reward.label}!` });
    setTimeout(onClose, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full glass-morphism flex items-center justify-center border-white/10">
        <X className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="text-center space-y-2 mb-12">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase neon-text-primary">Lucky Flip</h2>
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Choose a card to reveal your bounty</p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            onClick={() => handleFlip(i)}
            className="perspective-1000 h-48 cursor-pointer group"
          >
            <div className={cn(
              "relative w-full h-full transition-all duration-700 transform-style-3d",
              flippedIndex === i ? "rotate-y-180" : ""
            )}>
              {/* Front */}
              <div className="absolute inset-0 backface-hidden glass-morphism rounded-2xl border-primary/30 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-transparent shadow-[0_0_20px_rgba(163,92,255,0.1)] group-hover:border-primary/60 transition-colors">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4">
                    <Diamond className="w-6 h-6 text-primary animate-pulse" />
                 </div>
                 <span className="text-[8px] font-black text-primary/50 uppercase tracking-widest">TAP TO FLIP</span>
              </div>
              
              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 glass-morphism rounded-2xl border-secondary/50 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-secondary/20 to-transparent shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                 <Sparkles className="w-8 h-8 text-secondary mb-2 animate-bounce" />
                 <p className="text-xs font-black text-white uppercase tracking-tighter text-center">{rewards[i]?.label}</p>
                 <Badge className="mt-2 bg-secondary/10 text-secondary border-secondary/20 text-[8px] font-black">CLAIMED</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-2 px-4 py-2 glass-morphism rounded-full border-white/5">
         <Coins className="w-4 h-4 text-primary" />
         <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Secure Escrow Guaranteed</span>
      </div>
    </div>
  );
};

const Badge = ({ children, className }: any) => (
  <div className={cn("px-2 py-0.5 rounded-full border", className)}>
    {children}
  </div>
);
