"use client";

import { useState } from "react";
import { formatDistanceToNow, isPast } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Clock, 
  MoreHorizontal, 
  AlertCircle, 
  Plus, 
  CornerDownRight 
} from "lucide-react";
import TaskUpdates from "./TaskUpdates";

export default function TaskItem({ task, onUpdate }) {
  const [showUpdates, setShowUpdates] = useState(false);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [loadingSubtask, setLoadingSubtask] = useState(false);

  const isRunning = task.startTime && !task.isCompleted;
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && !task.isCompleted;

  // --- HANDLERS ---
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

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    setLoadingSubtask(true);
    
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newSubtaskTitle,
        parentId: task._id, // <--- Links this new task to the current task
        timeLimit: 0 
      }),
    });

    setNewSubtaskTitle("");
    setShowSubtaskInput(false);
    setLoadingSubtask(false);
    onUpdate();
  };

  // --- DARK MODE STYLES ---
  let cardStyle = "bg-slate-900/50 border-white/10 hover:border-indigo-500/50";
  if (isRunning) cardStyle = "bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]";
  if (isOverdue) cardStyle = "bg-red-900/10 border-red-500/50";
  if (task.isCompleted) cardStyle = "bg-slate-900/30 border-white/5 opacity-50";

  return (
    <Card className={`group transition-all duration-300 backdrop-blur-sm border ${cardStyle} mb-3`}>
      <CardContent className="p-4 flex gap-4 items-start">
        
        {/* Checkbox */}
        <div className="pt-1">
            <Checkbox 
                checked={task.isCompleted} 
                onCheckedChange={handleToggle} 
                className="w-5 h-5 rounded-full border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-black" 
            />
        </div>

        <div className="flex-1 min-w-0">
            {/* Header: Title + Action Buttons */}
            <div className="flex justify-between items-start">
                <h3 className={`font-medium text-lg leading-tight ${task.isCompleted ? "line-through text-slate-500" : "text-slate-200"}`}>
                    {task.title}
                </h3>
                
                {/* Actions (Add Subtask & View Activity) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10" 
                        onClick={() => setShowSubtaskInput(!showSubtaskInput)}
                        title="Add Subtask"
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10" 
                        onClick={() => setShowUpdates(!showUpdates)}
                        title="View Activity Log"
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Tags: Time & Overdue Status */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
                {task.timeLimit > 0 && (
                    <Badge variant="outline" className="bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 font-normal">
                        <Clock className="w-3 h-3 mr-2" /> {task.timeLimit}m
                    </Badge>
                )}
                {isOverdue && (
                    <Badge className="bg-red-500/20 text-red-400 border border-red-500/50">
                        <AlertCircle className="w-3 h-3 mr-1"/> Overdue
                    </Badge>
                )}
            </div>

            {/* Start Button (Only if not running/done) */}
            {!isRunning && !task.isCompleted && (
                <Button 
                    size="sm" 
                    onClick={handleStart} 
                    className="mt-3 h-8 text-xs bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all"
                >
                    <Play className="w-3 h-3 mr-2 fill-current" /> Initialize Focus
                </Button>
            )}

            {/* --- SECTION: ADD SUBTASK INPUT --- */}
            {showSubtaskInput && (
                <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <CornerDownRight className="w-5 h-5 text-slate-600 mt-2" />
                    <Input 
                        placeholder="Subtask title..." 
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                        className="h-9 bg-slate-950/50 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:ring-indigo-500/50"
                        autoFocus
                    />
                    <Button 
                        size="sm" 
                        onClick={handleAddSubtask}
                        disabled={loadingSubtask}
                        className="bg-white text-black hover:bg-slate-200"
                    >
                        Add
                    </Button>
                </div>
            )}

            {/* --- SECTION: ACTIVITY LOG --- */}
            {showUpdates && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <TaskUpdates taskId={task._id} updates={task.updates} onUpdateAdded={onUpdate} />
                </div>
            )}
            
            {/* --- SECTION: RECURSIVE SUBTASKS LIST --- */}
            {task.subtasks?.length > 0 && (
                <div className="mt-4 pl-4 border-l border-white/10 space-y-3">
                    {task.subtasks.map(sub => (
                        <TaskItem key={sub._id} task={sub} onUpdate={onUpdate} />
                    ))}
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}