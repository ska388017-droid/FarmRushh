
"use client";

import React, { useState } from "react";
import { useGame, VIPPlan } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Zap, 
  Check, 
  Copy, 
  ShieldCheck, 
  Timer, 
  TrendingUp, 
  Diamond,
  Fingerprint,
  Info,
  ExternalLink,
  ChevronRight,
  Flame,
  Star,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const MASTER_WALLET = "0x2681177e890832135417EB61c10003AC3F8F22f5";

const VIP_PLANS = [
  { 
    id: "Silver", 
    name: "Silver Operative", 
    price: 5, 
    duration: 30, 
    color: "from-slate-400 to-slate-600",
    glow: "rgba(148, 163, 184, 0.3)",
    roi: "Earn ~$10+ in 30 days",
    perks: [
      "+150% Tap Power",
      "+150% Passive Income",
      "2,500 Max Energy",
      "Daily Reward: 15,000 Coins",
      "Priority Payout Review",
      "Silver Profile Badge"
    ] 
  },
  { 
    id: "Gold", 
    name: "Gold Commander", 
    price: 15, 
    duration: 30, 
    color: "from-amber-400 to-amber-600",
    glow: "rgba(245, 158, 11, 0.4)",
    roi: "Earn ~$35+ in 30 days",
    perks: [
      "+350% Tap Power",
      "+300% Passive Income",
      "5,000 Max Energy",
      "Daily Reward: 40,000 Coins",
      "Instant Payout Review",
      "Gold Profile Badge"
    ] 
  },
  { 
    id: "Diamond", 
    name: "Diamond Legend", 
    price: 35, 
    duration: 30, 
    color: "from-cyan-400 to-cyan-600",
    glow: "rgba(34, 211, 238, 0.5)",
    roi: "Earn ~$100+ in 30 days",
    perks: [
      "+900% Tap Power",
      "+700% Passive Income",
      "10,000 Max Energy",
      "Daily Reward: 100,000 Coins",
      "Exclusive Boss Drops",
      "Diamond Profile Badge"
    ] 
  },
];

