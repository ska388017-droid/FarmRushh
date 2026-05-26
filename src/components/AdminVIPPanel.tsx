
"use client";

import React, { useState, useMemo } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  doc, 
  updateDoc
} from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Clock, 
  Copy, 
  User,
  Hash,
  Crown,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const AdminVIPPanel = () => {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  const vipQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "vip_requests"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: requests, loading } = useCollection(vipQuery);

  const filteredRequests = useMemo(() => {
    return (requests || []).filter(r => 
      r.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.txHash?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requests, searchTerm]);

  const updateRequestStatus = async (request: any, newStatus: string) => {
    if (!db) return;
    try {
      const docRef = doc(db, "vip_requests", request.id);
      await updateDoc(docRef, { status: newStatus });
      
      if (newStatus === "approved") {
        const userRef = doc(db, "users", request.uid);
        // Set expiry to 30 days from now
        const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
        
        await updateDoc(userRef, {
          vip: true,
          vipPlan: request.plan,
          vipExpire: expiry,
          // Boost energy on approval
          maxEnergy: request.plan === 'Diamond' ? 10000 : request.plan === 'Gold' ? 5000 : 2500
        });
        
        toast({ title: "Approved", description: `${request.username} is now VIP ${request.plan}` });
      } else {
        toast({ title: "Rejected", description: "Request marked as rejected.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", variant: "destructive", description: "Operation failed." });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied" });
  };

  if (loading) return <div className="text-center py-20 neon-text-primary animate-pulse font-black uppercase">Scanning Payments...</div>;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search Username or TXID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 h-11"
        />
      </div>

      <div className="space-y-4">
        {filteredRequests.map((req: any) => (
          <Card key={req.id} className="glass-morphism p-5 border-white/5 hover:border-primary/20 transition-all">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-black text-white uppercase tracking-tight">{req.username}</p>
                    <p className="text-[9px] text-muted-foreground font-mono">{req.uid}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  "text-[8px] font-black uppercase tracking-widest",
                  req.status === "approved" ? "text-secondary border-secondary/20 bg-secondary/10" : 
                  req.status === "pending" ? "text-primary border-primary/20 bg-primary/10" : "text-destructive border-destructive/20 bg-destructive/10"
                )}>
                  {req.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                <div className="space-y-1">
                  <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Selected Plan</p>
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3 h-3 text-secondary" />
                    <p className="text-sm font-black text-white uppercase">{req.plan}</p>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Submitted</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <Clock className="w-3 h-3 text-primary" />
                    <p className="text-[10px] text-white font-medium">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Transaction Hash (TXID)</p>
                <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                  <code className="text-[10px] text-primary flex-1 truncate font-mono">{req.txHash}</code>
                  <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-white/10" onClick={() => copyToClipboard(req.txHash)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {req.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => updateRequestStatus(req, "approved")} 
                    className="flex-1 bg-secondary text-secondary-foreground font-black text-[10px] h-10 rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> APPROVE
                  </Button>
                  <Button 
                    onClick={() => updateRequestStatus(req, "rejected")} 
                    variant="destructive" 
                    className="flex-1 font-black text-[10px] h-10 rounded-xl"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> REJECT
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-20 glass-morphism rounded-3xl border-dashed border-white/10 opacity-30">
            <Hash className="w-12 h-12 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No pending approvals found</p>
          </div>
        )}
      </div>
    </div>
  );
};
