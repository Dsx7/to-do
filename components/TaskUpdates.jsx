"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Activity } from "lucide-react";

export default function TaskUpdates({ taskId, updates, onUpdateAdded }) {
  const [newUpdate, setNewUpdate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/tasks/${taskId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newUpdate }),
      });
      setNewUpdate("");
      onUpdateAdded();
    } catch (error) {
      console.error("Failed to add update", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 bg-slate-50 p-3 rounded-lg border">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
        <Activity className="w-3 h-3 mr-2" /> Activity Log
      </h4>
      
      <ScrollArea className="h-[150px] w-full rounded-md border bg-white p-4 mb-3">
        {updates && updates.length > 0 ? (
          updates.map((update, index) => (
            <div key={index} className="mb-3 last:mb-0">
              <p className="text-sm text-slate-800">{update.content}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 text-center italic">No updates yet.</p>
        )}
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          placeholder="Log an update (e.g. Server down)..."
          value={newUpdate}
          onChange={(e) => setNewUpdate(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddUpdate()}
          className="bg-white"
        />
        <Button size="icon" onClick={handleAddUpdate} disabled={loading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}