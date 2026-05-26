"use client";

import React, { useState } from "react";
import { AdminWithdrawalPanel } from "@/components/AdminWithdrawalPanel";
import { AdminVIPPanel } from "@/components/AdminVIPPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock, CreditCard, Crown, LogOut, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  // Hardcoded key for direct sync
  const adminKey = "ADMIN123";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminKey) {
      setIsAuthenticated(true);
      setError(false);
      toast({ title: "Access Granted", description: "Secure session initialized." });
    } else {
      setError(true);
      toast({ 
        variant: "destructive", 
        title: "Access Denied", 
        description: "Invalid security key provided." 
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm glass-morphism p-8 space-y-6 text-center border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
          
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black neon-text-primary uppercase tracking-tighter">System Access</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Enter Administrative Protocol Key</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <Input 
                type="password" 
                placeholder="Security Key" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`bg-white/5 border-white/10 text-center font-mono h-12 ${error ? "border-destructive ring-1 ring-destructive" : ""}`}
              />
              {error && (
                <p className="text-[9px] text-destructive font-bold uppercase tracking-widest flex items-center justify-center gap-1 mt-1">
                  <AlertCircle className="w-2.5 h-2.5" /> Unauthorized Attempt
                </p>
              )}
            </div>
            
            <Button type="submit" className="w-full bg-primary font-black uppercase tracking-widest h-12 shadow-lg shadow-primary/20">
              Authenticate
            </Button>
          </form>
          
          <div className="pt-4 border-t border-white/5">
             <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest">Global Admin Grid v2.5.0</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 pb-20 max-w-2xl mx-auto">
      <header className="py-6 flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tighter">Control Hub</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Administrative Grid v2.5.0</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAuthenticated(false)} 
          className="border-white/10 text-[10px] font-black uppercase hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
        >
          <LogOut className="w-3 h-3 mr-2" /> EXIT
        </Button>
      </header>

      <Tabs defaultValue="withdrawals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 h-12 p-1">
          <TabsTrigger value="withdrawals" className="font-black text-[10px] uppercase gap-2">
            <CreditCard className="w-3 h-3" /> Payouts
          </TabsTrigger>
          <TabsTrigger value="vip" className="font-black text-[10px] uppercase gap-2">
            <Crown className="w-3 h-3" /> VIP Approvals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="animate-in fade-in duration-500">
          <AdminWithdrawalPanel />
        </TabsContent>
        
        <TabsContent value="vip" className="animate-in fade-in duration-500">
          <AdminVIPPanel />
        </TabsContent>
      </Tabs>
    </main>
  );
}
