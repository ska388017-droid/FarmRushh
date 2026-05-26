"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AdGateProps {
  onReward: () => void;
  children: React.ReactNode;
  actionName: string;
}

/**
 * AdGate handles reward distribution.
 * Since Adsterra Social Bar and Popunder are display ads, 
 * this component fulfills the reward and triggers a minor cooldown.
 */
export const AdGate: React.FC<AdGateProps> = ({ onReward, children, actionName }) => {
  const { watchAd } = useGame();
  const [isCooldown, setIsCooldown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const triggerAdAction = async () => {
    if (isCooldown) {
      toast({ 
        title: "Protocol Cooldown", 
        description: "System stabilizing. Please wait 15s.",
        variant: "destructive" 
      });
      return;
    }

    setIsProcessing(true);

    // Simulate verification delay for the display ads to be served
    setTimeout(() => {
      try {
        watchAd();
        onReward();
        
        setIsProcessing(false);
        setIsCooldown(true);
        
        // 15s cooldown between interactions to maintain economy balance
        setTimeout(() => setIsCooldown(false), 15000); 
        
        toast({ 
          title: "Verification Successful", 
          description: `Bounty for ${actionName} has been distributed.` 
        });
      } catch (e) {
        console.error("Reward Processing Error", e);
        setIsProcessing(false);
      }
    }, 800);
  };

  return (
    <div onClick={triggerAdAction} className="cursor-pointer relative group">
      {isProcessing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      )}
      <div className={isProcessing ? "opacity-50 pointer-events-none" : ""}>
        {children}
      </div>
    </div>
  );
};
