
"use client";

import React, { useState, useMemo } from "react";
import { useGame } from "@/lib/game-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ArrowUpRight, ShieldAlert, Info, History, Clock, CheckCircle2, XCircle, Gem, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";

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
  const adsWatched = user?.adsWatched || 0;
  const tasksCompleted = user?.tasksCompleted || 0;
  const lastWithdrawalAt = user?.lastWithdrawalAt || null;
  const lastWithdrawalAmount = user?.lastWithdrawalAmount || 0;
  const userLevel = user?.level || 1;

  const historyQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "withdrawals"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
  }, [db, user?.uid]);

  const { data: history, loading: historyLoading } = useCollection(historyQuery);

  const getCooldownStatus = () => {
    if (!lastWithdrawalAt) return { ready: true, hoursLeft: 0 };
    const cooldownHours = lastWithdrawalAmount <= 2 ? 24 : lastWithdrawalAmount <= 10 ? 48 : 72;
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    const now = Date.now();
    const diff = now - lastWithdrawalAt;
    
    if (diff >= cooldownMs) return { ready: true, hoursLeft: 0 };
    return { ready: false, hoursLeft: Math.ceil((cooldownMs - diff) / (1000 * 60 * 60)) };
  };

  const handleWithdraw = (network: string) => {
    if (!selectedTier) {
      toast({ title: "Select Tier", description: "Please choose a withdrawal amount.", variant: "destructive" });
      return;
    }

    if (!address.trim()) {
      toast({ title: "Address Required", description: "Please enter your payment destination.", variant: "destructive" });
      return;
    }

    if (coins < selectedTier.coins) {
      toast({ title: "Insufficient Balance", description: `You need ${selectedTier.coins.toLocaleString()} coins for this tier.`, variant: "destructive" });
      return;
    }

    const { ready, hoursLeft } = getCooldownStatus();
    if (!ready) {
      toast({ title: "Cooldown Active", description: `You can withdraw again in ${hoursLeft} hours.`, variant: "destructive" });
      return;
    }

    if (adsWatched < 50) {
      toast({ title: "Guard Alert", description: "Watch at least 50 ads to unlock USDT payouts.", variant: "destructive" });
      return;
    }

    if (tasksCompleted < 2) {
      toast({ title: "Guard Alert", description: "Complete all social tasks to unlock withdrawals.", variant: "destructive" });
      return;
    }

    if (userLevel < 5) {
      toast({ title: "Level Too Low", description: "Reach Level 5 to start withdrawing rewards.", variant: "destructive" });
      return;
    }
    
    registerWithdrawal(network, address, selectedTier.coins, selectedTier.usdt);
    toast({ title: "Request Sent", description: `Tier ${selectedTier.label} (${selectedTier.usdt} USDT) is processing.` });
    setAddress("");
    setSelectedTier(null);
  };

  const { ready: isCooldownReady, hoursLeft } = getCooldownStatus();

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary uppercase tracking-tighter">USDT Wallet</h2>
        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 text-[10px] px-3">
          SECURE PAYOUTS
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="glass-morphism border-primary/30 shadow-[0_0_30px_rgba(163,92,255,0.1)] bg-gradient-to-br from-card/80 to-primary/5 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Available Balance</p>
                <div className="text-4xl font-black text-white flex items-center gap-2">
                  {Math.floor(coins).toLocaleString()}
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase border border-primary/20">Coins</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Standard Rate</p>
                <p className="text-sm font-black text-secondary">200k = 1.0 USDT</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Est. USDT Value</p>
                <p className="text-sm font-bold text-white/80">{(coins / 200000).toFixed(4)} USDT</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1 flex items-center gap-2">
            <Gem className="w-3 h-3 text-primary" /> Select Payout Tier
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {WITHDRAWAL_TIERS.map((tier) => (
              <button
                key={tier.usdt}
                onClick={() => setSelectedTier(tier)}
                className={cn(
                  "relative p-4 rounded-2xl border transition-all text-left group overflow-hidden",
                  selectedTier?.usdt === tier.usdt 
                    ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(163,92,255,0.3)]" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                )}
              >
                <p className={cn(
                  "text-[8px] font-black uppercase tracking-widest mb-1",
                  selectedTier?.usdt === tier.usdt ? "text-primary" : "text-muted-foreground"
                )}>{tier.label}</p>
                <p className="text-lg font-black text-white">{tier.usdt} <span className="text-[10px] text-muted-foreground font-medium">USDT</span></p>
                <p className="text-[9px] text-muted-foreground font-bold">{tier.coins.toLocaleString()} Coins</p>
                {selectedTier?.usdt === tier.usdt && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="ton" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 rounded-xl p-1 border border-white/5 h-11">
             <TabsTrigger value="ton" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-[10px]">TON</TabsTrigger>
            <TabsTrigger value="bnb" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-[10px]">BNB</TabsTrigger>
            <TabsTrigger value="upi" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-[10px]">UPI</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="ton">
              <WithdrawForm 
                title="TON Network (USDT)" 
                symbol="USDT" 
                address={address}
                setAddress={setAddress}
                onWithdraw={() => handleWithdraw("TON USDT")} 
              />
            </TabsContent>
            <TabsContent value="bnb">
              <WithdrawForm 
                title="BNB Smart Chain (USDT)" 
                symbol="USDT" 
                address={address}
                setAddress={setAddress}
                onWithdraw={() => handleWithdraw("BNB USDT")} 
              />
            </TabsContent>
            <TabsContent value="upi">
              <WithdrawForm 
                title="UPI (INR Conversion)" 
                symbol="UPI" 
                address={address}
                setAddress={setAddress}
                onWithdraw={() => handleWithdraw("UPI")} 
              />
            </TabsContent>
          </div>
        </Tabs>

        <Card className="glass-morphism border-primary/10 bg-white/5">
          <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            <CardTitle className="text-[10px] uppercase text-primary font-black tracking-widest">Protocol Guard</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              <GuardItem label="50 Ads Watched" current={adsWatched} target={50} />
              <GuardItem label="Operator Level" current={userLevel} target={5} />
              <GuardItem label="Social Tasks" current={tasksCompleted} target={2} />
              <GuardItem label="Cooldown Status" current={isCooldownReady ? "READY" : `WAIT ${hoursLeft}H`} target="READY" isSpecial />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <History className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Payout History</h3>
          </div>
          
          <div className="space-y-3">
            {historyLoading ? (
              <div className="text-center py-8 text-xs text-muted-foreground animate-pulse">Scanning blockchain...</div>
            ) : history && history.length > 0 ? (
              history.map((req: any, i: number) => (
                <Card key={i} className="glass-morphism p-4 border-white/5 flex items-center justify-between group hover:border-white/20 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-white">{req.usdtAmount?.toFixed(1) || (req.coins / 200000).toFixed(2)} USDT</p>
                      <Badge variant="outline" className="text-[8px] h-4 px-1 border-white/10 text-muted-foreground uppercase">{req.method}</Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground font-mono truncate max-w-[150px]">{req.address}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <StatusBadge status={req.status} />
                    <p className="text-[8px] text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                </Card>
              ))
            ) : (
              <div className="glass-morphism p-8 rounded-2xl border-dashed border-white/5 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold">No blockchain records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const isPaid = status === "paid" || status === "completed";
  const isPending = status === "pending";

  return (
    <div className={cn(
      "flex items-center justify-end gap-1.5 font-black text-[9px] uppercase tracking-tighter",
      isPaid ? "text-secondary" : isPending ? "text-primary" : "text-destructive"
    )}>
      {isPaid ? <CheckCircle2 className="w-3 h-3" /> : isPending ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {status}
    </div>
  );
};

const GuardItem = ({ label, current, target, isSpecial }: any) => {
  const isComplete = typeof current === 'number' ? current >= target : current === target;
  return (
    <div className="flex justify-between items-center">
      <span className={`text-[10px] font-bold uppercase ${isComplete ? 'text-secondary' : 'text-muted-foreground'}`}>{label}</span>
      <span className={`text-[10px] font-mono ${isComplete ? 'text-secondary' : 'text-primary/50'}`}>
        {isSpecial ? current : `${current.toLocaleString()}/${target.toLocaleString()}`}
      </span>
    </div>
  );
};

const WithdrawForm = ({ title, address, setAddress, onWithdraw }: any) => (
  <div className="glass-morphism p-4 rounded-2xl space-y-4 border-white/5 bg-gradient-to-br from-white/5 to-transparent">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-bold text-sm text-white">{title}</h3>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Manual audit required</p>
      </div>
      <Badge variant="outline" className="border-secondary/20 text-secondary bg-secondary/5 text-[9px]">SECURE</Badge>
    </div>
    <div className="space-y-2">
      <input 
        type="text" 
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Wallet Address / UPI ID" 
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30 font-mono text-white" 
      />
      <Button onClick={onWithdraw} className="w-full bg-primary hover:bg-primary/80 font-black group h-12 rounded-xl shadow-lg shadow-primary/10">
        EXECUTE WITHDRAWAL <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </Button>
    </div>
  </div>
);
