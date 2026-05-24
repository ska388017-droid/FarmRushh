
"use client";

import React from "react";
import { useGame } from "@/lib/game-store";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, ShieldCheck, Zap, Settings, Share2, Award, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Profile = () => {
  const { user } = useGame();
  const xpToNextLevel = 1000 - (user.xp % 1000);
  const progress = (user.xp % 1000) / 10;

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary">OPERATOR</h2>
        <Settings className="w-5 h-5 text-muted-foreground hover:text-white transition-colors cursor-pointer" />
      </div>

      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative p-1 bg-gradient-to-tr from-primary to-secondary rounded-full">
            <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src={`https://picsum.photos/seed/${user.username}/200`} />
              <AvatarFallback>{user.username.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-[10px] px-3 border-background shadow-xl">
            {user.tier}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-xl font-black flex items-center justify-center gap-2">
            {user.username} <ShieldCheck className="w-5 h-5 text-primary" />
          </h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
            <Zap className="w-3 h-3 text-secondary" /> LEVEL {user.level} OPERATIVE
          </p>
        </div>
      </div>

      <Card className="glass-morphism p-6 space-y-4">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Experience Points</span>
          <span className="text-xs font-bold text-primary">{user.xp % 1000} / 1000 XP</span>
        </div>
        <Progress value={progress} className="h-2 bg-white/10" />
        <p className="text-[9px] text-center text-muted-foreground italic uppercase">
          Earn {xpToNextLevel} more XP to reach Level {user.level + 1}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Award} label="Ads Watched" value={user.adsWatched} />
        <StatCard icon={Clock} label="Days Active" value="4" />
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest opacity-50">Achievements</h4>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          <AchievementBadge title="First Harvest" icon={Zap} active />
          <AchievementBadge title="Ad King" icon={Share2} active={user.adsWatched >= 20} />
          <AchievementBadge title="VIP Member" icon={User} active={user.tier === "God Elite"} />
          <AchievementBadge title="Crypto Whale" icon={Award} active={user.usdt > 100} />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: any }) => (
  <Card className="glass-morphism p-4 flex flex-col items-center gap-1 border-white/5">
    <Icon className="w-5 h-5 text-primary mb-1" />
    <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
    <p className="text-lg font-black">{value}</p>
  </Card>
);

const AchievementBadge = ({ title, icon: Icon, active }: { title: string, icon: any, active?: boolean }) => (
  <div className={`min-w-[80px] flex flex-col items-center gap-2 opacity-${active ? '100' : '20'}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${active ? 'border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(163,92,255,0.2)]' : 'border-white/10'}`}>
      <Icon className={`w-6 h-6 ${active ? 'text-primary' : 'text-white/20'}`} />
    </div>
    <span className="text-[9px] font-bold uppercase tracking-tighter text-center whitespace-nowrap">{title}</span>
  </div>
);
