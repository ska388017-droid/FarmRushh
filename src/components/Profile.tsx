
"use client";

import React from "react";
import { useGame } from "@/lib/game-store";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, ShieldCheck, Zap, Settings, Share2, Award, Clock, Copy, Fingerprint } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

export const Profile = () => {
  const { user } = useGame();
  const xpToNextLevel = 1000 - (user.xp % 1000);
  const progress = (user.xp % 1000) / 10;

  const copyUid = () => {
    navigator.clipboard.writeText(user.uid);
    toast({ title: "UID Copied", description: "Your unique ID has been copied to clipboard." });
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary">OPERATOR</h2>
        <div className="flex items-center gap-4">
           <Badge variant="outline" className="border-secondary/30 text-secondary bg-secondary/5 text-[9px] px-2 py-0.5">VERIFIED</Badge>
           <Settings className="w-5 h-5 text-muted-foreground hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>

      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse blur-xl" />
          <div className="relative p-[3px] bg-gradient-to-tr from-primary via-secondary to-primary rounded-full">
            <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/200`} />
              <AvatarFallback className="bg-muted text-primary text-xl font-black">{user.username.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-[9px] px-3 font-black border-2 border-background shadow-xl uppercase tracking-tighter">
            {user.tier}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-black flex items-center justify-center gap-2">
            {user.username} <ShieldCheck className="w-5 h-5 text-primary" />
          </h3>
          <div 
            onClick={copyUid}
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/10 transition-all active:scale-95"
          >
            <Fingerprint className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{user.uid}</span>
            <Copy className="w-3 h-3 text-primary/50" />
          </div>
        </div>
      </div>

      <Card className="glass-morphism p-6 space-y-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="w-20 h-20 text-primary" />
        </div>
        <div className="flex justify-between items-end mb-1">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Progress to Level {user.level + 1}</span>
            <p className="text-xs font-black text-white">LEVEL {user.level} OPERATIVE</p>
          </div>
          <span className="text-xs font-bold text-primary">{user.xp % 1000} / 1000 XP</span>
        </div>
        <Progress value={progress} className="h-2.5 bg-white/10" />
        <p className="text-[9px] text-center text-muted-foreground italic uppercase font-medium">
          Accumulate {xpToNextLevel.toLocaleString()} more XP to advance
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Award} label="Ads Verified" value={user.adsWatched} />
        <StatCard icon={Clock} label="System Access" value="24h+" />
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Tactical Badges</h4>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          <AchievementBadge title="Early Gen" icon={Zap} active />
          <AchievementBadge title="Ad Titan" icon={Share2} active={user.adsWatched >= 20} />
          <AchievementBadge title="God Elite" icon={Award} active={user.tier === "God Elite"} />
          <AchievementBadge title="Net Positive" icon={User} active={user.coins >= 10000} />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: any }) => (
  <Card className="glass-morphism p-4 flex flex-col items-center gap-1 border-white/5 bg-gradient-to-b from-white/5 to-transparent">
    <Icon className="w-5 h-5 text-primary mb-1 opacity-70" />
    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">{label}</p>
    <p className="text-lg font-black">{value}</p>
  </Card>
);

const AchievementBadge = ({ title, icon: Icon, active }: { title: string, icon: any, active?: boolean }) => (
  <div className={`min-w-[85px] flex flex-col items-center gap-2 opacity-${active ? '100' : '20'} transition-all`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${active ? 'border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(163,92,255,0.1)]' : 'border-white/5 bg-white/5'}`}>
      <Icon className={`w-7 h-7 ${active ? 'text-primary' : 'text-white/10'}`} />
    </div>
    <span className="text-[9px] font-black uppercase tracking-tighter text-center whitespace-nowrap">{title}</span>
  </div>
);
