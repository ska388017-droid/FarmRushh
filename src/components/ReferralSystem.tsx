
"use client";

import React from "react";
import { useGame } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Share2, 
  Copy, 
  Gift, 
  Info, 
  CheckCircle2, 
  Trophy, 
  ArrowRight, 
  Timer, 
  Instagram, 
  Send, 
  PlayCircle, 
  Crown,
  Star,
  Zap,
  Lock,
  Diamond,
  TrendingUp
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const ReferralSystem = () => {
  const { user, claimReferralReward, claimReferralMilestone } = useGame();
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

  const verifiedReferrals = user.referrals.filter(r => {
    const { tgJoined, igFollowed, adsWatched } = r.tasks;
    return tgJoined && igFollowed && adsWatched >= 5;
  }).length;

  const pendingReferrals = user.referrals.length - verifiedReferrals;

  const milestones = [
    { id: "ref_3", target: 3, reward: 5000, label: "NETWORKER" },
    { id: "ref_5", target: 5, reward: 10000, label: "CONNECTOR" },
    { id: "ref_10", target: 10, reward: 25000, label: "INFLUENCER" },
    { id: "ref_25", target: 25, reward: 75000, label: "AMBASSADOR" },
    { id: "ref_50", target: 50, reward: 200000, label: "TYCOON" },
    { id: "ref_100", target: 100, reward: 1000000, label: "LEGEND" },
  ];

  const leaderboard = [
    { name: "CryptoWhale", referrals: 124, coins: "620,000", avatar: "https://picsum.photos/seed/l1/100" },
    { name: "NeonFarmer", referrals: 89, coins: "445,000", avatar: "https://picsum.photos/seed/l2/100" },
    { name: "CyberKing", referrals: 56, coins: "280,000", avatar: "https://picsum.photos/seed/l3/100" },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary uppercase tracking-tighter">Network</h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 font-black">
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
                <div className="flex items-center justify-center gap-1.5">
                   <p className="text-2xl font-black text-primary">5,000</p>
                   <Diamond className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Friend gets</p>
                <div className="flex items-center justify-center gap-1.5">
                   <p className="text-2xl font-black text-secondary">2,000</p>
                   <Diamond className="w-5 h-5 text-secondary" />
                </div>
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
        <StatsBox label="Verified" value={verifiedReferrals} />
        <StatsBox label="Pending" value={pendingReferrals} />
        <StatsBox label="Earnings" value={user.referralEarnings} isCoins />
      </div>

      {/* Referral Milestones Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <Trophy className="w-3 h-3 text-primary" /> Referral Milestones
          </h3>
          <span className="text-[8px] font-black text-secondary uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">
            {verifiedReferrals} Verified
          </span>
        </div>
        
        <div className="space-y-3">
          {milestones.map((m) => {
            const isClaimed = user.claimedReferralMilestones?.includes(m.id);
            const progress = Math.min(100, (verifiedReferrals / m.target) * 100);
            const canClaim = verifiedReferrals >= m.target && !isClaimed;

            return (
              <Card key={m.id} className={cn(
                "glass-morphism p-5 border-white/5 relative overflow-hidden transition-all duration-500",
                canClaim ? "border-primary/50 bg-primary/10 shadow-[0_0_25px_rgba(163,92,255,0.2)]" : "opacity-80"
              )}>
                {/* Visual Glow */}
                <div className={cn(
                  "absolute -right-10 -top-10 w-32 h-32 blur-3xl rounded-full opacity-10 transition-colors",
                  canClaim ? "bg-primary" : "bg-white/10"
                )} />

                <div className="flex flex-col space-y-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className={cn(
                        "text-lg font-black tracking-tighter uppercase italic",
                        canClaim ? "text-primary drop-shadow-[0_0_8px_rgba(163,92,255,0.5)]" : "text-white"
                      )}>
                        {m.label}
                      </h4>
                      <div className="flex items-center gap-1.5">
                         <Users className="w-3 h-3 text-muted-foreground" />
                         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                           {m.target} Verified Friends
                         </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                       <div className="flex items-center justify-end gap-1.5">
                          <span className={cn(
                            "text-xl font-black italic",
                            canClaim ? "neon-text-secondary" : "text-white"
                          )}>
                            +{m.reward.toLocaleString()}
                          </span>
                          <Diamond className={cn("w-4 h-4", canClaim ? "text-secondary" : "text-primary")} />
                       </div>
                       <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">BOUNTY REWARD</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className={verifiedReferrals >= m.target ? "text-secondary font-black" : "text-muted-foreground"}>
                        {verifiedReferrals >= m.target ? "GOAL REACHED" : `PROGRESS: ${verifiedReferrals} / ${m.target}`}
                      </span>
                      <span className="text-muted-foreground">{Math.floor(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/5" />
                  </div>

                  {isClaimed ? (
                    <div className="flex items-center justify-center gap-2 py-2.5 bg-secondary/10 border border-secondary/20 rounded-xl">
                       <CheckCircle2 className="w-4 h-4 text-secondary" />
                       <span className="text-[10px] font-black text-secondary uppercase tracking-widest">REWARD SECURED</span>
                    </div>
                  ) : (
                    <Button 
                      disabled={!canClaim}
                      onClick={() => {
                        claimReferralMilestone(m.id, m.reward);
                        toast({ title: "Milestone Claimed!", description: `+${m.reward.toLocaleString()} Coins added to wallet!` });
                      }}
                      className={cn(
                        "w-full h-11 font-black text-xs uppercase tracking-[0.2em] transition-all duration-300",
                        canClaim 
                          ? "bg-secondary text-secondary-foreground shadow-[0_0_20px_rgba(57,255,20,0.5)] hover:scale-[1.02] border-none" 
                          : "bg-white/5 text-muted-foreground border border-white/10 cursor-not-allowed"
                      )}
                    >
                      {canClaim ? "CLAIM BOUNTY" : `LOCKED: ${m.target - verifiedReferrals} MORE FRIENDS`}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1 flex items-center gap-2">
          <Crown className="w-3 h-3 text-secondary" /> Network Leaders
        </h4>
        <div className="space-y-2">
          {leaderboard.map((item, idx) => (
            <div key={idx} className="glass-morphism p-3 rounded-xl flex items-center justify-between border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-muted-foreground w-4">{idx + 1}.</span>
                <Avatar className="w-8 h-8 border border-white/10">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback className="text-[8px]">{item.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-white">{item.name}</p>
                  <p className="text-[8px] text-muted-foreground uppercase">{item.referrals} Invites</p>
                </div>
              </div>
              <p className="text-[10px] font-black text-primary">+{item.coins}</p>
            </div>
          ))}
        </div>
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white tracking-tight">{ref.username}</p>
                        {isEligible && <Badge className="bg-secondary/10 text-secondary border-none text-[8px] font-black px-1.5 h-4 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED</Badge>}
                      </div>
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
