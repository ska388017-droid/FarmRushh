
"use client";

import React, { useState } from "react";
import { useGame } from "@/lib/game-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, Send, CheckCircle2, Coins, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const Tasks = () => {
  const { addCoins, completeTask } = useGame();
  const [completed, setCompleted] = useState<string[]>([]);

  const handleTask = (taskId: string, coins: number) => {
    if (completed.includes(taskId)) return;
    
    toast({ title: "Redirecting...", description: "Please complete the task and return." });
    setTimeout(() => {
      setCompleted(prev => [...prev, taskId]);
      addCoins(coins);
      completeTask();
      toast({ title: "Task Verified", description: `You earned ${coins} CyberCoins!` });
    }, 3000);
  };

  const socialTasks = [
    { id: "tg_join", title: "Join CashNovazhv", subtitle: "Official Telegram Channel", reward: 1000, icon: Send, color: "bg-blue-500" },
    { id: "ig_follow", title: "Follow cashnova503", subtitle: "Official Instagram Page", reward: 1000, icon: Instagram, color: "bg-pink-500" },
    { id: "yt_sub", title: "Subscribe FarmRush", subtitle: "Earn 2x Boosters", reward: 2000, icon: ArrowRight, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-primary">TASKS</h2>
        <Badge variant="outline" className="border-secondary text-secondary">ACTIVE</Badge>
      </div>

      <Card className="glass-morphism p-4 border-secondary/20 bg-secondary/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/20 rounded-lg">
            <Coins className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Bounty Board</p>
            <p className="text-sm text-white">Complete all social tasks for a Mega Bonus.</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {socialTasks.map((task) => (
          <Card key={task.id} className="glass-morphism overflow-hidden p-4 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${task.color} bg-opacity-20 text-white`}>
                  <task.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{task.title}</h4>
                  <p className="text-xs text-muted-foreground">{task.subtitle}</p>
                </div>
              </div>
              
              {completed.includes(task.id) ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-6 h-6 text-secondary" />
                  <span className="text-[10px] text-secondary font-bold">DONE</span>
                </div>
              ) : (
                <Button size="sm" onClick={() => handleTask(task.id, task.reward)} className="bg-primary hover:bg-primary/80 font-bold px-4">
                  +{task.reward}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
