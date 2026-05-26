
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
  Crown
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
        const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
        
        // Finalized VIP Granting Logic
        await updateDoc(userRef, {
          vip: true,
          vipPlan: request.plan,
          vipExpire: expiry
        });
        
        toast({ title: "Approved", description: `${request.username} is now VIP ${request.plan}` });
      } else {
        toast({ title: "Rejected", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
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
          className="pl-10 bg-white/5 border-white/10"
        />
      </div>

      <div className="space-y-4">
        {filteredRequests.map((req: any) => (
          <Card key={req.id} className="glass-morphism p-5 border-white/5">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="font-black text-white uppercase">{req.username}</p>
                    <p className="text-[9px] text-muted-foreground font-mono">{req.uid}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  "text-[8px] font-black uppercase",
                  req.status === "approved" ? "text-secondary border-secondary/20" : 
                  req.status === "pending" ? "text-primary border-primary/20" : "text-destructive border-destructive/20"
                )}>{req.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                <div className="space-y-1">
                  <p className="text-[8px] text-muted-foreground uppercase font-bold">Plan</p>
                  <div className="flex items-center gap-1.5"><Crown className="w-3 h-3 text-secondary" /><p className="text-sm font-black text-white">{req.plan}</p></div>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[8px] text-muted-foreground uppercase font-bold">Time</p>
                  <div className="flex items-center justify-end gap-1.5"><Clock className="w-3 h-3 text-primary" /><p className="text-[10px] text-white font-medium">{new Date(req.createdAt).toLocaleString()}</p></div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[8px] text-muted-foreground uppercase font-bold">TXID</p>
                <div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <code className="text-[9px] text-primary flex-1 truncate font-mono">{req.txHash}</code>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(req.txHash)}><Copy className="w-3 h-3" /></Button>
                </div>
              </div>

              {req.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => updateRequestStatus(req, "approved")} className="flex-1 bg-secondary text-secondary-foreground font-black text-[10px] h-9 rounded-xl">APPROVE</Button>
                  <Button onClick={() => updateRequestStatus(req, "rejected")} variant="destructive" className="flex-1 font-black text-[10px] h-9 rounded-xl">REJECT</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Badge = ({ children, className, variant }: any) => (
  <div className={cn("px-2 py-0.5 rounded-full border", className)}>
    {children}
  </div>
);
