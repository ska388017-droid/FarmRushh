
"use client";

import React from "react";
import { Sprout, Wallet, LayoutGrid, BrainCircuit, User, ListTodo, Ghost } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "farm", label: "Farm", icon: Sprout },
    { id: "arcade", label: "Arcade", icon: LayoutGrid },
    { id: "ai", label: "AI", icon: BrainCircuit },
    { id: "tasks", label: "Tasks", icon: ListTodo },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-background/80 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center space-y-1 transition-all duration-300 relative px-2 py-1",
                isActive ? "scale-110" : "opacity-40 hover:opacity-100"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-primary/20 shadow-[0_0_15px_rgba(163,92,255,0.4)]" : ""
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-white")} />
              </div>
              <span className={cn("text-[9px] font-bold uppercase tracking-widest", isActive ? "text-primary" : "text-white")}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_rgba(163,92,255,1)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
