
"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ArrowUpRight, ShieldAlert, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export const WalletSystem = () => {
  const { user, registerWithdrawal } = useGame();
  const [address, setAddress] = useState("");

  const coins = user?.wallet?.coins || 0;
  const ton = user?.wallet?.ton || 0;
  const bnb = user?.wallet?.bnb || 0;
  const adsWatched = user?.adsWatched || 0;
  const lastWithdrawalAt = user?.lastWithdrawalAt || null;

  const handleWithdraw = (network: string) => {
    const MIN_WITHDRAW_COINS = 50000;
    const cooldownMs = 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (!address.trim()) {
      toast({ title: "Address Required", description: "Please enter your UPI ID or wallet address.", variant: "destructive" });
      return;
    }

    if (coins < MIN_WITHDRAW_COINS) {
      toast({ title: "Insufficient Balance", description: "You need at least 50,000 coins to withdraw.", variant: "destructive" });
      return;
    }

    if (lastWithdrawalAt && (now - lastWithdrawalAt < cooldownMs)) {
      const hoursLeft = Math.ceil((cooldownMs - (now - lastWithdrawalAt)) / (1000 * 60 * 60));
      toast({ title: "Cooldown Active", description: `You can withdraw again in ${hoursLeft} hours.`, variant: "destructive" });
      return;
    }

    if (adsWatched < 20) {
      toast({ title: "Guard Alert", description: "Watch at least 20 ads to unlock withdrawals.", variant: "destructive" });
      return;
    }
    
    registerWithdrawal(network, address);
    toast({ title: "Processing", description: `Withdrawal request of ₹${(coins / 1000).toFixed(2)} sent via ${network}.` });
    setAddress(""); // Reset address
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary">WALLET</h2>
        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 text-[10px] px-3">
          SECURE ESCROW
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="glass-morphism border-primary/30 shadow-[0_0_30px_rgba(163,92,255,0.1)] bg-gradient-to-br from-card/80 to-primary/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Current Balance</p>
                <div className="text-4xl font-black text-white flex items-center gap-2">
                  {Math.floor(coins).toLocaleString()}
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase">Coins</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Conversion Ratio</p>
                <p className="text-sm font-black text-secondary">1000 Coins = ₹1</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Estimated INR</p>
                <p className="text-sm font-bold text-white/80">₹{(coins / 1000).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
          <Info className="w-3 h-3 text-secondary" /> Minimum Withdrawal: 50,000 Coins (₹50)
        </div>

        <Tabs defaultValue="upi" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 rounded-xl p-1 border border-white/5 h-11">
            <TabsTrigger value="upi" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-[10px]">UPI</TabsTrigger>
            <TabsTrigger value="ton" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-[10px]">TON</TabsTrigger>
            <TabsTrigger value="bnb" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-[10px]">BNB</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="upi">
              <WithdrawForm 
                title="UPI Instant Payout" 
                subtitle="Requires valid UPI ID" 
                address={address}
                setAddress={setAddress}
                onWithdraw={() => handleWithdraw("UPI")} 
              />
            </TabsContent>
            <TabsContent value="ton">
              <WithdrawForm 
                title="TON Wallet" 
                balance={ton} 
                symbol="TON" 
                address={address}
                setAddress={setAddress}
                onWithdraw={() => handleWithdraw("TON")} 
              />
            </TabsContent>
            <TabsContent value="bnb">
              <WithdrawForm 
                title="BNB Wallet" 
                balance={bnb} 
                symbol="BNB" 
                address={address}
                setAddress={setAddress}
                onWithdraw={() => handleWithdraw("BNB Chain")} 
              />
            </TabsContent>
          </div>
        </Tabs>

        <Card className="glass-morphism border-primary/10 bg-white/5">
          <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            <CardTitle className="text-[10px] uppercase text-primary font-black tracking-widest">Eligibility Guard</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              <GuardItem label="20 Ads Watched" current={adsWatched} target={20} />
              <GuardItem label="Min. 50,000 Coins" current={Math.floor(coins)} target={50000} />
              <GuardItem label="24h Cooldown" current={lastWithdrawalAt ? "Pending" : "Ready"} target="Ready" isSpecial />
            </div>
          </CardContent>
        </Card>
      </div>
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

const WithdrawForm = ({ title, subtitle, balance, symbol, address, setAddress, onWithdraw }: any) => (
  <div className="glass-morphism p-4 rounded-2xl space-y-4 border-white/5 bg-gradient-to-br from-white/5 to-transparent">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-bold text-sm text-white">{title}</h3>
        {balance !== undefined ? (
          <p className="text-[10px] text-primary font-black uppercase tracking-tight">Balance: {balance} {symbol}</p>
        ) : (
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{subtitle}</p>
        )}
      </div>
      <Badge variant="outline" className="border-secondary/20 text-secondary bg-secondary/5 text-[9px]">FASTEST</Badge>
    </div>
    <div className="space-y-2">
      <input 
        type="text" 
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter ID/Address" 
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30 font-mono" 
      />
      <Button onClick={onWithdraw} className="w-full bg-primary hover:bg-primary/80 font-black group h-12 rounded-xl shadow-lg shadow-primary/10">
        EXECUTE WITHDRAWAL <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </Button>
    </div>
  </div>
);
