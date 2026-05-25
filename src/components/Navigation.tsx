
"use client";

import React from "react";
import { Pickaxe, User, ListTodo, Users, Wallet, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "mining", label: "Mining", icon: Pickaxe },
    { id: "tasks", label: "Tasks", icon: ListTodo },
    { id: "friends", label: "Friends", icon: Users },
    { id: "vip", label: "VIP", icon: Crown },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "profile", label: "Me", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-6 pt-2 bg-background/80 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-md mx-auto flex justify-between items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center space-y-1 transition-all duration-300 relative px-1 py-1 flex-1",
                isActive ? "scale-105" : "opacity-40 hover:opacity-100"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive 
                  ? tab.id === 'vip' 
                    ? "bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-primary/20 shadow-[0_0_15px_rgba(163,92,255,0.4)]"
                  : ""
              )}>
                <Icon className={cn("w-4 h-4", isActive ? (tab.id === 'vip' ? "text-amber-500" : "text-primary") : "text-white")} />
              </div>
              <span className={cn("text-[7px] font-black uppercase tracking-tighter", isActive ? (tab.id === 'vip' ? "text-amber-500" : "text-primary") : "text-white")}>
                {tab.label}
              </span>
              {isActive && (
                <div className={cn(
                  "absolute -top-1 w-1 h-1 rounded-full",
                  tab.id === 'vip' ? "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,1)]" : "bg-primary shadow-[0_0_5px_rgba(163,92,255,1)]"
                )} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
