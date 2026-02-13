"use client";

import { formatDistanceToNow, isPast } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import TaskUpdates from "./TaskUpdates";

export default function TaskItem({ task, onUpdate }) {
  const [showUpdates, setShowUpdates] = useState(false);

  // Status Logic
  const isRunning = task.startTime && !task.isCompleted;
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && !task.isCompleted;

  const handleStart = async () => {
    const now = new Date();
    const deadline = task.timeLimit ? new Date(now.getTime() + task.timeLimit * 60000) : null;
    await fetch(`/api/tasks/${task._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime: now, deadline }),
    });
    onUpdate();
  };

  const handleToggle = async (checked) => {
    await fetch(`/api/tasks/${task._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: checked }),
    });
    onUpdate();
  };

  // Dynamic Styles
  let borderClass = "border-slate-100";
  if (isRunning) borderClass = "border-indigo-500 ring-1 ring-indigo-500/20";
  if (isOverdue) borderClass = "border-red-500";
  if (task.isCompleted) borderClass = "border-green-200 bg-green-50/30 opacity-60";

  return (
    <Card className={`group mb-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${borderClass}`}>
      <CardContent className="p-4 flex gap-4 items-start">
        
        {/* Checkbox */}
        <div className="pt-1">
            <Checkbox checked={task.isCompleted} onCheckedChange={handleToggle} className="w-5 h-5 rounded-full" />
        </div>

        <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex justify-between items-start">
                <h3 className={`font-medium text-slate-900 ${task.isCompleted && "line-through text-slate-500"}`}>
                    {task.title}
                </h3>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400" onClick={() => setShowUpdates(!showUpdates)}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
                {task.timeLimit > 0 && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                        <Clock className="w-3 h-3 mr-1" /> {task.timeLimit}m
                    </Badge>
                )}
                {isOverdue && (
                    <Badge variant="destructive" className="font-normal">Overdue</Badge>
                )}
            </div>

            {/* Start Button (Only show if NOT running and NOT done) */}
            {!isRunning && !task.isCompleted && (
                <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={handleStart} 
                    className="mt-3 h-8 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 w-full justify-start"
                >
                    <Play className="w-3 h-3 mr-2 fill-indigo-600" /> Start Focus
                </Button>
            )}

            {/* Updates (Hidden by default) */}
            {showUpdates && (
                <div className="mt-3 pt-3 border-t">
                    <TaskUpdates taskId={task._id} updates={task.updates} onUpdateAdded={onUpdate} />
                </div>
            )}
            
            {/* Subtasks */}
            {task.subtasks?.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-slate-200 space-y-2">
                    {task.subtasks.map(sub => <TaskItem key={sub._id} task={sub} onUpdate={onUpdate} />)}
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}