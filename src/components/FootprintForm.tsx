import React, { useState } from "react";
import { Leaf, Car, Zap, Utensils, Compass } from "lucide-react";
import { motion } from "motion/react";

interface FootprintFormProps {
  onSubmit: (data: { km: number; kwh: number; diet: string; lifestyle: number }) => Promise<void>;
  isSubmitting: boolean;
}

export default function FootprintForm({ onSubmit, isSubmitting }: FootprintFormProps) {
  const [km, setKm] = useState<number>(3000);
  const [kwh, setKwh] = useState<number>(350);
  const [diet, setDiet] = useState<string>("mixed");
  const [lifestyle, setLifestyle] = useState<number>(3); // scale 1-5

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ km, kwh, diet, lifestyle });
  };

  return (
    <div className="apple-glass p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Visual background splash */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-3.5 mb-6">
        <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/15 text-emerald-400 rounded-2xl">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block mb-0.5">TELEMETRY LOGGER</span>
          <h3 className="text-xl font-bold text-white tracking-tight">Log Carbon Footprint</h3>
          <p className="text-slate-400 text-xs">Enter monthly diagnostics to calibrate environmental benchmarks.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Distance Field */}
        <div className="space-y-3">
          <label htmlFor="travel-km" className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-2">
              <Car className="w-4 h-4 text-sky-400 stroke-[2]" />
              Monthly Travel
            </span>
            <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/15">
              {km.toLocaleString()} km
            </span>
          </label>
          <div className="relative pt-1">
            <input
              id="travel-km"
              type="range"
              min="0"
              max="12000"
              step="100"
              value={km}
              onChange={(e) => setKm(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-900 border border-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 px-0.5">
              <span>0 (Cyclist)</span>
              <span>6,000 (Average)</span>
              <span>12,000+ (Transit Heavy)</span>
            </div>
          </div>
        </div>

        {/* Electricity Field */}
        <div className="space-y-3">
          <label htmlFor="electricity-kwh" className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400 stroke-[2]" />
              Electricity Draw
            </span>
            <span className="font-mono text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-0.5 rounded-full border border-yellow-400/15">
              {kwh} kWh
            </span>
          </label>
          <div className="relative pt-1">
            <input
              id="electricity-kwh"
              type="range"
              min="0"
              max="1500"
              step="20"
              value={kwh}
              onChange={(e) => setKwh(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-900 border border-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 px-0.5">
              <span>Off-Grid</span>
              <span>500 kWh (Avg Apt)</span>
              <span>1,500 kWh (Estate)</span>
            </div>
          </div>
        </div>

        {/* Diet Choice Radio Selection */}
        <div className="space-y-3">
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Utensils className="w-4 h-4 text-emerald-400 stroke-[2]" />
            Dietary Profile
          </span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Dietary Profile Selection">
            {[
              { id: "veg", label: "Vegan / Veg", desc: "Low impact", factor: "1.5T CO₂/yr" },
              { id: "mixed", label: "Mixed Diet", desc: "Balanced", factor: "2.2T CO₂/yr" },
              { id: "meat", label: "Heavy Meat", desc: "High protein", factor: "3.3T CO₂/yr" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={diet === option.id}
                onClick={() => setDiet(option.id)}
                className={`p-3 rounded-2xl border text-left transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 cursor-pointer ${
                  diet === option.id
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-sm"
                    : "bg-slate-950/30 border-white/5 text-slate-400 hover:border-white/10 hover:bg-slate-900/40"
                }`}
              >
                <div className="text-xs font-bold font-sans tracking-tight leading-tight">{option.label}</div>
                <div className="text-[9px] mt-0.5 opacity-80 leading-normal truncate">{option.desc}</div>
                <div className="text-[10px] font-mono mt-2 font-bold text-slate-400 opacity-90">{option.factor}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Lifestyle Plastic Rating */}
        <div className="space-y-3">
          <span className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400 stroke-[2]" />
              Lifestyle Intensity Index
            </span>
            <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/15">
              Tier {lifestyle} / 5
            </span>
          </span>
          <div className="flex gap-1.5" role="radiogroup" aria-label="Lifestyle and Consumption Index Level">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={lifestyle === level}
                onClick={() => setLifestyle(level)}
                className={`flex-1 py-2 text-center rounded-xl font-bold text-xs transition-all focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer ${
                  lifestyle === level
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/10"
                    : lifestyle > level
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 hover:bg-emerald-500/25"
                    : "bg-slate-950/30 border border-white/5 text-slate-500 hover:bg-slate-900/40 hover:text-slate-400"
                }`}
              >
                {level === 1 ? "Min" : level === 3 ? "Mid" : level === 5 ? "Max" : level}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 leading-normal italic">
            *Determined by fast fashion, plastics, single-use containers, and packaging.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.985 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 text-slate-950 font-bold bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 disabled:bg-slate-800 disabled:text-slate-500 py-3 rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/10"
        >
          {isSubmitting ? "Compiling Diagnostics..." : "Calculate and Log Footprint (+25 XP)"}
        </motion.button>
      </form>
    </div>
  );
}
