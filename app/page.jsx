"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import TaskItem from "@/components/TaskItem";
import ActiveTaskDock from "@/components/ActiveTaskDock"; // The New Hero
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Plus, LogOut, LayoutGrid, Zap } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [timeUnit, setTimeUnit] = useState("minutes");
  const [loading, setLoading] = useState(false);

  // Find the currently active task (Most recently started that isn't done)
  const activeTask = tasks.find(t => t.startTime && !t.isCompleted);

  const fetchTasks = async () => {
    if (status !== "authenticated") return;
    try {
        const res = await fetch("/api/tasks");
        if(res.ok) setTasks(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (session) fetchTasks(); }, [session]);

  const addTask = async () => {
    if (!newTask.trim()) return;
    setLoading(true);
    
    // Time Conversion Logic
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

  // Handle dock completion
  const handleDockComplete = async (taskId) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: true }),
    });
    fetchTasks();
  };

  if (status === "loading") return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600"/></div>;

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]">
                <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold">FocusOS</h1>
            <p className="text-slate-400">The operating system for your productivity.</p>
            <Button size="lg" onClick={() => signIn("google")} className="bg-white text-slate-900 hover:bg-slate-200">
                Sign In with Google
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32"> {/* pb-32 adds padding for the dock */}
      
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
         <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Zap className="w-5 h-5"/></div>
            FocusOS
         </div>
         <div className="flex items-center gap-4">
             <span className="text-sm text-slate-500 hidden md:inline">Logged in as {session.user.name}</span>
             <Button variant="ghost" size="sm" onClick={() => signOut()}>
                 <LogOut className="w-4 h-4" />
             </Button>
         </div>
      </nav>

      <main className="max-w-3xl mx-auto p-6 space-y-8">
        
        {/* Greeting */}
        <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900">Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}, {session.user.name.split(' ')[0]}.</h2>
            <p className="text-slate-500">You have {tasks.filter(t => !t.isCompleted).length} tasks pending today.</p>
        </div>

        {/* Input Area */}
        <Card className="border-0 shadow-lg shadow-indigo-100 overflow-hidden">
            <div className="flex flex-col md:flex-row p-2 gap-2 bg-white">
                <Input 
                    placeholder="Add a new task..." 
                    value={newTask} 
                    onChange={e => setNewTask(e.target.value)}
                    className="border-0 shadow-none text-lg h-12 focus-visible:ring-0"
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                />
                <div className="flex gap-2 items-center bg-slate-50 rounded-lg p-1 border md:border-0">
                    <Input 
                        type="number" 
                        placeholder="Time" 
                        className="w-20 border-0 bg-transparent shadow-none focus-visible:ring-0"
                        value={timeValue}
                        onChange={e => setTimeValue(e.target.value)}
                    />
                    <Select value={timeUnit} onValueChange={setTimeUnit}>
                        <SelectTrigger className="w-[100px] border-0 bg-transparent shadow-none focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="minutes">Mins</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={addTask} disabled={loading} size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-12">
                   {loading ? <Loader2 className="animate-spin"/> : <Plus />}
                </Button>
            </div>
        </Card>

        {/* Task List */}
        <div className="space-y-1">
            {tasks.length === 0 ? (
                <div className="text-center py-20">
                    <LayoutGrid className="w-12 h-12 text-slate-200 mx-auto mb-4"/>
                    <p className="text-slate-400">All clear! Add a task to get started.</p>
                </div>
            ) : (
                tasks.map(task => (
                    <TaskItem key={task._id} task={task} onUpdate={fetchTasks} />
                ))
            )}
        </div>
      </main>

      {/* THE UNIQUE HERO FEATURE */}
      <ActiveTaskDock activeTask={activeTask} onComplete={handleDockComplete} />

    </div>
  );
}