
"use client";

import React, { useState } from "react";
import { AdminWithdrawalPanel } from "@/components/AdminWithdrawalPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock } from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple prototype security: In production, use Firebase Auth Custom Claims
    if (password === "admin123") {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm glass-morphism p-8 space-y-6 text-center border-primary/20">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black neon-text-primary uppercase tracking-tighter">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="password" 
              placeholder="Security Key" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-center"
            />
            <Button type="submit" className="w-full bg-primary font-black uppercase tracking-widest">
              Authenticate
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Authorized Personnel Only</p>
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
            <h1 className="text-xl font-black text-white uppercase tracking-tighter">System Control</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Financial Oversight</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)} className="border-white/10 text-[10px] font-black uppercase">
          Logout
        </Button>
      </header>

      <AdminWithdrawalPanel />
    </main>
  );
}
