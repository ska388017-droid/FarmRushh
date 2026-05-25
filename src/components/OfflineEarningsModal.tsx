
"use client";

import React from "react";
import { useGame } from "@/lib/game-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Zap, Timer, TrendingUp } from "lucide-react";
import { AdGate } from "@/components/ads/AdGate";

export const OfflineEarningsModal = () => {
  const { offlineEarnings, claimOfflineEarnings } = useGame();

  if (offlineEarnings <= 0) return null;

  return (
    <Dialog open={offlineEarnings > 0} onOpenChange={() => claimOfflineEarnings(false)}>
      <DialogContent className="max-w-[320px] rounded-3xl glass-morphism border-primary/30 p-0 overflow-hidden bg-background">
        <div className="relative p-6 text-center space-y-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 relative">
              <Timer className="w-8 h-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-ping" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
                System Re-Sync
              </DialogTitle>
            </DialogHeader>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              Passive Miners were active while you were offline.
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-primary" />
              <span className="text-3xl font-black text-white">{offlineEarnings.toLocaleString()}</span>
            </div>
            <p className="text-[9px] text-primary font-bold uppercase tracking-tighter">CYBERCOINS COLLECTED</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <AdGate actionName="Triple Offline Earnings" onReward={() => claimOfflineEarnings(true)}>
              <Button className="w-full bg-secondary text-secondary-foreground font-black h-12 rounded-xl group relative overflow-hidden shadow-lg shadow-secondary/20">
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Zap className="w-4 h-4 mr-2" /> TRIPLE TO { (offlineEarnings * 3).toLocaleString() }
              </Button>
            </AdGate>
            <Button 
              variant="ghost" 
              onClick={() => claimOfflineEarnings(false)}
              className="text-muted-foreground hover:text-white font-bold text-[10px] uppercase tracking-widest"
            >
              Claim Standard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
