"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdGateProps {
  onReward: () => void;
  children: React.ReactNode;
  actionName: string;
}

/**
 * AdGate v2.5.3 - Forced Ad Engagement Layer
 * Since Adsterra Social Bar and Popunder trigger on click, 
 * this component acts as the mandatory gateway for rewards.
 */
export const AdGate: React.FC<AdGateProps> = ({ onReward, children, actionName }) => {
  const { watchAd } = useGame();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "verifying" | "complete">("idle");

  const triggerAdAction = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setStatus("verifying");

    // Forced verification delay to ensure Adsterra units (Popunder/Social Bar) 
    // have time to trigger on the user's interaction.
    setTimeout(() => {
      try {
        // Register ad watch in game store
        watchAd();
        
        // Fulfill reward
        onReward();
        
        setStatus("complete");
        
        toast({ 
          title: "Ad Verified", 
          description: `Bounty for ${actionName} received.` 
        });

        // Reset state after success
        setTimeout(() => {
          setIsProcessing(false);
          setStatus("idle");
        }, 1000);

      } catch (e) {
        console.error("Ad Verification Error", e);
        setIsProcessing(false);
        setStatus("idle");
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "Please ensure your connection is stable."
        });
      }
    }, 2500); // 2.5s Mandatory "Ad Viewing" Simulation
  };

  return (
    <div onClick={triggerAdAction} className="cursor-pointer relative group w-full">
      {isProcessing && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-background/80 rounded-2xl backdrop-blur-md border border-primary/30 animate-in fade-in zoom-in duration-300">
          <div className="relative mb-3">
             <Loader2 className="w-8 h-8 text-primary animate-spin" />
             <div className="absolute inset-0 w-8 h-8 rounded-full border-t-2 border-secondary animate-ping opacity-20" />
          </div>
          <div className="text-center space-y-1">
             <p className="text-[10px] font-black text-white uppercase tracking-tighter italic">Verifying Engagement...</p>
             <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-2.5 h-2.5 text-secondary" />
                <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Adsterra Secure Protocol</span>
             </div>
          </div>
          
          {/* Progress bar simulation */}
          <div className="mt-4 w-32 h-1 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-primary animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
          </div>
        </div>
      )}
      
      <div className={cn(
        "transition-all duration-300",
        isProcessing ? "opacity-20 scale-95 pointer-events-none blur-sm" : "opacity-100 scale-100"
      )}>
        {children}
      </div>
    </div>
  );
};
