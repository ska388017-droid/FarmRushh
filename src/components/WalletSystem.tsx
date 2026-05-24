
"use client";

import React from "react";
import { useGame } from "@/lib/game-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Wallet, ArrowUpRight, ShieldAlert, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export const WalletSystem = () => {
  const { user } = useGame();

  const handleWithdraw = (network: string) => {
    // Hardened Withdrawal Guard Logic
    const accountAgeDays = (Date.now() - user.joinedAt) / (1000 * 60 * 60 * 24);
    
    if (accountAgeDays < 3) {
      toast({ title: "Guard Alert", description: "Account must be at least 3 days old.", variant: "destructive" });
      return;
    }
    if (user.adsWatched < 20) {
      toast({ title: "Guard Alert", description: "Watch at least 20 ads to unlock withdrawals.", variant: "destructive" });
      return;
    }
    if (user.tasksCompleted < 5) {
      toast({ title: "Guard Alert", description: "Complete at least 5 tasks to unlock withdrawals.", variant: "destructive" });
      return;
    }
    
    toast({ title: "Processing", description: `Withdrawal request sent via ${network}.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary">WALLETS</h2>
        <Badge variant="outline" className="border-primary text-primary">MULTI-CHAIN</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="glass-morphism border-primary/30 shadow-[0_0_20px_rgba(163,92,255,0.15)] bg-gradient-to-br from-card to-primary/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Total Value (Est.)</p>
                <div className="text-3xl font-black text-white flex items-baseline gap-2">
                  ₹{(user.coins * 0.05).toFixed(2)}
                  <span className="text-xs font-normal text-muted-foreground">INR</span>
                </div>
              </div>
              <Wallet className="w-8 h-8 text-primary opacity-50" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Coins</p>
                <p className="font-bold text-secondary">{user.coins.toLocaleString()}</p>
              </div>
              <div className="text-center border-x border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase">USDT</p>
                <p className="font-bold text-white">${(user.coins * 0.0006).toFixed(4)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase">TON</p>
                <p className="font-bold text-primary">{(user.coins * 0.00002).toFixed(4)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="upi" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="upi" className="rounded-lg">UPI</TabsTrigger>
            <TabsTrigger value="ton" className="rounded-lg">TON</TabsTrigger>
            <TabsTrigger value="bnb" className="rounded-lg">BNB</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="upi">
              <WithdrawForm title="UPI Instant Payout" subtitle="Min: 10,000 Coins" onWithdraw={() => handleWithdraw("UPI")} />
            </TabsContent>
            <TabsContent value="ton">
              <WithdrawForm title="TON Network" subtitle="Address validation required" onWithdraw={() => handleWithdraw("TON")} />
            </TabsContent>
            <TabsContent value="bnb">
              <WithdrawForm title="BNB Chain" subtitle="BEP-20 Network only" onWithdraw={() => handleWithdraw("BNB Chain")} />
            </TabsContent>
          </div>
        </Tabs>

        <Card className="glass-morphism border-red-500/20">
          <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <CardTitle className="text-xs uppercase text-red-500 tracking-tighter">Eligibility Guard</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ul className="text-[10px] space-y-1 text-muted-foreground">
              <li className={`flex justify-between ${user.adsWatched >= 20 ? 'text-secondary' : ''}`}>
                <span>• 20 Ads Watched</span>
                <span>{user.adsWatched}/20</span>
              </li>
              <li className={`flex justify-between ${user.tasksCompleted >= 5 ? 'text-secondary' : ''}`}>
                <span>• 5 Tasks Completed</span>
                <span>{user.tasksCompleted}/5</span>
              </li>
              <li className="flex justify-between">
                <span>• Account Age &gt; 3 Days</span>
                <span>4 Days</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const WithdrawForm = ({ title, subtitle, onWithdraw }: { title: string, subtitle: string, onWithdraw: () => void }) => (
  <div className="glass-morphism p-4 rounded-2xl space-y-4">
    <div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
    <div className="space-y-2">
      <input type="text" placeholder="Enter ID/Address" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all" />
      <Button onClick={onWithdraw} className="w-full bg-primary hover:bg-primary/80 font-bold group">
        WITHDRAW <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </Button>
    </div>
  </div>
);
