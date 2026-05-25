
"use client";

import React from "react";
import { useGame } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Instagram, Send, CheckCircle2, Coins, ArrowRight, Zap, Play, PlayCircle, Trophy, Box } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AdGate } from "@/components/ads/AdGate";

export const Tasks = () => {
  const { addCoins, completeTask, claimAdMilestone, user } = useGame();

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

  const adMilestones = [
    { id: "ad_3", target: 3, reward: 2000, title: "Novice Viewer", subtitle: "Watch 3 Ads" },
    { id: "ad_10", target: 10, reward: 10000, title: "Ad Enthusiast", subtitle: "Watch 10 Ads" },
    { id: "ad_25", target: 25, reward: 25000, title: "Mystery Box", subtitle: "Watch 25 Ads", special: true },
  ];

  const socialTasks = [
    { id: "tg_join", title: "Join CashNovazhv", subtitle: "Official Telegram Channel", reward: 1000, icon: Send, color: "bg-blue-500" },
    { id: "ig_follow", title: "Follow cashnova503", subtitle: "Official Instagram Page", reward: 1000, icon: Instagram, color: "bg-pink-500" },
    { id: "yt_sub", title: "Subscribe FarmRush", subtitle: "Earn 2x Boosters", reward: 2000, icon: ArrowRight, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary tracking-tighter uppercase">Bounty Hub</h2>
        <Badge variant="outline" className="border-secondary text-secondary font-black">ACTIVE</Badge>
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
          <Trophy className="w-3 h-3 text-secondary" /> Ad Milestones
        </h3>
        
        <div className="space-y-3">
          {adMilestones.map((milestone) => {
            const isClaimed = user.claimedAdMilestones?.includes(milestone.id);
            const progress = Math.min(100, (user.adsWatched / milestone.target) * 100);
            const canClaim = user.adsWatched >= milestone.target && !isClaimed;

            return (
              <Card key={milestone.id} className="glass-morphism p-4 border-white/5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${milestone.special ? 'bg-secondary/10 border-secondary/30' : 'bg-primary/10 border-primary/20'}`}>
                      {milestone.special ? <Box className="w-5 h-5 text-secondary" /> : <PlayCircle className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase">{milestone.title}</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">{milestone.subtitle}</p>
                    </div>
                  </div>
                  
                  {isClaimed ? (
                    <Badge className="bg-secondary/20 text-secondary border-none text-[8px] font-black uppercase">CLAIMED</Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      disabled={!canClaim}
                      onClick={() => claimAdMilestone(milestone.id, milestone.reward, milestone.special ? 5 : 0)}
                      className={`h-8 text-[9px] font-black rounded-lg px-4 ${canClaim ? 'bg-secondary text-secondary-foreground shadow-lg' : 'bg-white/5 text-muted-foreground cursor-not-allowed'}`}
                    >
                      {canClaim ? 'CLAIM REWARD' : `${user.adsWatched}/${milestone.target}`}
                    </Button>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>PROGRESS</span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1 bg-white/5" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 flex items-center gap-2">
          <PlayCircle className="w-3 h-3 text-primary" /> Daily Ad Taps
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
