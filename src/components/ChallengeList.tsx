import { Challenge } from "../types";
import { Award, CheckCircle2, Circle, Flame, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChallengeListProps {
  challenges: (Challenge & { completed?: boolean })[];
  onComplete: (challengeId: string) => Promise<void>;
  isCompleting: string | null;
}

export default function ChallengeList({ challenges, onComplete, isCompleting }: ChallengeListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
  };

  return (
    <div className="apple-glass p-6 md:p-8 shadow-2xl h-full flex flex-col justify-between relative overflow-hidden">
      {/* Decorative reflection line */}
      <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/8 to-transparent"></div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl shadow-inner">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block mb-0.5">DAILY STEPS</span>
              <h3 className="text-xl font-bold text-white tracking-tight">Active Challenges</h3>
              <p className="text-slate-400 text-xs mt-0.5">Transform daily lifestyle choices into atomic carbon saving actions.</p>
            </div>
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3 max-h-[380px] overflow-y-auto pr-1"
        >
          {challenges.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-white/5 bg-slate-900/10 rounded-2xl">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No goals loaded.</p>
              <p className="text-slate-500 text-xs mt-1">Check back later or register a new active workspace.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {challenges.map((c) => {
                const isChallengeCompleting = isCompleting === c.id;
                return (
                  <motion.div
                    key={c.id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, x: -15, transition: { duration: 0.2 } }}
                    className={`group flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                      c.completed
                        ? "bg-slate-950/20 border-white/5 opacity-55"
                        : "bg-slate-900/40 border-white/6 hover:border-emerald-500/20 hover:bg-slate-900/60 shadow-sm"
                    }`}
                  >
                    <div className="flex gap-3.5 min-w-0">
                      <button
                        type="button"
                        disabled={!!c.completed || isChallengeCompleting}
                        onClick={() => onComplete(c.id)}
                        aria-label={c.completed ? `${c.title} already completed` : `Mark challenge "${c.title}" as completed`}
                        className="mt-0.5 text-slate-500 hover:text-emerald-400 disabled:text-emerald-400 transition-colors shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 cursor-pointer"
                      >
                        {c.completed ? (
                          <CheckCircle2 className="w-5.5 h-5.5 text-emerald-400 stroke-[2.25]" />
                        ) : (
                          <Circle className="w-5.5 h-5.5 hover:scale-110 transition-transform stroke-[1.75]" />
                        )}
                      </button>
                      
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs font-bold leading-tight ${c.completed ? "line-through text-slate-500" : "text-white"}`}>
                            {c.title}
                          </h4>
                          <span
                            className={`text-[9px] font-mono leading-none px-2 py-0.5 rounded ${
                              c.category === "Transport"
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/15"
                                : c.category === "Energy"
                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/15"
                                : c.category === "Food"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/15"
                            }`}
                          >
                            {c.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 text-pretty leading-relaxed">{c.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2.5 shrink-0 ml-2">
                      <span className="text-xs font-mono font-bold text-amber-400">+{c.points_reward} PTS</span>
                      {!c.completed && (
                        <button
                          type="button"
                          disabled={isChallengeCompleting}
                          onClick={() => onComplete(c.id)}
                          aria-label={`Mark challenge "${c.title}" as completed`}
                          className="px-3 py-1 text-[10px] font-bold font-sans uppercase rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 active:scale-95 transition-all text-center border border-emerald-500/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        >
                          {isChallengeCompleting ? (
                            <span className="inline-block animate-bounce font-mono">...</span>
                          ) : "Done"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      <div className="mt-6 pt-5 border-t border-white/5 flex items-center gap-3 text-[11px] text-slate-400 leading-relaxed font-sans">
        <Award className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>Completing daily goals awards immediate points and is reflected in active analytics.</span>
      </div>
    </div>
  );
}
