"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import TaskItem from "@/components/TaskItem";
import ActiveTaskDock from "@/components/ActiveTaskDock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, LogOut, Sparkles, Zap, Command } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [timeUnit, setTimeUnit] = useState("minutes");
  const [loading, setLoading] = useState(false);

  // Active Task Logic
  const activeTask = tasks.find(t => t.startTime && !t.isCompleted);

  const fetchTasks = async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        // Ensure sorting happens on frontend too just in case
        setTasks(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (session) fetchTasks(); }, [session]);

  const addTask = async () => {
    if (!newTask.trim()) return;
    setLoading(true);
    
    let multiplier = 1;
    if (timeUnit === "hours") multiplier = 60;
    if (timeUnit === "days") multiplier = 1440;
    if (timeUnit === "weeks") multiplier = 10080;

    const finalMinutes = timeValue ? parseInt(timeValue) * multiplier : 0;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask, timeLimit: finalMinutes }),
    });
    setNewTask("");
    setTimeValue("");
    setLoading(false);
    fetchTasks();
  };

  const handleDockComplete = async (taskId) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: true }),
    });
    fetchTasks();
  };

  if (status === "loading") return <div className="h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500 w-8 h-8"/></div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>
        
        <div className="relative z-10 text-center space-y-8 p-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_50px_-10px_rgba(99,102,241,0.5)] animate-in zoom-in duration-500">
                <Zap className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold text-white tracking-tight">Focus<span className="text-indigo-400">OS</span></h1>
              <p className="text-slate-400 mt-4 text-lg">Next-gen task management for high performers.</p>
            </div>
            <Button size="lg" onClick={() => signIn("google")} className="bg-white text-slate-950 hover:bg-slate-200 font-bold h-12 px-8 rounded-full">
                Get Started
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 pb-40">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl px-6 py-4 flex justify-between items-center sticky top-0">
         <div className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"><Zap className="w-5 h-5 text-white"/></div>
            FocusOS
         </div>
         <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-white">{session.user.name}</span>
                <span className="text-xs text-slate-500">Pro Member</span>
             </div>
             <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-slate-400 hover:text-white hover:bg-white/10">
                 <LogOut className="w-5 h-5" />
             </Button>
         </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h2 className="text-4xl font-bold text-white mb-2">Workspace</h2>
                <p className="text-slate-400 flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-yellow-500" /> 
                   You have {tasks.filter(t => !t.isCompleted).length} active missions today.
                </p>
            </div>
            <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Current Focus</p>
                <p className="text-2xl font-mono text-white">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
        </div>

        {/* The Glass Input Bar */}
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex flex-col md:flex-row gap-2">
                <div className="flex-grow flex items-center px-4">
                    <Command className="w-5 h-5 text-slate-500 mr-3" />
                    <Input 
                        placeholder="Type a new mission..." 
                        value={newTask} 
                        onChange={e => setNewTask(e.target.value)}
                        className="border-0 bg-transparent shadow-none text-lg h-12 focus-visible:ring-0 text-white placeholder:text-slate-500"
                        onKeyDown={e => e.key === 'Enter' && addTask()}
                    />
                </div>
                
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/5">
                    <Input 
                        type="number" 
                        placeholder="Time" 
                        className="w-20 border-0 bg-transparent shadow-none focus-visible:ring-0 text-white text-center"
                        value={timeValue}
                        onChange={e => setTimeValue(e.target.value)}
                    />
                    <Select value={timeUnit} onValueChange={setTimeUnit}>
                        <SelectTrigger className="w-[100px] border-0 bg-transparent shadow-none focus:ring-0 text-slate-300">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-300">
                            <SelectItem value="minutes">Mins</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <Button onClick={addTask} disabled={loading} size="lg" className="h-14 md:h-auto px-8 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 rounded-lg">
                   {loading ? <Loader2 className="animate-spin"/> : <Plus />}
                </Button>
            </div>
        </div>

        {/* Task Grid */}
        <div className="space-y-4">
            {tasks.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400">System idle. Initiate a task to begin.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {tasks.map(task => (
                        <TaskItem key={task._id} task={task} onUpdate={fetchTasks} />
                    ))}
                </div>
            )}
        </div>
      </main>

      {/* The Active Dock */}
      <ActiveTaskDock activeTask={activeTask} onComplete={handleDockComplete} />
    </div>
  );
}