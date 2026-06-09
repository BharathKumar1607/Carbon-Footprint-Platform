import React, { useState } from "react";
import { Leaf, Car, Zap, Utensils, Compass, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OnboardingWizardProps {
  username: string;
  onComplete: (data: { km: number; kwh: number; diet: string; lifestyle: number }) => void;
}

export default function OnboardingWizard({ username, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [km, setKm] = useState<number>(3000);
  const [kwh, setKwh] = useState<number>(350);
  const [diet, setDiet] = useState<string>("mixed");
  const [lifestyle, setLifestyle] = useState<number>(3);

  const nextStep = () => setStep((s) => Math.min(5, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = () => {
    onComplete({ km, kwh, diet, lifestyle });
  };

  const stepVariants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 30 : -30,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 350, damping: 28 }
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -30 : 30,
      transition: { duration: 0.15 }
    })
  };

  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    setDirection(1);
    nextStep();
  };

  const handlePrev = () => {
    setDirection(-1);
    prevStep();
  };

  return (
    <div className="max-w-2xl mx-auto my-12 apple-glass p-8 md:p-10 shadow-2xl relative overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-10">
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="flex-1 flex items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all relative ${
                step >= num
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold scale-110 shadow-lg shadow-emerald-500/10"
                  : "bg-slate-900 text-slate-500 border border-white/6"
              }`}
            >
              {step > num ? <Check className="w-4 h-4 text-slate-950 stroke-[3]" /> : num}
              <span className="absolute -bottom-6 text-[9px] text-slate-500 font-mono tracking-wider hidden sm:inline whitespace-nowrap">
                {num === 1 ? "WELCOME" : num === 2 ? "TRANSIT" : num === 3 ? "ENERGY" : num === 4 ? "DIET" : "HABITS"}
              </span>
            </div>
            {num < 5 && (
              <div
                className={`flex-1 h-[2px] mx-2 transition-all duration-300 ${
                  step > num ? "bg-emerald-500/40" : "bg-slate-900"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <div className="min-h-[280px] flex flex-col justify-center relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {step === 1 && (
              <div className="space-y-4">
                <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <Leaf className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
                    Welcome to EcoTrack AI, {username}!
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed font-sans text-balance">
                    We'll guide you through a brief calibration wizard to calculate your starting ecological metrics, build your customized reduction ceilings, and unlock active XP badges. Let's begin creating your path towards net-zero.
                  </p>
                </div>
                <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/6 text-[11px] text-slate-400 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                  <span>Completing baseline profiles instantly awards you <strong>+50 Sustainability XP</strong> points.</span>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/15">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-sky-400 font-bold block">SECTION 01</span>
                    <label id="wizard-km-label" htmlFor="wizard-km" className="text-lg font-bold text-white block leading-tight">Travel & Mobility Metrics</label>
                    <p className="text-slate-400 text-xs">Estimate your cumulative monthly driving, flights, or transit kilometers.</p>
                  </div>
                </div>

                <div className="space-y-5 pt-2">
                  <div className="bg-[#05080e]/40 border border-white/5 rounded-2xl p-5 text-center relative">
                    <span className="text-4xl font-mono font-extrabold text-sky-400 tracking-tight">{km.toLocaleString()}</span>
                    <span className="text-slate-500 text-sm font-semibold ml-2">km / month</span>
                  </div>

                  <div className="space-y-1">
                    <input
                      id="wizard-km"
                      type="range"
                      min="0"
                      max="12000"
                      step="100"
                      value={km}
                      aria-labelledby="wizard-km-label"
                      onChange={(e) => setKm(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-900 border border-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>0 km (Non-motorized)</span>
                      <span>6K km (Standard)</span>
                      <span>12K+ km (Heavy commute)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-2xl border border-yellow-500/15">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-yellow-500 font-bold block">SECTION 02</span>
                    <label id="wizard-kwh-label" htmlFor="wizard-kwh" className="text-lg font-bold text-white block leading-tight">Home Utility Draws</label>
                    <p className="text-slate-400 text-xs">Your approximate household monthly energy footprint.</p>
                  </div>
                </div>

                <div className="space-y-5 pt-2">
                  <div className="bg-[#05080e]/40 border border-white/5 rounded-2xl p-5 text-center relative">
                    <span className="text-4xl font-mono font-extrabold text-yellow-400 tracking-tight">{kwh}</span>
                    <span className="text-slate-500 text-sm font-semibold ml-2">kWh / month</span>
                  </div>

                  <div className="space-y-1">
                    <input
                      id="wizard-kwh"
                      type="range"
                      min="0"
                      max="1500"
                      step="20"
                      value={kwh}
                      aria-labelledby="wizard-kwh-label"
                      onChange={(e) => setKwh(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-900 border border-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>0 kwh (Off-grid)</span>
                      <span>500 kwh (Avg Apartment)</span>
                      <span>1500 kwh (Estate Heating)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/15">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-emerald-400 font-bold block">SECTION 03</span>
                    <h3 className="text-lg font-bold text-white block leading-tight">Dietary Preferences</h3>
                    <p className="text-slate-400 text-xs text-balance">Crops, global freighting, and proteins weigh heavily in environmental coefficients.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2" role="radiogroup" aria-label="Dietary Standard Selection">
                  {[
                    { id: "veg", title: "Vegan / Vegetarian", desc: "Minimal agricultural impact", factor: "1.5T CO₂ / year" },
                    { id: "mixed", title: "Mixed Diet", desc: "Standard protein logistics", factor: "2.2T CO₂ / year" },
                    { id: "meat", title: "Heavy Meat", desc: "High resource overhead", factor: "3.3T CO₂ / year" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setDiet(opt.id)}
                      type="button"
                      role="radio"
                      aria-checked={diet === opt.id}
                      className={`p-4 rounded-2xl text-left border transition-all focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer ${
                        diet === opt.id
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-300 scale-[1.01]"
                          : "bg-slate-950/20 border-white/5 text-slate-400 hover:border-white/10 hover:bg-slate-900/20"
                      }`}
                    >
                      <span className="text-sm font-bold block tracking-tight">{opt.title}</span>
                      <span className="text-[10px] text-slate-500 leading-normal block mt-1.5">{opt.desc}</span>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 block mt-3">{opt.factor}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/15">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-purple-400 font-bold block">SECTION 04</span>
                    <h3 className="text-lg font-bold text-white block leading-tight">Lifestyle Factor Diagnostics</h3>
                    <p className="text-slate-400 text-xs text-balance">Estimate shopping frequency, clothing cycles, packaging reliance, and trash outputs.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex gap-2" role="radiogroup" aria-label="Habit Rating Tier Selection">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        role="radio"
                        aria-checked={lifestyle === level}
                        onClick={() => setLifestyle(level)}
                        className={`flex-1 py-3 text-center rounded-2xl font-bold text-xs transition-all border focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer ${
                          lifestyle === level
                            ? "bg-gradient-to-br from-emerald-400 to-teal-500 border-transparent text-slate-950 shadow-lg shadow-emerald-500/10"
                            : "bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800/40"
                        }`}
                      >
                        Tier {level}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-sans">
                    <span>Minimalist (Eco)</span>
                    <span>Standard Balanced</span>
                    <span>High Consumption</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={handlePrev}
            className="px-4.5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            Previous
          </button>
        ) : (
          <div></div>
        )}

        {step < 5 ? (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/15 cursor-pointer focus:outline-none"
          >
            Continue
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xl shadow-emerald-500/15 cursor-pointer"
          >
            Launch Carbon Dashboard
            <Check className="w-4 h-4 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );
}
