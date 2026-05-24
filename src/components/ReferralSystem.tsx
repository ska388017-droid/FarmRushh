
"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Share2, Copy, Gift, Info, CheckCircle2, Clock, Trophy, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export const ReferralSystem = () => {
  const { user, claimReferralReward } = useGame();
  const botUsername = "FarmRushBot"; // Replace with actual bot username
  const referralLink = `https://t.me/${botUsername}/start?startapp=${user.referralCode}`;

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

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary uppercase">Referrals</h2>
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
            <h3 className="text-2xl font-black italic tracking-tighter">INVITE & EARN</h3>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">You Get</p>
                <p className="text-xl font-black text-primary">5,000</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Friend Gets</p>
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
              INVITE A FRIEND <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-morphism p-4 text-center space-y-1">
          <p className="text-[9px] text-muted-foreground uppercase font-bold">Total Referrals</p>
          <p className="text-xl font-black">{user.referrals.length}</p>
        </Card>
        <Card className="glass-morphism p-4 text-center space-y-1">
          <p className="text-[9px] text-muted-foreground uppercase font-bold">Total Earned</p>
          <p className="text-xl font-black text-primary">{user.referralEarnings.toLocaleString()}</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1 flex items-center gap-2">
          <Info className="w-3 h-3" /> Requirements for Reward
        </h4>
        <div className="glass-morphism p-4 rounded-xl text-[10px] space-y-2 text-muted-foreground italic">
           <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-secondary" />
              <span>Friend must watch at least 5 ads</span>
           </div>
           <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-secondary" />
              <span>Friend must be active for 24 hours</span>
           </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Friend Status</h4>
        {user.referrals.length === 0 ? (
          <div className="text-center py-10 glass-morphism rounded-2xl border-dashed border-white/5">
             <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-20" />
             <p className="text-xs text-muted-foreground">No referrals yet. Start inviting!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {user.referrals.map((ref) => {
              const adsProgress = Math.min(100, (ref.adsWatched / 5) * 100);
              const isEligible = ref.adsWatched >= 5 && (Date.now() - ref.joinedAt > 24 * 60 * 60 * 1000);
              
              return (
                <Card key={ref.uid} className="glass-morphism p-4 border-white/5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-bold text-white">{ref.username}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">Joined: {new Date(ref.joinedAt).toLocaleDateString()}</p>
                    </div>
                    {ref.isRewarded ? (
                       <Badge className="bg-secondary/20 text-secondary border-none text-[9px]">REWARDED</Badge>
                    ) : isEligible ? (
                       <Button size="sm" onClick={() => claimReferralReward(ref.uid)} className="h-7 text-[9px] bg-secondary hover:bg-secondary/80 font-bold px-3">
                         CLAIM 5K
                       </Button>
                    ) : (
                       <Badge variant="outline" className="border-white/10 text-muted-foreground text-[9px]">PENDING</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-bold uppercase">
                      <span>Ads Progress</span>
                      <span>{ref.adsWatched}/5</span>
                    </div>
                    <Progress value={adsProgress} className="h-1 bg-white/5" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1 flex items-center gap-2">
          <Trophy className="w-3 h-3 text-secondary" /> Top Inviters
        </h4>
        <div className="glass-morphism rounded-xl overflow-hidden">
           {[
             { name: "CryptoKing", count: 1450, reward: "500K" },
             { name: "NeonFarmer", count: 890, reward: "250K" },
             { name: "CyberWhale", count: 420, reward: "100K" }
           ].map((leader, i) => (
             <div key={i} className="flex justify-between items-center p-3 border-b border-white/5 last:border-0">
               <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary w-4">{i + 1}</span>
                  <span className="text-xs font-medium">{leader.name}</span>
               </div>
               <div className="text-right">
                  <p className="text-xs font-black">{leader.count}</p>
                  <p className="text-[8px] text-secondary font-bold">+{leader.reward}</p>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
