
"use client";

import React, { useState, useEffect } from "react";
import { useGame, Crop } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdGate } from "@/components/ads/AdGate";
import { Badge } from "@/components/ui/badge";
import { Sprout, Timer, Coins, ShieldCheck, Zap } from "lucide-react";

export const FarmEngine = () => {
  const { user, plantCrop, claimHarvest } = useGame();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary">NEON FARM</h2>
        <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/50">
          <Zap className="w-3 h-3 mr-1" /> ACTIVE BUFFS: 0
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {user.crops.map((crop) => (
          <PlotCard key={crop.id} crop={crop} now={now} onPlant={() => plantCrop(crop.id, "Neon Wheat")} onHarvest={() => claimHarvest(crop.id)} />
        ))}
      </div>
    </div>
  );
};

const PlotCard = ({ crop, now, onPlant, onHarvest }: { crop: Crop; now: number; onPlant: () => void; onHarvest: () => void }) => {
  const isPlanted = crop.plantedAt !== null;
  const isReady = crop.readyAt !== null && now >= crop.readyAt;
  
  const remainingTime = crop.readyAt ? Math.max(0, Math.floor((crop.readyAt - now) / 1000)) : 0;
  const progress = isPlanted && crop.readyAt ? Math.min(100, (1 - remainingTime / crop.growthTime) * 100) : 0;

  return (
    <Card className="glass-morphism overflow-hidden relative group">
      <div className="p-4 flex flex-col items-center text-center space-y-3">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isReady ? 'bg-secondary/20 scale-110' : isPlanted ? 'bg-primary/20 animate-pulse' : 'bg-muted'}`}>
          <Sprout className={`w-8 h-8 ${isReady ? 'text-secondary animate-bounce' : isPlanted ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        
        <div className="space-y-1">
          <p className="font-bold text-sm tracking-tight">{crop.name}</p>
          {isPlanted ? (
            <p className="text-[10px] text-muted-foreground uppercase flex items-center justify-center">
              <Timer className="w-3 h-3 mr-1" /> {isReady ? "READY" : `${remainingTime}s`}
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground uppercase italic">EMPTY PLOT</p>
          )}
        </div>

        {isReady ? (
          <AdGate actionName="Harvest" onReward={onHarvest}>
            <Button size="sm" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold shadow-[0_0_15px_rgba(57,255,20,0.4)]">
              HARVEST
            </Button>
          </AdGate>
        ) : isPlanted ? (
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10 font-bold" onClick={onPlant}>
            PLANT
          </Button>
        )}
      </div>
      
      {isReady && <div className="absolute top-2 right-2"><ShieldCheck className="w-4 h-4 text-secondary opacity-50" /></div>}
    </Card>
  );
};
