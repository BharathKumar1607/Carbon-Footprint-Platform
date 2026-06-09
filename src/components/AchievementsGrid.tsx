import React from "react";
import { User, Footprint } from "../types";
import { Award, Shield, Sparkles, Zap, Flame, Heart, Compass, Check } from "lucide-react";
import { motion } from "motion/react";

interface AchievementsGridProps {
  user: User;
  footprints: Footprint[];
  challengesCompleted: number;
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  textColor: string;
  glowColor: string;
  unlocked: boolean;
  requirement: string;
}

export default function AchievementsGrid({ user, footprints, challengesCompleted }: AchievementsGridProps) {
  const latestFootprint = footprints.length > 0 ? footprints[footprints.length - 1] : null;

  const badges: Badge[] = [
    {
      id: "b1",
      title: "First Step",
      description: "Signed up and initiated personal carbon analytics profile.",
      icon: Compass,
      color: "bg-radial from-sky-400 to-indigo-600",
      textColor: "text-indigo-400",
      glowColor: "rgba(56, 189, 248, 0.2)",
      unlocked: true,
      requirement: "Complete account creation"
    },
    {
      id: "b2",
      title: "Green Pioneer",
      description: "Logged your first monthly footprint stats for computing CO₂ loads.",
      icon: Sparkles,
      color: "bg-radial from-emerald-400 to-teal-600",
      textColor: "text-emerald-400",
      glowColor: "rgba(16, 185, 129, 0.2)",
      unlocked: footprints.length > 0,
      requirement: "Submit 1st footprint record"
    },
    {
      id: "b3",
      title: "Action Taker",
      description: "Checked off your first daily action challenge to earn points.",
      icon: Zap,
      color: "bg-radial from-amber-300 to-orange-500",
      textColor: "text-amber-400",
      glowColor: "rgba(245, 158, 11, 0.2)",
      unlocked: challengesCompleted > 0,
      requirement: "Complete 1 sustainability goal"
    },
    {
      id: "b4",
      title: "Plant Ally",
      description: "Swapped to a low-impact vegetable or vegan dietary profile.",
      icon: Heart,
      color: "bg-radial from-rose-400 to-pink-600",
      textColor: "text-rose-400",
      glowColor: "rgba(244, 63, 94, 0.2)",
      unlocked: latestFootprint ? latestFootprint.inputs.diet === "veg" : false,
      requirement: "Log vegetarian/vegan diet profile"
    },
    {
      id: "b5",
      title: "Clean Commuter",
      description: "Recorded a transport footprint under 1.0 metric tons.",
      icon: Shield,
      color: "bg-radial from-purple-400 to-fuchsia-600",
      textColor: "text-purple-400",
      glowColor: "rgba(192, 132, 252, 0.2)",
      unlocked: latestFootprint ? (latestFootprint.transport_co2 < 1.0 && latestFootprint.transport_co2 > 0) : false,
      requirement: "Transport CO₂ under 1.0T"
    },
    {
      id: "b6",
      title: "Eco Champion",
      description: "Reached maximum gamification tier with cumulative sustainable actions.",
      icon: Award,
      color: "bg-radial from-yellow-300 to-amber-500",
      textColor: "text-amber-300",
      glowColor: "rgba(253, 224, 71, 0.2)",
      unlocked: user.points >= 500,
      requirement: "Amass 500+ XP Points"
    }
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div id="achievements-section" className="apple-glass p-6 md:p-8 relative overflow-hidden shadow-2xl">
      {/* Decorative reflection line */}
      <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-yellow-400 rounded-2xl shadow-inner">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase block mb-0.5">COLLECTIBLES</span>
            <h3 className="text-xl font-bold text-white tracking-tight">Sustainability Badges</h3>
            <p className="text-slate-400 text-xs mt-0.5">Unlock levels and achievements with persistent green deeds.</p>
          </div>
        </div>

        <div className="self-start sm:self-center px-4 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 font-semibold font-mono text-xs rounded-full border border-emerald-500/20 shadow-sm shrink-0">
          {unlockedCount} / {badges.length} Badges Unlocked
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.id}
              variants={itemVariants}
              whileHover={badge.unlocked ? { scale: 1.02, y: -2, transition: { duration: 0.2 } } : {}}
              className={`relative rounded-3xl border p-5 transition-all duration-300 overflow-hidden ${
                badge.unlocked
                  ? "bg-slate-900/40 border-white/8 hover:border-emerald-500/35 hover:shadow-[0_10px_30px_rgba(16,185,129,0.04)]"
                  : "bg-slate-950/20 border-white/5 opacity-40 select-none"
              }`}
              style={{
                boxShadow: badge.unlocked ? `0 4px 20px -5px ${badge.glowColor}` : 'none'
              }}
            >
              {/* Internal subtle lighting on unlocked cards */}
              {badge.unlocked && (
                <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-10 ${badge.color}`}></div>
              )}

              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-2xl shrink-0 flex items-center justify-center transition-all ${
                    badge.unlocked
                      ? `${badge.color} text-slate-950 shadow-md shadow-emerald-500/5`
                      : "bg-slate-800 border border-white/5 text-slate-500"
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.25]" />
                </div>
                
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white tracking-tight truncate">{badge.title}</h4>
                    {badge.unlocked ? (
                      <span className="p-0.5 bg-emerald-500/10 text-emerald-400 rounded-full shrink-0 border border-emerald-500/20">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono font-bold text-slate-500 tracking-wider">LOCKED</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{badge.description}</p>
                  
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/5 mt-2">
                    <span className="text-[9px] text-slate-500 font-mono tracking-wide truncate">
                      REQ: {badge.requirement}
                    </span>
                    {badge.unlocked && (
                      <span className="text-[9px] font-mono font-bold text-emerald-500/80 shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
