"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Pause, Maximize2, X } from "lucide-react";
import confetti from "canvas-confetti";

export default function ActiveTaskDock({ activeTask, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!activeTask) return;

    const interval = setInterval(() => {
      // 1. Calculate Time Text
      if (activeTask.deadline) {
        setTimeLeft(formatDistanceToNow(new Date(activeTask.deadline), { addSuffix: true }));
      } else {
        setTimeLeft("Focusing...");
      }

      // 2. Calculate Progress Bar
      if (activeTask.startTime && activeTask.deadline) {
        const start = new Date(activeTask.startTime).getTime();
        const end = new Date(activeTask.deadline).getTime();
        const now = new Date().getTime();
        const total = end - start;
        const elapsed = now - start;
        const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
        setProgress(pct);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTask]);

  const handleComplete = () => {
    // 3. Trigger Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.9 } // Shoot from bottom
    });
    onComplete(activeTask._id);
  };

  if (!activeTask) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700 p-4 flex items-center gap-4 ring-1 ring-indigo-500/50">
        
        {/* Pulsing Indicator */}
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </div>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate text-sm md:text-base">{activeTask.title}</h4>
          <div className="flex items-center gap-2 text-xs text-slate-400">
             <span>{timeLeft}</span>
             <span className="text-slate-600">•</span>
             <span>In Progress</span>
          </div>
          {/* Mini Progress Bar */}
          {activeTask.timeLimit > 0 && (
             <Progress value={progress} className="h-1 mt-2 bg-slate-700" indicatorClassName="bg-indigo-500" />
          )}
        </div>

        {/* Action Button */}
        <Button 
            onClick={handleComplete}
            size="icon"
            className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-[0_0_15px_-3px_rgba(34,197,94,0.6)] transition-all hover:scale-110"
        >
            <CheckCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}