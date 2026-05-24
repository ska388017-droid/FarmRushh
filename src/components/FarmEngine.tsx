"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGame, Crop } from "@/lib/game-store";
import { Button } from "@/components/ui/button";
import { AdGate } from "@/components/ads/AdGate";
import { Badge } from "@/components/ui/badge";
import { Sprout, Timer, ShieldCheck, Zap, Droplets, Wind, Cat } from "lucide-react";
import { cn } from "@/lib/utils";

export const FarmEngine = () => {
  const { user, plantCrop, claimHarvest } = useGame();
  const [now, setNow] = useState(Date.now());
  const [harvestParticles, setHarvestParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerHarvestEffect = (e: React.MouseEvent) => {
    const newId = Date.now();
    setHarvestParticles(prev => [...prev, { id: newId, x: e.clientX, y: e.clientY }]);
    setTimeout(() => {
      setHarvestParticles(prev => prev.filter(p => p.id !== newId));
    }, 1000);
  };

  return (
    <div className="space-y-8 min-h-[500px] relative">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-black neon-text-primary tracking-tighter italic uppercase">NEON DISTRICT 7</h2>
          <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">Atmospheric Pressure: Optimal</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/50 animate-pulse">
            <Zap className="w-3 h-3 mr-1" /> PHOTON BOOST: 1.2x
          </Badge>
          <div className="flex gap-2">
            <Droplets className="w-4 h-4 text-blue-400 opacity-50" />
            <Wind className="w-4 h-4 text-primary opacity-50" />
          </div>
        </div>
      </div>

      {/* Isometric Farm World */}
      <div className="farm-container relative w-full h-[400px] flex items-center justify-center overflow-visible">
        {/* Wandering Pet */}
        <div className="absolute z-50 animate-wander pointer-events-none" style={{ left: '40%', top: '30%' }}>
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Cat className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(163,92,255,0.8)]" />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/80 border border-white/10 px-2 py-0.5 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity uppercase">
              {user.pets[0] || "CyberCat"}
            </div>
          </div>
        </div>

        <div className="isometric-world grid grid-cols-2 gap-4 p-8 relative">
          {/* Grid Ground Glow */}
          <div className="absolute inset-0 bg-primary/5 blur-3xl -translate-z-10" />
          
          {user.crops.map((crop, idx) => (
            <div key={crop.id} className="isometric-plot relative">
              <PlotBase 
                crop={crop} 
                now={now} 
                onPlant={() => plantCrop(crop.id, "Neon Wheat")} 
                onHarvest={(e) => {
                  triggerHarvestEffect(e);
                  claimHarvest(crop.id);
                }} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Harvest Particle Overlay */}
      {harvestParticles.map(p => (
        <div 
          key={p.id} 
          className="fixed z-[100] pointer-events-none floating-coin flex flex-col items-center"
          style={{ left: p.x, top: p.y }}
        >
          <span className="text-secondary font-black text-xl drop-shadow-[0_0_10px_rgba(57,255,20,1)]">+250</span>
          < Zap className="w-6 h-6 text-secondary" />
        </div>
      ))}

      <div className="glass-morphism p-4 rounded-2xl border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Sprout className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Seeds</p>
            <p className="text-sm font-black text-white">{user.crops.filter(c => c.plantedAt).length} / {user.crops.length}</p>
          </div>
        </div>
        <Button variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-tighter h-8 rounded-lg">
          EXPAND GRID
        </Button>
      </div>
    </div>
  );
};

const PlotBase = ({ crop, now, onPlant, onHarvest }: { crop: Crop; now: number; onPlant: () => void; onHarvest: (e: React.MouseEvent) => void }) => {
  const isPlanted = crop.plantedAt !== null;
  const isReady = crop.readyAt !== null && now >= crop.readyAt;
  
  const remainingTime = crop.readyAt ? Math.max(0, Math.floor((crop.readyAt - now) / 1000)) : 0;
  const progress = isPlanted && crop.readyAt ? Math.min(100, (1 - remainingTime / crop.growthTime) * 100) : 0;

  // Growth Stage calculation
  const stage = progress < 30 ? 'seed' : progress < 70 ? 'growing' : 'mature';

  return (
    <div className="relative group cursor-pointer">
      {/* 3D Base Plot */}
      <div 
        className={cn(
          "plot-base w-32 h-32 rounded-2xl relative transition-all duration-500",
          isPlanted ? "planted" : "",
          isReady ? "ready border border-secondary/30 scale-105" : "border border-white/5"
        )}
        onClick={() => !isPlanted && onPlant()}
      >
        {/* Dirt Texture / Holographic Grid */}
        <div className="absolute inset-2 border-[0.5px] border-white/5 rounded-xl opacity-20" />
        
        {/* Plant Model Container */}
        {isPlanted && (
          <div className="crop-vertical absolute inset-0 flex items-center justify-center">
             <PlantModel stage={stage} isReady={isReady} />
          </div>
        )}

        {/* UI Overlay on Plot */}
        <div className="absolute -bottom-2 -left-2 z-50">
           {isPlanted && !isReady && (
             <div className="bg-background/90 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg shadow-xl flex items-center gap-1.5">
               <Timer className="w-2.5 h-2.5 text-primary" />
               <span className="text-[8px] font-black text-white tabular-nums">{remainingTime}s</span>
             </div>
           )}
           {isReady && (
             <div className="animate-bounce">
                <AdGate actionName="Harvest" onReward={(e) => onHarvest(e)}>
                  <Button size="sm" className="bg-secondary text-secondary-foreground font-black text-[9px] h-7 px-3 rounded-lg shadow-[0_0_20px_rgba(57,255,20,0.5)]">
                    COLLECT
                  </Button>
                </AdGate>
             </div>
           )}
        </div>

        {!isPlanted && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col items-center gap-1">
              <Sprout className="w-6 h-6 text-primary/40" />
              <span className="text-[8px] font-black text-primary/60 uppercase">Tap to Plant</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PlantModel = ({ stage, isReady }: { stage: string; isReady: boolean }) => {
  return (
    <div className={cn(
      "relative transition-all duration-1000",
      isReady ? "animate-sway scale-125" : "scale-100"
    )}>
      {/* Glow Aura */}
      <div className={cn(
        "absolute -inset-8 blur-2xl rounded-full transition-colors duration-1000",
        isReady ? "bg-secondary/30" : "bg-primary/10"
      )} />

      {/* SVG Plant representation for realism & performance */}
      <svg width="60" height="80" viewBox="0 0 60 80" className="drop-shadow-[0_0_15px_rgba(163,92,255,0.5)]">
        {stage === 'seed' && (
          <g transform="translate(20, 60)">
             <circle cx="10" cy="10" r="4" fill="hsl(var(--primary))" className="animate-pulse" />
             <path d="M10 10 Q15 0 20 10" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
          </g>
        )}
        {stage === 'growing' && (
          <g transform="translate(15, 30)">
             <path d="M15 50 Q15 20 30 10" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" />
             <path d="M15 50 Q15 30 5 25" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
             <circle cx="30" cy="10" r="3" fill="hsl(var(--primary))" />
          </g>
        )}
        {stage === 'mature' && (
          <g transform="translate(5, 5)">
             {/* Stalk */}
             <path d="M25 70 Q25 40 25 10" stroke={isReady ? "hsl(var(--secondary))" : "hsl(var(--primary))"} strokeWidth="4" fill="none" />
             {/* Glowing Leaves/Fruit */}
             <circle cx="25" cy="10" r="8" fill={isReady ? "hsl(var(--secondary))" : "hsl(var(--primary))"} className="animate-pulse" />
             <circle cx="15" cy="25" r="5" fill={isReady ? "hsl(var(--secondary))" : "hsl(var(--primary))"} opacity="0.8" />
             <circle cx="35" cy="25" r="5" fill={isReady ? "hsl(var(--secondary))" : "hsl(var(--primary))"} opacity="0.8" />
             <circle cx="25" cy="40" r="4" fill={isReady ? "hsl(var(--secondary))" : "hsl(var(--primary))"} opacity="0.6" />
             
             {/* Neon Veins */}
             {isReady && (
               <path d="M25 10 L25 70" stroke="white" strokeWidth="0.5" opacity="0.5" />
             )}
          </g>
        )}
      </svg>
    </div>
  );
};
