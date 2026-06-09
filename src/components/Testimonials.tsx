import React from "react";
import { Quote, Sparkles } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl: string;
  co2Saved: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      quote: "EcoTrack AI transformed how we gamify carbon reduction at our venture fund. The Gemini integration makes suggestions feel personal and realistic instead of just a standard generic template.",
      author: "Sarah Jenkins",
      role: "Managing Partner",
      company: "GreenFuture Ventures",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      co2Saved: "1.8 Tons CO₂ Offset Saved"
    },
    {
      quote: "As a daily commuter, I hovered over heavy emissions. The Challenge List prompted me to cycle twice a week, raising my rank to Eco Champion! The points dynamic represents a powerful habit trigger.",
      author: "Marcus Chen",
      role: "Lead Software Architect",
      company: "SustainablyTech",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      co2Saved: "0.9 Tons CO₂ Saved Monthly"
    },
    {
      quote: "I tested multiple calculators but this UI is outstanding - no clutter, delightful dark theme, and high precision. Highly recommended for eco-conscious startup builders.",
      author: "Elena Rostova",
      role: "Founder & CMO",
      company: "ApexCarbon Applets",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      co2Saved: "2.4 Cumulative Tons Saved"
    }
  ];

  return (
    <section className="py-12 border-t border-white/5">
      <div className="text-center mb-10 space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          EcoTrack Social Proof
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          What Sustainability Advocates Say
        </h3>
        <p className="text-slate-400 text-xs">
          Venture stakeholders, technology builders, and ecological leaders trust modern metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((entry, idx) => (
          <div
            key={idx}
            className="bg-slate-950/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-between relative hover:border-white/10 transition-colors"
          >
            <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5 pointer-events-none" />

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                "{entry.quote}"
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
              <img
                src={entry.avatarUrl}
                alt={entry.author}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-[#10b981]/40 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate leading-tight">
                  {entry.author}
                </h4>
                <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                  {entry.role}, <span className="text-[#10b981]">{entry.company}</span>
                </p>
                <span className="inline-block mt-1 text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-semibold px-2 py-0.5 rounded-full">
                  {entry.co2Saved}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
