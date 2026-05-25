
"use client";

import React, { useState, useMemo } from "react";
import { useGame, VIPPlan } from "@/lib/game-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  ArrowUpRight, 
  ShieldAlert, 
  History, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Gem, 
  Copy, 
  ChevronRight,
  Crown,
  Zap,
  Check,
  ShieldCheck,
  Fingerprint,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const WITHDRAWAL_TIERS = [
  { usdt: 0.5, coins: 100000, label: "Starter" },
  { usdt: 1.0, coins: 200000, label: "Common" },
  { usdt: 2.0, coins: 400000, label: "Rare" },
  { usdt: 5.0, coins: 1000000, label: "Epic" },
  { usdt: 10.0, coins: 2000000, label: "Legendary" },
  { usdt: 50.0, coins: 10000000, label: "God Mode" },
];

const VIP_PLANS = [
  { id: "Silver", name: "Silver Operative", price: 5, duration: 30, color: "from-slate-400 to-slate-600", perks: ["+20% Passive Income", "+50% Tap Power", "+1 Energy Regen/15m"] },
  { id: "Gold", name: "Gold Commander", price: 15, duration: 30, color: "from-amber-400 to-amber-600", perks: ["+50% Passive Income", "+100% Tap Power", "Max Energy 50", "Priority Payouts"] },
  { id: "Diamond", name: "Diamond Legend", price: 35, duration: 30, color: "from-cyan-400 to-cyan-600", perks: ["+100% Passive Income", "+200% Tap Power", "+2 Energy Refill/Ad", "Exclusive Badge"] },
];

const MASTER_WALLET = "0x2681177e890832135417EB61c10003AC3F8F22f5";

