"use client";

import React, { useState } from "react";
import { GameProvider, useGame } from "@/lib/game-store";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navigation } from "@/components/Navigation";
import { MiningSystem } from "@/components/MiningSystem";
import { WalletSystem } from "@/components/WalletSystem";
import { Tasks } from "@/components/Tasks";
import { Profile } from "@/components/Profile";
import { ReferralSystem } from "@/components/ReferralSystem";
import { VIPCenter } from "@/components/VIPCenter";
import { Toaster } from "@/components/ui/toaster";
import { Badge } from "@/components/ui/badge";
import { Diamond, Bell, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OfflineEarningsModal } from "@/components/OfflineEarningsModal";
import { cn } from "@/lib/utils";

const AppContent = () => {
  const [activeTab, setActiveTab] = useState("mining");
  const { user } = useGame();

  const coins = user?.wallet?.coins || 0;
  const isVip = user?.vipStatus && user.vipStatus !== "none";

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 max-w-md mx-auto relative px-4 w-full overflow-x-hidden">
      <header className="py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-11 h-11 rounded-full p-[2px]",
            isVip 
              ? "bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
              : "bg-gradient-to-tr from-primary to-secondary"
          )}>
            <Avatar className="w-full h-full border-2 border-background">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-muted text-primary text-xs font-black">
                {user?.username?.substring(0,2).toUpperCase() || "OP"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
               <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">ID: {user?.uid || "-------"}</p>
               {isVip && (
                 <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[7px] px-1 h-3 font-black uppercase tracking-tighter">
                   <Crown className="w-2 h-2 mr-0.5" /> {user.vipStatus}
                 </Badge>
               )}
            </div>
            <p className="text-sm font-black tracking-tight flex items-center gap-1">
              {user?.username || "Operator"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 h-9 flex items-center gap-2 px-3 rounded-xl hover:bg-primary/20 transition-colors">
            <Diamond className="w-4 h-4" />
            <span className="text-sm font-black">{Math.floor(coins).toLocaleString()}</span>
          </Badge>
          <div className="w-9 h-9 rounded-xl glass-morphism flex items-center justify-center relative border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(57,20,20,0.8)]" />
          </div>
        </div>
      </header>

      <section className="mt-2 animate-in fade-in duration-500 w-full overflow-x-hidden">
        {activeTab === "mining" && <MiningSystem />}
        {activeTab === "tasks" && <Tasks />}
        {activeTab === "friends" && <ReferralSystem />}
        {activeTab === "vip" && <VIPCenter />}
        {activeTab === "wallet" && <WalletSystem />}
        {activeTab === "profile" && <Profile />}
      </section>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <OfflineEarningsModal />
      <Toaster />
    </main>
  );
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
