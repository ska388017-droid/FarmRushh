"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Instagram, 
  Send, 
  CheckCircle2, 
  Coins, 
  ArrowRight, 
  Zap, 
  Play, 
  PlayCircle, 
  Trophy, 
  Box, 
  Clapperboard, 
  Ticket,
  Sparkles,
  MonitorPlay,
  Flame,
  Gamepad2,
  Gift,
  Lock,
  ArrowUpCircle,
  ExternalLink,
  Loader2,
  Timer
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AdGate } from "@/components/ads/AdGate";
import { cn } from "@/lib/utils";

export const Tasks = () => {
  const { addCoins, completeTask, updateTaskStatus, claimAdMilestone, claimAdChest, enterAdLottery, user, watchAd, refillEnergy } = useGame();
  const [timers, setTimers] = useState<Record<string, string>>({});

  const handleTaskAction = (taskId: string, url: string, reward: number) => {
    const status = user.socialTasks[taskId] || 'not_started';
    
    if (status === 'completed') return;

    if (status === 'not_started') {
      toast({ title: "Redirecting...", description: "Join our community to qualify for rewards." });
      
      const tg = (window as any).Telegram?.WebApp;
      if (tg && url.includes('t.me')) {
        tg.openTelegramLink(url);
      } else {
        window.open(url, "_blank");
      }

      updateTaskStatus(taskId, 'opened');
      return;
    }

    if (status === 'opened') {
      completeTask(taskId, reward);
      toast({ title: "Task Validated", description: `+${reward.toLocaleString()} CyberCoins added to vault!` });
    }
  };

  const adMilestones = [
    { id: "ad_3", target: 3, reward: 2000, title: "Novice Viewer", subtitle: "Watch 3 Ads" },
    { id: "ad_10", target: 10, reward: 10000, title: "Ad Enthusiast", subtitle: "Watch 10 Ads" },
    { id: "ad_25", target: 25, reward: 25000, title: "Mystery Box", subtitle: "Watch 25 Ads", special: true },
    { id: "ad_50", target: 50, reward: 60000, title: "Ad Pro", subtitle: "Watch 50 Ads", special: true },
    { id: "ad_100", target: 100, reward: 150000, title: "VIP Legend", subtitle: "Watch 100 Ads", special: true },
  ];

  const videoChests = [
    { id: "chest_1", name: "Silver Node", reward: 500, ads: 1 },
    { id: "chest_2", name: "Gold Cache", reward: 1000, ads: 3 },
    { id: "chest_3", name: "Cyber Vault", reward: 1500, ads: 7 },
  ];

  const socialTasks = [
    { 
      id: "tg_join", 
      title: "Join CashNovazhv", 
      subtitle: "Official Telegram Channel", 
      reward: 1000, 
      icon: Send, 
      color: "bg-blue-500",
      url: "https://t.me/CashNovazhv"
    },
    { 
      id: "ig_follow", 
      title: "Follow cashnova503", 
      subtitle: "Official Instagram Page", 
      reward: 1000, 
      icon: Instagram, 
      color: "bg-pink-500",
      url: "https://www.instagram.com/cashnova503?igsh=a2w1bGUwam9xbzE="
    },
    { 
      id: "yt_sub", 
      title: "Subscribe FarmRush", 
      subtitle: "Earn 2x Boosters", 
      reward: 2000, 
      icon: MonitorPlay, 
      color: "bg-red-500",
      url: "https://youtube.com/@FarmRushOfficial"
    },
  ];

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      const newTimers: Record<string, string> = {};
      
      videoChests.forEach(chest => {
        const lastClaim = user.lastChestClaims?.[chest.id] || 0;
        const oneDay = 24 * 60 * 60 * 1000;
        const diff = (lastClaim + oneDay) - now;
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          newTimers[chest.id] = `${hours}h ${minutes}m ${seconds}s`;
        }
      });
      
      setTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [user.lastChestClaims]);

  const cinemaProgress = Math.min(100, ((user.cinemaAdsWatched || 0) / 5) * 100);
  const canClaimPremiere = (user.cinemaAdsWatched || 0) >= 5 && !user.claimedAdMilestones?.includes("cinema_daily");

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary tracking-tighter uppercase">Bounty Hub</h2>
        <div className="flex items-center gap-2">
           {user.adStreak > 1 && (
             <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">
               <Flame className="w-3 h-3 mr-1" /> STREAK x{user.adStreak}
             </Badge>
           )}
           <Badge variant="outline" className="border-secondary text-secondary font-black">ACTIVE</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 flex items-center gap-2">
          <Clapperboard className="w-3 h-3 text-primary" /> Cinema Rewards
        </h3>
        
        <Card className="glass-morphism border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <MonitorPlay className="w-24 h-24 text-primary" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="space-y-1">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] font-black tracking-widest uppercase mb-2">Cinema Hall 01</Badge>
              <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Daily Cyber-Premiere</h4>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Watch 5 Premieres for a 5,000 Coin bonus</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Premiere Progress</span>
                  <span className="text-primary">{user.cinemaAdsWatched || 0} / 5</span>
                </div>
                <Progress value={cinemaProgress} className="h-1.5 bg-white/5" />
              </div>

              <div className="flex gap-2">
                <AdGate actionName="Watch Cinema Premiere" onReward={() => {
                  watchAd(true);
                  addCoins(1000);
                  refillEnergy();
                  toast({ title: "Premiere Complete", description: "+1,000 Coins & +1 Energy Received!" });
                }}>
                  <Button className="flex-1 bg-primary hover:bg-primary/80 text-white font-black h-12 rounded-xl shadow-lg shadow-primary/20">
                    <Ticket className="w-4 h-4 mr-2" /> WATCH PREMIERE
                  </Button>
                </AdGate>
                
                <Button 
                  disabled={!canClaimPremiere}
                  onClick={() => claimAdMilestone("cinema_daily", 5000)}
                  className={cn(
                    "px-6 h-12 rounded-xl font-black text-[10px] transition-all",
                    canClaimPremiere ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20" : "bg-white/5 text-muted-foreground"
                  )}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> CLAIM 5K
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 flex items-center gap-2">
          <Coins className="w-3 h-3 text-primary" /> Operator Missions
        </h3>
        <div className="space-y-3">
          {socialTasks.map((task) => {
            const status = user.socialTasks[task.id] || 'not_started';
            const isDone = status === 'completed';
            const isOpened = status === 'opened';

            return (
              <Card key={task.id} className="glass-morphism overflow-hidden p-4 group border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl bg-opacity-20 text-white shadow-inner",
                      task.color
                    )}>
                      <task.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white tracking-tight">{task.title}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{task.subtitle}</p>
                    </div>
                  </div>
                  
                  {isDone ? (
                    <div className="flex flex-col items-center min-w-[80px]">
                      <CheckCircle2 className="w-6 h-6 text-secondary" />
                      <span className="text-[8px] text-secondary font-black">VALIDATED</span>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleTaskAction(task.id, task.url, task.reward)}
                      className={cn(
                        "font-black px-4 rounded-xl shadow-lg min-w-[80px] h-10 transition-all duration-300",
                        isOpened ? "bg-secondary text-secondary-foreground animate-pulse" : "bg-primary hover:bg-primary/80 text-white"
                      )}
                    >
                      {isOpened ? (
                        <div className="flex items-center gap-1.5">
                          CLAIM
                        </div>
                      ) : (
                        `+${task.reward}`
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 flex items-center gap-2">
          <Box className="w-3 h-3 text-secondary" /> Daily Resource Nodes
        </h3>
        <p className="text-[8px] text-muted-foreground uppercase font-black px-1 -mt-2">Limit: Once per 24h | Cost: 15 Energy</p>
        <div className="grid grid-cols-3 gap-3">
          {videoChests.map((chest) => {
            const cooldownTimer = timers[chest.id];
            const isClaimedToday = !!cooldownTimer;
            
            return (
              <Card key={chest.id} className={cn(
                "glass-morphism p-3 flex flex-col items-center gap-2 border-white/5 transition-all relative group overflow-hidden",
                isClaimedToday ? "opacity-60 grayscale bg-black/20" : "hover:border-secondary/40 animate-in fade-in"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500",
                  isClaimedToday ? "bg-white/5 border-white/5" : "bg-secondary/10 border-secondary/20 shadow-[0_0_15px_rgba(57,255,20,0.1)] group-hover:scale-110"
                )}>
                  {isClaimedToday ? <Lock className="w-6 h-6 text-muted-foreground/50" /> : <Box className="w-6 h-6 text-secondary animate-bounce" />}
                </div>
                
                <div className="text-center space-y-0.5 z-10">
                   <p className="text-[8px] font-black text-white uppercase truncate">{chest.name}</p>
                   <p className="text-[7px] text-secondary font-black tracking-widest">+{chest.reward} C</p>
                </div>

                {isClaimedToday ? (
                  <div className="w-full space-y-1 mt-2">
                    <p className="text-[7px] font-black text-secondary uppercase text-center">Claimed Today</p>
                    <div className="flex items-center justify-center gap-1 text-[6px] text-muted-foreground font-mono bg-black/30 py-0.5 rounded-sm">
                      <Timer className="w-2 h-2" /> {cooldownTimer}
                    </div>
                  </div>
                ) : (
                  <AdGate actionName={`Unlock ${chest.name}`} onReward={() => {
                    const success = claimAdChest(chest.id, chest.reward);
                    if (success) {
                      toast({ title: "Node Depleted", description: `Recovered ${chest.reward} coins from vault.` });
                    }
                  }}>
                    <Button size="sm" className="h-7 text-[8px] w-full font-black rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-1 shadow-lg shadow-secondary/20">
                      EXTRACT
                    </Button>
                  </AdGate>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="glass-morphism p-5 border-dashed border-primary/40 bg-primary/5 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/40 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-tighter">Daily Cyber-Lottery</p>
              <p className="text-[9px] text-muted-foreground uppercase font-bold">Entry: Watch 1 Ad | Win 50k Coins</p>
            </div>
          </div>
          <AdGate actionName="Enter Lottery" onReward={() => {
            enterAdLottery();
            refillEnergy();
            toast({ title: "Entry Verified!", description: "Entries: " + (user.lotteryEntries + 1) + " | +1 Energy gained." });
          }}>
            <Button className="bg-primary text-white font-black h-10 px-6 rounded-xl shadow-lg">
              {user.lotteryEntries > 0 ? `ENTRIES: ${user.lotteryEntries}` : "JOIN"}
            </Button>
          </AdGate>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 flex items-center gap-2">
          <Trophy className="w-3 h-3 text-secondary" /> Ad Ladder Milestones
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
                      {milestone.special ? <ArrowUpCircle className="w-5 h-5 text-secondary" /> : <PlayCircle className="w-5 h-5 text-primary" />}
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
    </div>
  );
};