export const WalletSystem = () => {
  const { user, registerWithdrawal, submitVIPRequest } = useGame();
  const db = useFirestore();
  const [address, setAddress] = useState("");
  const [selectedTier, setSelectedTier] = useState<typeof WITHDRAWAL_TIERS[0] | null>(null);
  const [activeTab, setActiveTab] = useState("withdraw");

  // VIP Payment States
  const [selectedVIP, setSelectedVIP] = useState<any>(null);
  const [txHash, setTxHash] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const coins = user?.wallet?.coins || 0;
  const historyQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "withdrawals"), where("uid", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
  }, [db, user?.uid]);

  const { data: history, loading: historyLoading } = useCollection(historyQuery);

  const handleWithdraw = (network: string) => {
    if (!selectedTier || !address.trim()) {
      toast({ title: "Validation Error", description: "Select a tier and enter an address.", variant: "destructive" });
      return;
    }
    if (coins < selectedTier.coins) {
      toast({ title: "Insufficient Coins", variant: "destructive" });
      return;
    }
    registerWithdrawal(network, address, selectedTier.coins, selectedTier.usdt);
    toast({ title: "Success", description: "Withdrawal request submitted for review." });
    setAddress("");
    setSelectedTier(null);
  };

  const handleVIPPayment = async () => {
    if (!txHash.trim()) {
      toast({ title: "Missing TX Hash", variant: "destructive" });
      return;
    }
    const success = await submitVIPRequest(selectedVIP.id as VIPPlan, txHash, selectedVIP.price);
    if (success) {
      toast({ title: "Request Submitted", description: "Our team will verify your payment within 24 hours." });
      setTxHash("");
      setSelectedVIP(null);
      setIsPaying(false);
    }
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(MASTER_WALLET);
    toast({ title: "Copied!", description: "Wallet address copied to clipboard." });
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary uppercase tracking-tighter">Financial Hub</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white/5 rounded-xl p-1 h-9">
          <TabsList className="grid grid-cols-2 w-40 h-full p-0">
            <TabsTrigger value="withdraw" className="text-[10px] font-black uppercase">Withdraw</TabsTrigger>
            <TabsTrigger value="vip" className="text-[10px] font-black uppercase">Store</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "withdraw" ? (
        <div className="space-y-6">
          <Card className="glass-morphism border-primary/30 p-6 relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Available Balance</p>
                  <div className="text-4xl font-black text-white flex items-center gap-2">
                    {Math.floor(coins).toLocaleString()}
                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase">Coins</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
             </div>
             <div className="flex justify-between text-xs font-bold text-white/50 border-t border-white/5 pt-4">
                <span>Value: {(coins / 200000).toFixed(4)} USDT</span>
                <span className="text-secondary">Rate: 200k = 1.0 USDT</span>
             </div>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            {WITHDRAWAL_TIERS.map((tier) => (
              <button
                key={tier.usdt}
                onClick={() => setSelectedTier(tier)}
                className={cn(
                  "relative p-4 rounded-2xl border transition-all text-left",
                  selectedTier?.usdt === tier.usdt ? "bg-primary/20 border-primary" : "bg-white/5 border-white/10"
                )}
              >
                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">{tier.label}</p>
                <p className="text-lg font-black text-white">{tier.usdt} USDT</p>
                <p className="text-[9px] text-muted-foreground">{tier.coins.toLocaleString()} Coins</p>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Tabs defaultValue="ton" className="w-full">
              <TabsList className="grid grid-cols-2 w-full bg-white/5 p-1 h-11 border border-white/5">
                <TabsTrigger value="ton" className="text-[10px] font-bold">TON USDT</TabsTrigger>
                <TabsTrigger value="bnb" className="text-[10px] font-bold">BNB USDT (BEP20)</TabsTrigger>
              </TabsList>
              <div className="mt-4 glass-morphism p-4 rounded-2xl border-white/5 bg-gradient-to-br from-white/5 to-transparent space-y-4">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Network Destination</p>
                   <Input 
                      placeholder="Enter Wallet Address..." 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-black/20 border-white/10 rounded-xl h-12 text-sm font-mono text-primary"
                   />
                </div>
                <Button onClick={() => handleWithdraw("Crypto")} className="w-full bg-primary h-12 font-black rounded-xl">
                  REQUEST WITHDRAWAL <ArrowUpRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Tabs>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-1">
              <History className="w-3 h-3" /> Recent Activity
            </h3>
            {historyLoading ? (
              <div className="text-center py-6 text-xs text-muted-foreground animate-pulse">Syncing Blockchain...</div>
            ) : history && history.length > 0 ? (
              history.map((req: any, i: number) => (
                <Card key={i} className="glass-morphism p-4 border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-white">{req.usdtAmount?.toFixed(1)} USDT</p>
                    <p className="text-[9px] text-muted-foreground font-mono truncate max-w-[120px]">{req.address}</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 text-[9px] font-black uppercase",
                    req.status === "paid" ? "text-secondary" : req.status === "pending" ? "text-primary" : "text-destructive"
                  )}>
                    {req.status === "paid" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {req.status}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 glass-morphism rounded-2xl border-dashed border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase font-black">No Transaction Records</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="glass-morphism border-secondary/30 p-6 bg-gradient-to-br from-secondary/10 to-transparent">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
                   <Crown className="w-6 h-6 text-secondary" />
                </div>
                <div>
                   <h3 className="text-lg font-black text-white uppercase tracking-tighter">VIP Command Center</h3>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Manual Crypto Verification (BEP20)</p>
                </div>
             </div>
          </Card>

          <div className="space-y-4">
            {VIP_PLANS.map((plan) => (
              <Card key={plan.id} className="glass-morphism border-white/5 overflow-hidden group">
                <div className={cn("h-1.5 w-full bg-gradient-to-r", plan.color)} />
                <div className="p-5 flex justify-between items-center">
                   <div className="space-y-3">
                      <div>
                         <p className="text-sm font-black text-white">{plan.name}</p>
                         <p className="text-[10px] text-secondary font-black uppercase">{plan.price} USDT / 30 Days</p>
                      </div>
                      <div className="space-y-1">
                        {plan.perks.map((p: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Check className="w-3 h-3 text-secondary" /> {p}
                          </div>
                        ))}
                      </div>
                   </div>
                   <Dialog>
                      <DialogTrigger asChild>
                         <Button onClick={() => setSelectedVIP(plan)} className="bg-white/5 border border-white/10 hover:bg-secondary hover:text-secondary-foreground font-black text-[10px] h-10 px-6 rounded-xl transition-all">
                           PURCHASE
                         </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[340px] rounded-3xl glass-morphism border-primary/30 p-0 overflow-hidden bg-background">
                        <div className="p-6 space-y-6">
                           <div className="text-center space-y-2">
                              <DialogTitle className="text-xl font-black text-white uppercase italic tracking-tighter">Initiate Payment</DialogTitle>
                              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Only BEP20 (BNB Smart Chain) Supported</p>
                           </div>

                           <div className="bg-black/40 p-6 rounded-2xl border border-white/5 flex flex-col items-center space-y-4">
                              <div className="w-32 h-32 bg-white rounded-xl p-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${MASTER_WALLET}`} alt="QR Code" className="w-full h-full" />
                              </div>
                              <div className="text-center space-y-1 w-full">
                                 <p className="text-[8px] text-muted-foreground uppercase font-black">Destination Address</p>
                                 <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                                    <code className="text-[9px] text-primary truncate flex-1 font-mono">{MASTER_WALLET}</code>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copyWallet}>
                                       <Copy className="w-3 h-3" />
                                    </Button>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
                                 <p className="text-center text-[11px] font-black text-secondary uppercase">SEND EXACTLY {plan.price}.0 USDT</p>
                              </div>
                              <div className="space-y-2">
                                 <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest px-1">Transaction Hash (TXID)</p>
                                 <Input 
                                    placeholder="Paste TX Hash here..." 
                                    value={txHash}
                                    onChange={(e) => setTxHash(e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-xl font-mono text-[10px]"
                                 />
                              </div>
                              <Button onClick={handleVIPPayment} className="w-full bg-primary h-12 font-black rounded-xl">
                                 I HAVE PAID
                              </Button>
                           </div>
                        </div>
                      </DialogContent>
                   </Dialog>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
