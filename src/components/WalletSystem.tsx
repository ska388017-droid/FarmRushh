
"use client";

import React, { useState, useMemo } from "react";
import { useGame } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  Clock, 
  CheckCircle2, 
  Gem, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  Crown,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const WITHDRAWAL_TIERS = [
  { usdt: 0.5, coins: 100000, label: "Starter" },
  { usdt: 1.0, coins: 200000, label: "Common" },
  { usdt: 2.0, coins: 400000, label: "Rare" },
  { usdt: 5.0, coins: 1000000, label: "Epic" },
  { usdt: 10.0, coins: 2000000, label: "Legendary" },
  { usdt: 50.0, coins: 10000000, label: "God Mode" },
];

export const WalletSystem = () => {
  const { user, registerWithdrawal } = useGame();
  const db = useFirestore();
  const [address, setAddress] = useState("");
  const [selectedTier, setSelectedTier] = useState<typeof WITHDRAWAL_TIERS[0] | null>(null);

  const coins = user?.wallet?.coins || 0;
  const historyQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "withdrawals"), where("uid", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
  }, [db, user?.uid]);

  const { data: history, loading: historyLoading } = useCollection(historyQuery);

  const handleWithdraw = (network: string) => {
    if (user.level < 5) {
      toast({ title: "Locked", description: "Reach Level 5 to unlock withdrawals.", variant: "destructive" });
      return;
    }
    if (user.adsWatched < 50) {
      toast({ title: "Ineligible", description: "Watch at least 50 ads to verify identity.", variant: "destructive" });
      return;
    }
    if (!selectedTier || !address.trim()) {
      toast({ title: "Selection Required", description: "Choose a tier and enter destination address.", variant: "destructive" });
      return;
    }
    if (coins < selectedTier.coins) {
      toast({ title: "Insufficient Coins", variant: "destructive" });
      return;
    }
    
    // VIP Benefit: Higher withdrawal limit or priority review
    const isVip = user.vipStatus !== "none";
    registerWithdrawal(network, address, selectedTier.coins, selectedTier.usdt);
    toast({ 
      title: isVip ? "Priority Request Sent" : "Success", 
      description: isVip ? "VIP status grants you priority review (12-24h)." : "Withdrawal request submitted for review (24-72h)." 
    });
    setAddress("");
    setSelectedTier(null);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary uppercase tracking-tighter">Exchange</h2>
        <Badge variant="outline" className="border-secondary text-secondary text-[8px] font-black tracking-[0.2em] px-3">
          PAYOUTS ACTIVE
        </Badge>
      </div>

      <Card className="glass-morphism border-primary/30 p-6 relative overflow-hidden bg-gradient-to-br from-primary/10 to-transparent">
         <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="space-y-1">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">CyberCoin Balance</p>
              <div className="text-4xl font-black text-white flex items-center gap-2 tracking-tighter italic">
                {Math.floor(coins).toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
         </div>
         <div className="flex justify-between items-center text-[10px] font-bold border-t border-white/5 pt-4 relative z-10">
            <span className="text-white/50">Market Value: <span className="text-primary">{(coins / 200000).toFixed(4)} USDT</span></span>
            <span className="text-secondary uppercase tracking-widest">FIXED RATE: 200K = 1.0 USDT</span>
         </div>
         <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {WITHDRAWAL_TIERS.map((tier) => (
          <button
            key={tier.usdt}
            onClick={() => setSelectedTier(tier)}
            className={cn(
              "relative p-4 rounded-2xl border transition-all text-left group",
              selectedTier?.usdt === tier.usdt 
                ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(163,92,255,0.2)]" 
                : "bg-white/5 border-white/5 hover:border-white/20"
            )}
          >
            <p className={cn(
              "text-[8px] font-black uppercase mb-1",
              selectedTier?.usdt === tier.usdt ? "text-primary" : "text-muted-foreground"
            )}>{tier.label}</p>
            <div className="flex items-center gap-1.5">
               <Gem className={cn("w-3 h-3", selectedTier?.usdt === tier.usdt ? "text-primary" : "text-white/40")} />
               <p className="text-xl font-black text-white italic">{tier.usdt}<span className="text-[10px] font-bold ml-1 opacity-60">USDT</span></p>
            </div>
            <p className="text-[9px] text-muted-foreground font-medium mt-1">{tier.coins.toLocaleString()} Coins</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="glass-morphism p-5 rounded-3xl border-white/5 bg-gradient-to-b from-white/5 to-transparent space-y-5">
            <div className="space-y-3">
               <div className="flex justify-between px-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Payout Destination</p>
                  <p className="text-[8px] text-primary font-bold uppercase">BNB Smart Chain (BEP20)</p>
               </div>
               <Input 
                  placeholder="Enter Wallet Address (0x...)" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-black/40 border-white/10 rounded-xl h-12 text-xs font-mono text-primary placeholder:text-muted-foreground/30"
               />
            </div>

            <Button onClick={() => handleWithdraw("Crypto")} className="w-full bg-primary hover:bg-primary/80 h-12 font-black rounded-xl italic uppercase tracking-widest shadow-lg shadow-primary/20">
              EXECUTE WITHDRAWAL <ArrowUpRight className="ml-2 w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2 justify-center py-1 opacity-50">
               <ShieldCheck className="w-3 h-3 text-secondary" />
               <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">SECURE ESCROW PROTOCOL ACTIVE</span>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-1">
          <History className="w-3 h-3" /> Transaction Logs
        </h3>
        {historyLoading ? (
          <div className="text-center py-10 text-[10px] font-black text-primary animate-pulse uppercase">SYNCING LEDGER...</div>
        ) : history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((req: any, i: number) => (
              <Card key={i} className="glass-morphism p-4 border-white/5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center border",
                     req.status === "paid" ? "bg-secondary/10 border-secondary/20" : "bg-primary/10 border-primary/20"
                   )}>
                      {req.status === "paid" ? <CheckCircle2 className="w-5 h-5 text-secondary" /> : <Clock className="w-5 h-5 text-primary" />}
                   </div>
                   <div>
                      <p className="text-xs font-black text-white italic">{req.usdtAmount?.toFixed(1)} USDT</p>
                      <p className="text-[8px] text-muted-foreground font-mono truncate max-w-[120px]">{req.address}</p>
                   </div>
                </div>
                <div className="text-right">
                   <Badge className={cn(
                     "text-[8px] font-black uppercase px-2",
                     req.status === "paid" ? "bg-secondary text-secondary-foreground" : 
                     req.status === "pending" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
                   )}>
                     {req.status}
                   </Badge>
                   <p className="text-[7px] text-muted-foreground mt-1 uppercase font-bold">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 glass-morphism rounded-3xl border-dashed border-white/10 opacity-30">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Empty Ledger</p>
          </div>
        )}
      </div>
    </div>
  );
};
