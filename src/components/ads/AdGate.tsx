
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
      if (window.show_11042868) {
        // @ts-ignore
        window.show_11042868().then(() => {
          watchAd();
          onReward();
          setIsCooldown(true);
          setTimeout(() => setIsCooldown(false), 30000); // 30s cooldown
        }).catch((e: any) => {
          console.error("Ad failed:", e);
          // For dev/test, we still reward if SDK fails to load or error occurs
          watchAd();
          onReward();
        });
      } else {
        // Fallback for dev environment
        console.warn("Monetag SDK not detected. Auto-rewarding for dev.");
        watchAd();
        onReward();
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
