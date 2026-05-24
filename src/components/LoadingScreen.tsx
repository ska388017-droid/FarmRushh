
"use client";

import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2, Coins, Zap } from "lucide-react";

export const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const tips = [
    "Harvest neon crops to earn CyberCoins.",
    "Upgrade to God Elite for 10x referral bonus.",
    "Watching ads before mystery boxes triples luck!",
    "Crypto withdrawals require 20 ads watched.",
    "Daily streaks grant free Spin Tickets."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
    };
  }, [onComplete, tips.length]);

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center p-8">
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full border-4 border-primary/20 flex items-center justify-center animate-pulse">
          <Zap className="w-16 h-16 text-secondary animate-bounce" />
        </div>
        <div className="absolute inset-0 w-32 h-32 rounded-full border-t-4 border-primary animate-spin" />
        <div className="absolute -top-4 -right-4">
          <Coins className="w-8 h-8 text-primary animate-flicker" />
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tighter text-white mb-2 neon-text-primary">
        FARMRUSH
      </h1>
      <p className="text-muted-foreground text-sm uppercase tracking-widest mb-12">
        Initializing Neural Link...
      </p>

      <div className="w-full max-w-xs space-y-4">
        <Progress value={progress} className="h-1 bg-white/10" />
        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
          <span>SYSTEM_BOOT_{progress}%</span>
          <span>STABLE</span>
        </div>
      </div>

      <div className="mt-12 text-center max-w-xs transition-all duration-500 min-h-[3rem]">
        <p className="text-secondary text-sm font-medium animate-flicker italic">
          Tip: {tips[tipIndex]}
        </p>
      </div>
      
      <div className="absolute bottom-8 text-[10px] text-muted-foreground uppercase tracking-widest opacity-30">
        Monetag Ad Engine: Active | Firebase: Ready
      </div>
    </div>
  );
};
