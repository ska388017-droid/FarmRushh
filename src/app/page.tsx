
"use client";

import React, { useState, useEffect } from "react";
import { GameProvider, useGame } from "@/lib/game-store";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navigation } from "@/components/Navigation";
import { FarmEngine } from "@/components/FarmEngine";
import { WalletSystem } from "@/components/WalletSystem";
import { Arcade } from "@/components/Arcade";
import { AIStrategy } from "@/components/AIStrategy";
import { Tasks } from "@/components/Tasks";
import { Profile } from "@/components/Profile";
import { Toaster } from "@/components/ui/toaster";
import { Badge } from "@/components/ui/badge";
import { Coins, User, Bell } from "lucide-react";

const AppContent = () => {
  const [activeTab, setActiveTab] = useState("farm");
  const { user } = useGame();

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 max-w-md mx-auto relative px-4">
      {/* Top Bar */}
      <header className="py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Operative</p>
            <p className="text-sm font-black tracking-tight">{user.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-muted text-secondary border-secondary/20 h-9 flex items-center gap-2 px-3 rounded-xl">
            <Coins className="w-4 h-4" />
            <span className="text-sm font-black">{user.coins.toLocaleString()}</span>
          </Badge>
          <div className="w-9 h-9 rounded-xl glass-morphism flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* Dynamic Content */}
      <section className="mt-2 animate-in fade-in duration-500">
        {activeTab === "farm" && <FarmEngine />}
        {activeTab === "arcade" && <Arcade />}
        {activeTab === "ai" && <AIStrategy />}
        {activeTab === "tasks" && <Tasks />}
        {activeTab === "wallet" && <WalletSystem />}
        {activeTab === "profile" && <Profile />}
      </section>

      {/* Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
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
