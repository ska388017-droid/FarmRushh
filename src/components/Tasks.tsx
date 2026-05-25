
"use client";

import React from "react";
import { useGame } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, Send, CheckCircle2, Coins, ArrowRight, Zap, Play, PlayCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AdGate } from "@/components/ads/AdGate";

export const Tasks = () => {
  const { addCoins, completeTask, user } = useGame();

  const handleTask = (taskId: string, coins: number) => {
    const isCompleted = taskId === "tg_join" ? user.ownReferralProgress.tgJoined : taskId === "ig_follow" ? user.ownReferralProgress.igFollowed : false;
    
    if (isCompleted) return;
    
    toast({ title: "Redirecting...", description: "Please complete the task and return." });
    setTimeout(() => {
      addCoins(coins);
      completeTask(taskId);
      toast({ title: "Verified", description: `+${coins} CyberCoins rewarded!` });
    }, 3000);
  };

  const socialTasks = [
    { id: "tg_join", title: "Join CashNovazhv", subtitle: "Official Telegram Channel", reward: 1000, icon: Send, color: "bg-blue-500" },
    { id: "ig_follow", title: "Follow cashnova503", subtitle: "Official Instagram Page", reward: 1000, icon: Instagram, color: "bg-pink-500" },
    { id: "yt_sub", title: "Subscribe FarmRush", subtitle: "Earn 2x Boosters", reward: 2000, icon: ArrowRight, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary tracking-tighter">BOUNTY HUB</h2>
        <Badge variant="outline" className="border-secondary text-secondary">LIVE</Badge>
      </div>

      {user.referredBy && !user.referralBonusClaimed && (
        <Card className="glass-morphism p-4 border-primary/40 bg-primary/5 animate-pulse">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Referral Bonus Pending</p>
              <p className="text-[10px] text-white/80 italic leading-snug">
                Complete the TG and IG tasks below + watch 5 ads to unlock your 2,000 coin welcome bonus!
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 flex items-center gap-2">
          <PlayCircle className="w-3 h-3 text-secondary" /> Daily Ad Taps
        </h3>
        
        <Card className="glass-morphism p-4 border-secondary/20 bg-secondary/5 relative overflow-hidden group border-dashed">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                <Play className="w-6 h-6 text-secondary animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-tighter">Quick Crystal Burst</p>
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Watch ad for 500 crystals</p>
              </div>
            </div>
            <AdGate actionName="Tasks Page Ad" onReward={() => {
              addCoins(500);
              toast({ title: "Task Complete", description: "500 crystals added." });
            }}>
              <Button size="sm" className="bg-secondary text-secondary-foreground font-black text-[10px] h-9 rounded-xl px-4 shadow-lg">
                EARN NOW
              </Button>
            </AdGate>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 flex items-center gap-2">
          <Coins className="w-3 h-3 text-primary" /> Operator Missions
        </h3>
        <div className="space-y-3">
          {socialTasks.map((task) => {
            const isDone = task.id === "tg_join" ? user.ownReferralProgress.tgJoined : task.id === "ig_follow" ? user.ownReferralProgress.igFollowed : false;

            return (
              <Card key={task.id} className="glass-morphism overflow-hidden p-4 group border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${task.color} bg-opacity-20 text-white shadow-inner`}>
                      <task.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white tracking-tight">{task.title}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{task.subtitle}</p>
                    </div>
                  </div>
                  
                  {isDone ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-6 h-6 text-secondary" />
                      <span className="text-[8px] text-secondary font-black">VALIDATED</span>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => handleTask(task.id, task.reward)} className="bg-primary hover:bg-primary/80 font-black px-4 rounded-xl shadow-lg">
                      +{task.reward}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
