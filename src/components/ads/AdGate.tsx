
"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { toast } from "@/hooks/use-toast";

interface AdGateProps {
  onReward: () => void;
  children: React.ReactNode;
  actionName: string;
}

export const AdGate: React.FC<AdGateProps> = ({ onReward, children, actionName }) => {
  const { watchAd } = useGame();
  const [isCooldown, setIsCooldown] = useState(false);

  const triggerAd = async () => {
    if (isCooldown) {
      toast({ title: "Ad Cooldown", description: "Wait a moment before watching another ad." });
      return;
    }

    try {
      // @ts-ignore - Monetag Global function from SDK
      if (typeof window !== 'undefined' && (window as any).show_11042868) {
        // @ts-ignore
        (window as any).show_11042868().then(() => {
          watchAd();
          onReward();
          setIsCooldown(true);
          setTimeout(() => setIsCooldown(false), 30000); // 30s cooldown
        }).catch((e: any) => {
          console.error("Ad failed:", e);
          watchAd();
          onReward();
        });
      } else {
        // Fallback for dev environment
        watchAd();
        onReward();
        setIsCooldown(true);
        setTimeout(() => setIsCooldown(false), 5000); 
      }
    } catch (e) {
      console.error("Ad Trigger Error", e);
    }
  };

  return (
    <div onClick={triggerAd} className="cursor-pointer">
      {children}
    </div>
  );
};
