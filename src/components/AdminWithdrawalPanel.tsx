
"use client";

import React, { useState, useMemo } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  doc, 
  updateDoc,
  where
} from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Copy, 
  ExternalLink,
  Coins,
  User,
  CreditCard
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const AdminWithdrawalPanel = () => {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const withdrawalQuery = useMemo(() => {
    if (!db) return null;
    let baseQuery = query(collection(db, "withdrawals"), orderBy("createdAt", "desc"));
    return baseQuery;
  }, [db]);

  const { data: withdrawals, loading } = useCollection(withdrawalQuery);

  const filteredWithdrawals = useMemo(() => {
    return (withdrawals || []).filter(w => {
      const matchesSearch = w.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           w.uid?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = statusFilter === "all" || w.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [withdrawals, searchTerm, statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    if (!db) return;
    try {
      const docRef = doc(db, "withdrawals", id);
      // Note: In a real app, we need the doc ID. useCollection should provide it.
      // Assuming useCollection implementation includes id
      await updateDoc(docRef, { status: newStatus });
      toast({ title: "Status Updated", description: `Request marked as ${newStatus}.` });
    } catch (e) {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Address copied to clipboard." });
  };

  if (loading) {
    return <div className="text-center py-20 neon-text-primary animate-pulse font-black uppercase tracking-widest">Loading Requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search UID or Username..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {["all", "pending", "paid", "rejected"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "text-[9px] font-black uppercase h-8 px-4 rounded-xl",
                statusFilter === status ? "bg-primary text-white" : "border-white/10 text-muted-foreground"
              )}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredWithdrawals.length === 0 ? (
          <div className="text-center py-12 glass-morphism rounded-3xl border-dashed border-white/10">
            <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-xs text-muted-foreground uppercase font-black">No matching requests found</p>
          </div>
        ) : (
          filteredWithdrawals.map((req: any, i: number) => (
            <Card key={i} className="glass-morphism p-5 border-white/5 hover:border-primary/20 transition-all overflow-hidden group">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-black text-white uppercase tracking-tight">{req.username}</p>
                      <p className="text-[9px] text-muted-foreground font-mono">{req.uid}</p>
                    </div>
                  </div>
                  <StatusIndicator status={req.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                  <div className="space-y-1">
                    <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Amount</p>
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-3 h-3 text-primary" />
                      <p className="text-sm font-black text-white">₹{(req.coins / 1000).toFixed(2)}</p>
                    </div>
                    <p className="text-[8px] text-muted-foreground">{req.coins.toLocaleString()} Coins</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Method</p>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3 text-secondary" />
                      <p className="text-sm font-black text-white uppercase tracking-tighter">{req.method}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Destination Address</p>
                  <div className="flex items-center gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                    <code className="text-[10px] text-primary flex-1 truncate font-mono">{req.address}</code>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 hover:bg-white/10" 
                      onClick={() => copyToClipboard(req.address)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => updateStatus(req.id, "paid")}
                      className="flex-1 bg-secondary text-secondary-foreground font-black text-[10px] h-9 rounded-xl"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-2" /> APPROVE & PAID
                    </Button>
                    <Button 
                      onClick={() => updateStatus(req.id, "rejected")}
                      variant="destructive"
                      className="flex-1 font-black text-[10px] h-9 rounded-xl"
                    >
                      <XCircle className="w-3 h-3 mr-2" /> REJECT
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-[8px] text-muted-foreground/40 font-bold uppercase pt-2">
                  <span>Created: {new Date(req.createdAt).toLocaleString()}</span>
                  <span>ID: {req.id?.substring(0,8)}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const StatusIndicator = ({ status }: { status: string }) => {
  const isPaid = status === "paid" || status === "completed";
  const isPending = status === "pending";
  
  return (
    <div className={cn(
      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
      isPaid ? "bg-secondary/10 text-secondary border-secondary/20" : 
      isPending ? "bg-primary/10 text-primary border-primary/20" : 
      "bg-destructive/10 text-destructive border-destructive/20"
    )}>
      {status}
    </div>
  );
};