export const VIPCenter = () => {
  const { user, submitVIPRequest, claimDailyReward } = useGame();
  const [selectedVIP, setSelectedVIP] = useState<any>(null);
  const [txHash, setTxHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isVip = user.vipStatus !== "none";

  const handleVIPPayment = async () => {
    if (!txHash.trim()) {
      toast({ title: "Missing TX Hash", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const success = await submitVIPRequest(selectedVIP.id as VIPPlan, txHash, selectedVIP.price);
    setIsSubmitting(false);
    if (success) {
      toast({ title: "Request Submitted", description: "Payment verification in progress (24h)." });
      setTxHash("");
      setSelectedVIP(null);
    }
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(MASTER_WALLET);
    toast({ title: "Copied!", description: "Wallet address copied to clipboard." });
  };

  const getTimeRemaining = () => {
    if (!user.vipExpiry) return null;
    const diff = user.vipExpiry - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} Days Remaining` : "Expires Today";
  };

  return (
    <div className="space-y-6 pb-24">
      {/* VIP Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-center glass-morphism border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-background">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 mb-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse">
            <Crown className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            VIP CENTER
          </h2>
          <p className="text-[10px] text-amber-500/70 font-black uppercase tracking-[0.3em]">
            Investment Mining Protocol
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
          <Gift className="w-3 h-3 text-secondary" /> Daily Operative Reward
        </h3>
        <Card className="glass-morphism p-5 border-secondary/30 bg-secondary/5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase font-black">Ready for Collection</p>
              <p className="text-sm font-black text-white">Daily VIP Bonus Available</p>
            </div>
            <Button onClick={claimDailyReward} size="sm" className="bg-secondary text-secondary-foreground font-black text-[10px] rounded-xl px-4">
              CLAIM NOW
            </Button>
          </div>
        </Card>
      </div>

      {isVip && (
        <Card className="glass-morphism p-5 border-amber-500/30 bg-amber-500/5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <Timer className="w-5 h-5 text-amber-500" />
               </div>
               <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-black">Subscription Active</p>
                  <p className="text-sm font-black text-white">{user.vipStatus} — {getTimeRemaining()}</p>
               </div>
            </div>
            <Badge className="bg-amber-500/20 text-amber-500 border-none uppercase text-[8px] font-black px-2">LIVE</Badge>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
          <Star className="w-3 h-3 text-amber-500" /> Available Operations
        </h3>
        {VIP_PLANS.map((plan) => (
          <Card key={plan.id} className={cn(
            "glass-morphism border-white/5 overflow-hidden transition-all duration-500 hover:border-white/20",
            user.vipStatus === plan.id ? "ring-2 ring-amber-500/50" : ""
          )}>
            <div className={cn("h-1.5 w-full bg-gradient-to-r", plan.color)} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{plan.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest">{plan.price} USDT / 30 DAYS</p>
                    <Badge variant="outline" className="text-[8px] border-secondary/20 text-secondary uppercase px-1 h-4">
                      {plan.roi}
                    </Badge>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Crown className={cn("w-5 h-5", plan.id === 'Diamond' ? 'text-cyan-400' : plan.id === 'Gold' ? 'text-amber-400' : 'text-slate-400')} />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {plan.perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Check className="w-3 h-3 text-secondary shrink-0" />
                    <span className="text-muted-foreground font-medium">{perk}</span>
                  </div>
                ))}
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setSelectedVIP(plan)}
                    className={cn(
                      "w-full h-12 font-black uppercase tracking-widest rounded-xl transition-all",
                      user.vipStatus === plan.id 
                        ? "bg-secondary/20 text-secondary border border-secondary/30 cursor-not-allowed"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    )}
                    disabled={user.vipStatus === plan.id}
                  >
                    {user.vipStatus === plan.id ? "ACTIVE PLAN" : "BUY VIP"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[340px] rounded-3xl glass-morphism border-amber-500/30 p-0 overflow-hidden bg-background">
                  <div className="p-6 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                         <Crown className="w-6 h-6 text-amber-500" />
                      </div>
                      <DialogTitle className="text-xl font-black text-white uppercase italic tracking-tighter">Initiate Payment</DialogTitle>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">BNB Smart Chain (BEP20) USDT Only</p>
                    </div>

                    <div className="bg-black/40 p-6 rounded-2xl border border-white/5 flex flex-col items-center space-y-4">
                      <div className="w-32 h-32 bg-white rounded-xl p-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${MASTER_WALLET}`} alt="QR Code" className="w-full h-full" />
                      </div>
                      <div className="text-center space-y-1 w-full">
                        <p className="text-[8px] text-muted-foreground uppercase font-black">Destination Wallet</p>
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                          <code className="text-[9px] text-amber-500 truncate flex-1 font-mono">{MASTER_WALLET}</code>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copyWallet}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                        <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest">SEND EXACTLY {plan.price}.0 USDT</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                           <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Transaction Hash (TXID)</p>
                           <p className="text-[8px] text-amber-500 font-black uppercase">BEP20 Network</p>
                        </div>
                        <Input 
                          placeholder="Paste Hash (0x...)" 
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                          className="bg-white/5 border-white/10 rounded-xl font-mono text-[10px] h-11"
                        />
                      </div>

                      <Button 
                        onClick={handleVIPPayment}
                        disabled={isSubmitting || !txHash}
                        className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase rounded-xl shadow-lg shadow-amber-500/20"
                      >
                        {isSubmitting ? "VERIFYING..." : "I HAVE PAID"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        ))}
      </div>

      <Card className="glass-morphism p-5 border-white/5 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-center gap-3 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Earning Protocol</h4>
        </div>
        <div className="space-y-2 text-[9px] text-muted-foreground font-medium leading-relaxed">
          <p>• VIP members enjoy significantly higher mining power and passive income yields.</p>
          <p>• Daily Rewards are unlocked exclusively for active operatives.</p>
          <p>• Total earning potential is designed to exceed the investment cost through consistent activity.</p>
        </div>
      </Card>
    </div>
  );
};
