
"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Loader2, Sparkles, TrendingUp, Info } from "lucide-react";
import { aiCropStrategyRecommendation, AICropStrategyOutput } from "@/ai/flows/ai-crop-strategy-recommendation";

export const AIStrategy = () => {
  const { user } = useGame();
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<AICropStrategyOutput | null>(null);

  const generateStrategy = async () => {
    setLoading(true);
    try {
      // Mapping current game state to AI input schema
      const result = await aiCropStrategyRecommendation({
        pastHarvests: user.crops.map(c => ({
          cropType: c.type,
          yieldAmount: 250,
          harvestDate: "Recently"
        })),
        availableLandPlots: user.crops.length,
        availableWater: 100,
        boosterInventory: [],
        currentInGameDate: "Cycle 1",
        userGameLevel: user.level
      });
      setStrategy(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary">AI STRATEGY</h2>
        <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
      </div>

      <Card className="glass-morphism border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <BrainCircuit className="w-16 h-16 text-primary" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Yield Optimization Engine</h3>
            <p className="text-xs text-muted-foreground">Neural analysis of your farming habits to maximize ROI.</p>
          </div>
          <Button onClick={generateStrategy} disabled={loading} className="w-full bg-primary hover:bg-primary/80 font-black shadow-[0_0_20px_rgba(163,92,255,0.4)]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
            {loading ? "ANALYZING..." : "GENERATE STRATEGY"}
          </Button>
        </CardContent>
      </Card>

      {strategy && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-morphism p-4 rounded-2xl border-secondary/30">
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">AI Recommendation</p>
              <span className="text-lg font-black text-secondary">+{strategy.estimatedYieldIncreasePercentage}% YIELD</span>
            </div>
            <p className="text-sm text-white leading-relaxed italic">"{strategy.overallStrategySummary}"</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Info className="w-3 h-3" /> Recommended Schedule
            </h4>
            {strategy.recommendedPlantingSchedule.map((item, i) => (
              <div key={i} className="glass-morphism p-3 rounded-xl flex justify-between items-center border-white/5">
                <div>
                  <p className="font-bold text-white text-sm">{item.cropType}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{item.plotsToUse} Plots | {item.plantingTime}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-secondary">+{item.expectedYieldIncrease} Exp.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
