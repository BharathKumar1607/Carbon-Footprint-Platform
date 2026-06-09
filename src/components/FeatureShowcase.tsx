import React from "react";
import { Leaf, Cpu, Award, Zap, Shield, ArrowRight } from "lucide-react";

export default function FeatureShowcase() {
  const features = [
    {
      icon: Leaf,
      color: "text-emerald-400 bg-emerald-500/10",
      title: "Real-Time Tracking Insights",
      description: "Instantly calibrate travel distance and utility usage through interactive sliders that translate parameters directly into global standard CO₂ ratings."
    },
    {
      icon: Cpu,
      color: "text-blue-400 bg-blue-500/10",
      title: "Gemini AI Advisor Engine",
      description: "Receive deep cognitive recommendations calibrated by Google Gemini. Our engine inspects your footprint trends to formulate realistic ecological advice."
    },
    {
      icon: Zap,
      color: "text-yellow-400 bg-yellow-500/10",
      title: "Impact Gamification",
      description: "Turn ecological actions into fun milestones. Earn experience points, unlock achievement badges, and climb ranks from Beginner to Eco Champion."
    },
    {
      icon: Shield,
      color: "text-purple-400 bg-purple-500/10",
      title: "Verified Action Scenarios",
      description: "Check off micro-sustainability challenges spanning food selections, transport habits, and energy conservation, resulting in measurable point rewards."
    }
  ];

  return (
    <section className="py-16 border-t border-white/5 apple-glass p-8 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto text-center mb-12 space-y-3">
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono rounded-full uppercase tracking-widest">
          Platform Architecture
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Supercharged Carbon Intelligence
        </h3>
        <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto">
          We combine cutting-edge emissions data modeling with intelligent neural suggestions to make sustainable living simple, quantifiable, and fun.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {features.map((feat, index) => {
          const Icon = feat.icon;
          return (
            <div
              key={index}
              className="bg-slate-950/20 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 hover:bg-slate-955/40 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                    {feat.title}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans">
                    {feat.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
