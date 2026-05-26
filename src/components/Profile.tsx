
"use client";

import React from "react";
import { useGame } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Zap, 
  Settings, 
  Share2, 
  Award, 
  Copy, 
  Fingerprint, 
  Crown,
  Timer
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const Profile = () => {
  const { user } = useGame();
  const progress = (user.xp % 1000) / 10;

  const copyUid = () => {
    navigator.clipboard.writeText(user.uid);
    toast({ title: "UID Copied" });
  };

  const getTimeRemaining = () => {
    if (!user.vipExpire) return null;
    const diff = user.vipExpire - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d Remaining` : "Expires Today";
  };

  const isVip = user.vip;

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary uppercase tracking-tighter">Profile</h2>
        <div className="flex items-center gap-4">
           {isVip && (
             <Badge className="bg-secondary/10 text-secondary border-secondary/20 flex items-center gap-1">
               <Crown className="w-3 h-3" /> VIP ACTIVE
             </Badge>
           )}
           <Settings className="w-5 h-5 text-muted-foreground cursor-pointer" />
        </div>
      </div>

      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className={cn("absolute inset-0 rounded-full animate-pulse blur-xl", isVip ? "bg-secondary/20" : "bg-primary/20")} />
          <div className={cn("relative p-[3px] rounded-full bg-gradient-to-tr", isVip ? "from-secondary via-white to-secondary" : "from-primary via-secondary to-primary")}>
            <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="bg-muted text-primary text-xl font-black">{user.username.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-[9px] px-3 font-black border-2 border-background shadow-xl uppercase">
            {isVip ? `${user.vipPlan} VIP` : user.tier}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-black flex items-center justify-center gap-2">
            {user.username} {isVip && <Crown className="w-5 h-5 text-secondary" />}
          </h3>
          <div onClick={copyUid} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/10">
            <Fingerprint className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">{user.uid}</span>
            <Copy className="w-3 h-3 text-primary/50" />
          </div>
        </div>
      </div>

      {isVip && (
        <Card className="glass-morphism p-5 border-secondary/30 bg-secondary/5">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
                    <Timer className="w-5 h-5 text-secondary" />
                 </div>
                 <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">Subscription Status</p>
                    <p className="text-sm font-black text-white">{getTimeRemaining()}</p>
                 </div>
              </div>
              <Badge variant="outline" className="border-secondary/20 text-secondary uppercase text-[8px] font-black">ACTIVE</Badge>
           </div>
        </Card>
      )}

      <Card className="glass-morphism p-6 space-y-4">
        <div className="flex justify-between items-end mb-1">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Ranking Protocol</span>
            <p className="text-xs font-black text-white">LEVEL {user.level} OPERATIVE</p>
          </div>
          <span className="text-xs font-bold text-primary">{user.xp % 1000} / 1000 XP</span>
        </div>
        <Progress value={progress} className="h-2.5 bg-white/10" />
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Award} label="Ads Verified" value={user.adsWatched} />
        <StatCard icon={Share2} label="Network Size" value={user.referrals.length} />
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: any }) => (
  <Card className="glass-morphism p-4 flex flex-col items-center gap-1 border-white/5 bg-gradient-to-b from-white/5 to-transparent">
    <Icon className="w-5 h-5 text-primary mb-1 opacity-70" />
    <p className="text-[9px] text-muted-foreground uppercase font-bold">{label}</p>
    <p className="text-lg font-black">{value}</p>
  </Card>
);
