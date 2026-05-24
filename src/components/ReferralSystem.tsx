
"use client";

import React from "react";
import { useGame } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Share2, Copy, Gift, Info, CheckCircle2, Trophy, ArrowRight, Timer, Instagram, Send, PlayCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export const ReferralSystem = () => {
  const { user, claimReferralReward } = useGame();
  const botUsername = "CashNova262_bot"; 
  const referralLink = `https://t.me/${botUsername}?start=${user.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Link Copied!", description: "Share it with your friends to earn rewards." });
  };

  const shareLink = () => {
    const text = encodeURIComponent(`🚀 Join FarmRush and start earning CyberCoins! Use my code to get 2000 coins bonus! 💎\n\n${referralLink}`);
    const tgLink = `https://t.me/share/url?url=${text}`;
    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.openTelegramLink(tgLink);
    } else {
      window.open(tgLink, "_blank");
    }
  };

  const activeReferrals = user.referrals.filter(r => r.isRewarded).length;
  const pendingReferrals = user.referrals.filter(r => !r.isRewarded).length;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary uppercase tracking-tighter">Network</h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
          <Gift className="w-3 h-3 mr-1" /> REWARDS ACTIVE
        </Badge>
      </div>

      <Card className="glass-morphism border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Share2 className="w-20 h-20 text-primary" />
        </div>
        
        <div className="space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Invite & Earn</h3>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Inviter gets</p>
                <p className="text-xl font-black text-primary">5,000</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Friend gets</p>
                <p className="text-xl font-black text-secondary">2,000</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
               <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-muted-foreground truncate flex items-center">
                 {user.referralCode}
               </div>
               <Button onClick={copyLink} variant="outline" className="border-white/10 hover:bg-white/10 p-3 h-auto">
                 <Copy className="w-4 h-4" />
               </Button>
            </div>
            <Button onClick={shareLink} className="w-full bg-primary hover:bg-primary/80 font-black h-12 rounded-xl shadow-[0_0_20px_rgba(163,92,255,0.3)]">
              SHARE ON TELEGRAM <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatsBox label="Active" value={activeReferrals} />
        <StatsBox label="Pending" value={pendingReferrals} />
        <StatsBox label="Earnings" value={user.referralEarnings} isCoins />
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1 flex items-center gap-2">
          <Info className="w-3 h-3" /> Reward Requirements
        </h4>
        <div className="glass-morphism p-4 rounded-xl text-[10px] space-y-3 text-muted-foreground font-medium">
           <ConditionItem icon={Send} text="Join Telegram Channel" />
           <ConditionItem icon={Instagram} text="Follow Instagram Page" />
           <ConditionItem icon={PlayCircle} text="Watch 5 Rewarded Ads" />
           <ConditionItem icon={Timer} text="24h Anti-Abuse Cooldown" />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Referral History</h4>
        {user.referrals.length === 0 ? (
          <div className="text-center py-10 glass-morphism rounded-2xl border-dashed border-white/5">
             <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-20" />
             <p className="text-xs text-muted-foreground italic">No connections yet. Expand your network!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {user.referrals.map((ref) => {
              const { tgJoined, igFollowed, adsWatched } = ref.tasks;
              const adsProgress = Math.min(100, (adsWatched / 5) * 100);
              const isEligible = tgJoined && igFollowed && adsWatched >= 5;
              
              return (
                <Card key={ref.uid} className="glass-morphism p-4 border-white/5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-bold text-white tracking-tight">{ref.username}</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-mono">{ref.uid}</p>
                    </div>
                    {ref.isRewarded ? (
                       <Badge className="bg-secondary/20 text-secondary border-none text-[9px] px-2 font-black">REWARDED</Badge>
                    ) : isEligible ? (
                       <Button size="sm" onClick={() => claimReferralReward(ref.uid)} className="h-7 text-[9px] bg-secondary hover:bg-secondary/80 font-black px-3 rounded-lg shadow-lg">
                         CLAIM 5K
                       </Button>
                    ) : (
                       <Badge variant="outline" className="border-white/10 text-muted-foreground text-[9px] px-2 font-bold">IN PROGRESS</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <ProgressIcon active={tgJoined} icon={Send} label="TG" />
                    <ProgressIcon active={igFollowed} icon={Instagram} label="IG" />
                    <ProgressIcon active={adsWatched >= 5} icon={PlayCircle} label="ADS" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                      <span>Ads Progress</span>
                      <span className={adsWatched >= 5 ? "text-secondary" : "text-primary"}>{adsWatched}/5</span>
                    </div>
                    <Progress value={adsProgress} className="h-1 bg-white/5" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const StatsBox = ({ label, value, isCoins }: { label: string, value: any, isCoins?: boolean }) => (
  <Card className="glass-morphism p-3 text-center space-y-1 border-white/5 bg-white/2">
    <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">{label}</p>
    <p className={`text-sm font-black tracking-tight ${isCoins ? 'text-primary' : 'text-white'}`}>
      {isCoins ? value.toLocaleString() : value}
    </p>
  </Card>
);

const ConditionItem = ({ icon: Icon, text }: { icon: any, text: string }) => (
  <div className="flex items-center gap-2">
    <CheckCircle2 className="w-3 h-3 text-secondary" />
    <Icon className="w-3 h-3 opacity-50" />
    <span className="tracking-tight">{text}</span>
  </div>
);

const ProgressIcon = ({ active, icon: Icon, label }: { active: boolean, icon: any, label: string }) => (
  <div className={`flex items-center justify-center gap-1.5 py-1 rounded-md border ${active ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-white/5 border-white/5 text-muted-foreground opacity-40'}`}>
    <Icon className="w-3 h-3" />
    <span className="text-[8px] font-black">{label}</span>
  </div>
);
