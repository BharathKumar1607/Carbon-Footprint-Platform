import React, { useState, useEffect } from "react";
import { Goal } from "../types";
import { PlusCircle, Target, Trash2, Calendar, CheckCircle2, AlertCircle, Sparkles, TrendingDown, RefreshCw } from "lucide-react";
import AccessibleModal from "./AccessibleModal";
import { motion, AnimatePresence } from "motion/react";

interface GoalTrackerProps {
  userId: string;
  latestFootprintCount: number;
  triggerRefresh: boolean;
  onGoalChange?: () => void;
}

export default function GoalTracker({ userId, latestFootprintCount, triggerRefresh, onGoalChange }: GoalTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Goal fields
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState<Goal["category"]>("Overall");
  const [targetValue, setTargetValue] = useState("");
  const [deadlineDays, setDeadlineDays] = useState("30");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/goals?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (err) {
      console.error("Failed to load goals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadGoals();
    }
  }, [userId, triggerRefresh]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetValue || isNaN(parseFloat(targetValue)) || parseFloat(targetValue) <= 0) {
      setError("Please specify a valid numeric CO2 value.");
      return;
    }
    
    setSubmitting(true);
    setError("");

    try {
      // Calculate due date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(deadlineDays));

      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          category,
          targetValue: parseFloat(targetValue),
          deadline: futureDate.toISOString()
        })
      });

      if (res.ok) {
        setTargetValue("");
        setShowAddForm(false);
        loadGoals();
        if (onGoalChange) onGoalChange();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create target goal.");
      }
    } catch (err) {
      setError("Server query timeout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadGoals();
        if (onGoalChange) onGoalChange();
      }
    } catch (err) {
      console.error("Failed to delete goal", err);
    }
  };

  return (
    <div id="goal-tracker-section" className="apple-glass p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
      {/* Reflection border */}
      <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/8 to-transparent"></div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/15 text-emerald-400 rounded-2xl shadow-inner">
              <Target className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block mb-0.5">CEILINGS</span>
              <h3 className="text-xl font-bold text-white tracking-tight">Active Reduction Targets</h3>
              <p className="text-slate-400 text-xs mt-0.5">Define carbon caps to track and regulate footprint limits.</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={showAddForm}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Goal</span>
          </button>
        </div>

        {/* Add Goal Dialog Modal */}
        <AccessibleModal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          title="Configure Climate Goal Target"
          description="Establish specific constraints to evaluate carbon performance indicators on active logs."
        >
          <form onSubmit={handleAddGoal} className="space-y-4 pt-2">
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="goal-category" className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  id="goal-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Goal["category"])}
                  className="bg-[#0b0f19] border border-white/8 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-transparent cursor-pointer"
                >
                  <option value="Overall">Overall Footprint</option>
                  <option value="Transport">Transport CO₂</option>
                  <option value="Energy">Energy CO₂</option>
                  <option value="Food">Food dietary CO₂</option>
                  <option value="Lifestyle">Lifestyle carbon CO₂</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="goal-limit" className="text-xs font-semibold text-slate-300">Target Ceiling (Tons CO₂/year)</label>
                <input
                  id="goal-limit"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="bg-[#0b0f19] border border-white/8 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="goal-deadline" className="text-xs font-semibold text-slate-300">Target Deadline Window</label>
                <select
                  id="goal-deadline"
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(e.target.value)}
                  className="bg-[#0b0f19] border border-white/8 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-transparent cursor-pointer"
                >
                  <option value="7">Next 7 Days (Micro-goal)</option>
                  <option value="14">Next 14 Days (Habit building)</option>
                  <option value="30">Next 30 Days (Standard cycle)</option>
                  <option value="90">Next 90 Days (Quarterly carbon balance)</option>
                </select>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-mono" role="alert">{error}</p>}

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-500/10"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>{submitting ? "Locking target..." : "Lock Target Goal"}</span>
              </button>
            </div>
          </form>
        </AccessibleModal>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-900/10 border border-dashed border-white/5 rounded-2xl p-6">
            <Target className="w-8 h-8 text-slate-600 mb-3" />
            <p className="text-slate-400 text-xs font-semibold">No active emission ceilings configured.</p>
            <p className="text-slate-500 text-[10px] mt-1 font-mono">Create carbon ceilings above to monitor targets instantly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {goals.map((goal) => {
                const diffValue = goal.targetValue - goal.currentValue;
                const achieved = goal.completed;
                const ratio = Math.min(100, (goal.currentValue / goal.targetValue) * 100);

                return (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`relative rounded-2xl border p-5 bg-slate-900/20 transition-all duration-300 hover:border-slate-800 flex flex-col justify-between ${
                      achieved
                        ? "border-emerald-500/15 hover:border-emerald-500/25 shadow-md shadow-emerald-500/[0.01]"
                        : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    {/* Header elements */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-mono font-bold rounded-md tracking-wider uppercase border ${
                            goal.category === "Transport"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/15"
                              : goal.category === "Energy"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/15"
                              : goal.category === "Food"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                              : goal.category === "Overall"
                              ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/15"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/15"
                          }`}
                        >
                          {goal.category} CAP
                        </span>
                        <h4 className="text-xs font-bold text-white tracking-tight leading-tight truncate">
                          {goal.category === "Overall" ? "Cumulative Ceiling" : `${goal.category} Target`}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-900/50 hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-white/5 hover:border-red-500/15 transition-all cursor-pointer shrink-0"
                        title="Remove goal target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Meter progress bar */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Current: <strong className={achieved ? 'text-emerald-400' : 'text-slate-300'}>{goal.currentValue.toFixed(1)}T</strong></span>
                        <span>Threshold: <strong className="text-slate-200">{goal.targetValue.toFixed(1)}T</strong></span>
                      </div>

                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
                        <div
                          className={`h-full transition-all duration-1000 rounded-full ${
                            achieved
                              ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                              : ratio > 90
                              ? "bg-gradient-to-r from-red-500 to-orange-500 animate-pulse"
                              : "bg-gradient-to-r from-yellow-500 to-amber-400"
                          }`}
                          style={{ width: `${ratio}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer labels */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>DUE: {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>

                      {achieved ? (
                        <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ON TRACK</span>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-1 font-bold font-mono text-[9px] px-2 py-0.5 rounded border ${
                          diffValue > 0 ? "text-amber-400 bg-amber-500/10 border-amber-500/15" : "text-red-400 bg-red-500/10 border-red-500/15"
                        }`}>
                          <AlertCircle className="w-3 h-3" />
                          <span>{diffValue > 0 ? `${diffValue.toFixed(1)}T MARGIN` : `${Math.abs(diffValue).toFixed(1)}T OVER`}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
