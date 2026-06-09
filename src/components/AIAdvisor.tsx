import React, { useState, useEffect } from "react";
import { BrainCircuit, Send, Sparkles, RefreshCw, AlertCircle, Quote, Bot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Tip {
  category: string;
  text: string;
  impact: string;
}

interface ChatMessage {
  sender: "user" | "advisor";
  text: string;
  isAi?: boolean;
}

interface AIAdvisorProps {
  userId: string;
  triggerRefresh: boolean;
}

type PersonaKey = "friendly" | "scientist" | "minimalist";

interface PersonaConfig {
  id: PersonaKey;
  name: string;
  label: string;
  desc: string;
  emoji: string;
  avatarColor: string;
  borderColor: string;
  intro: string;
}

const PERSONAS: Record<PersonaKey, PersonaConfig> = {
  friendly: {
    id: "friendly",
    name: "Kai",
    label: "Eco-Optimist Coach",
    desc: "Energetic, practical, focuses on atomic lifestyle adjustments.",
    emoji: "🌱",
    avatarColor: "from-emerald-400 to-teal-500",
    borderColor: "border-emerald-500/20",
    intro: "Hey there! I'm Kai, your Eco-Optimist Coach! 🌟 Eager to help you smash some easy carbon-saving wins today. Let's make saving the planet rewarding. What's on your mind? 🌱"
  },
  scientist: {
    id: "scientist",
    name: "Dr. Evelyn Vance",
    label: "Atmospheric Scientist",
    desc: "Rigorous, quantitative, and focused on parts-per-million benchmarks.",
    emoji: "🔬",
    avatarColor: "from-sky-400 to-indigo-600",
    borderColor: "border-sky-500/20",
    intro: "Greetings. I am Dr. Evelyn Vance. I assess environmental trajectories using empirical physical parameters and carbon coefficients. What datasets or carbon indices shall we scientifically optimize?"
  },
  minimalist: {
    id: "minimalist",
    name: "Sora",
    label: "Earth Guardian",
    desc: "Serene, zero-waste advocate centering ancestral simplicity.",
    emoji: "🌸",
    avatarColor: "from-amber-400 to-orange-500",
    borderColor: "border-amber-400/20",
    intro: "Welcome, friend. I am Sora. Live simply so that others may simply live. Let us walk light in spirit, minimize plastic burdens, and embrace requiring less from our shared biosphere. How can I guide you today?"
  }
};

export default function AIAdvisor({ userId, triggerRefresh }: AIAdvisorProps) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [advisorInfo, setAdvisorInfo] = useState({ model: "", isAi: false });

  const [selectedPersona, setSelectedPersona] = useState<PersonaKey>("friendly");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sendingChat, setSendingChat] = useState(false);
  const [tipsLoadingManual, setTipsLoadingManual] = useState(false);

  // Initialize advice history with current coach introductory text
  useEffect(() => {
    setChatHistory([
      {
        sender: "advisor",
        text: PERSONAS[selectedPersona].intro,
        isAi: true,
      },
    ]);
  }, [selectedPersona]);

  // Fetch carbon-aware tips
  async function loadTips(force = false) {
    try {
      if (force) setTipsLoadingManual(true);
      else setLoadingTips(true);

      const res = await fetch("/api/ai/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, forceRefresh: force }),
      });
      if (!res.ok) throw new Error("Failed to load recommendations");
      const data = await res.json();
      setTips(data.tips || []);
      setAdvisorInfo({
        model: data.modelUsed || "Expert Engine",
        isAi: !!data.isAiGenerated,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTips(false);
      setTipsLoadingManual(false);
    }
  }

  useEffect(() => {
    if (userId) {
      loadTips(false);
    }
  }, [userId, triggerRefresh]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || sendingChat) return;

    const userText = chatMessage.trim();
    setChatMessage("");
    setChatHistory((prev) => [...prev, { sender: "user", text: userText }]);
    setSendingChat(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: userText, persona: selectedPersona }),
      });
      if (!res.ok) throw new Error("Advisor timed out. Please try again.");
      const data = await res.json();

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "advisor",
          text: data.response,
          isAi: !!data.isAiGenerated,
        },
      ]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "advisor",
          text: `My cognitive circuits are taking a deep breath (Quota limits reached). Swapping beef for standard vegetarian root crops drops dietary emissions by up to 30%! Try it out today!`,
        },
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  const currentCoach = PERSONAS[selectedPersona];

  return (
    <div className="space-y-6">
      {/* AI Tips Panel */}
      <div className="apple-glass p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/8 to-transparent"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/15 text-emerald-400 rounded-2xl shadow-inner">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block mb-0.5">COGNITIVE COMPUTES</span>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Climate Intelligence Tips
              </h3>
              <p className="text-slate-400 text-xs">Dynamic targets generated specifically on your carbon ledger.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadTips(true)}
              disabled={loadingTips || tipsLoadingManual}
              className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/6 hover:border-emerald-500/30 text-slate-300 hover:text-white transition-all text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Recalculate with AI"
              type="button"
            >
              <RefreshCw className={`w-3 h-3 ${tipsLoadingManual ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Recalculate</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/40 border border-white/6 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              {advisorInfo.model ? `Engine: ${advisorInfo.model}` : "Analyzing..."}
            </div>
          </div>
        </div>

        {loadingTips ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-slate-900/40 border border-white/5 rounded-2xl">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-slate-400 text-xs font-mono">Simulating carbon regression curves...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {tips.map((tip, index) => (
              <div
                key={index}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/25 border border-white/5 hover:border-emerald-500/20 hover:bg-slate-900/50 transition-all duration-300"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span
                    className={`inline-block px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg tracking-wider uppercase mt-0.5 shrink-0 border ${
                      tip.category === "Transport"
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/15"
                        : tip.category === "Energy"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/15"
                        : tip.category === "Food"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/15"
                    }`}
                  >
                    {tip.category}
                  </span>
                  <div className="min-w-0">
                    <p className="text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors text-pretty">
                      {tip.text}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 mt-1 md:mt-0">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wide">
                    {tip.impact}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Live AI Consultative Console & Coach Personas */}
      <div className="apple-glass overflow-hidden shadow-2xl flex flex-col relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/8 to-transparent"></div>

        {/* Coach Selector Headers */}
        <div className="p-6 md:p-8 bg-slate-900/60 border-b border-white/8">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 border border-indigo-500/15 text-indigo-400 rounded-2xl shadow-inner">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase block mb-0.5">COACH MATRIX</span>
              <h3 className="text-xl font-bold text-white tracking-tight">Personalized Sustainability Tutor</h3>
              <p className="text-slate-400 text-xs mt-0.5">Choose or switch your AI representative in real-time.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(PERSONAS) as PersonaKey[]).map((key) => {
              const p = PERSONAS[key];
              const isSelected = selectedPersona === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPersona(key)}
                  type="button"
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                    isSelected
                      ? "bg-slate-950/60 border-emerald-500/50 shadow-inner ring-1 ring-emerald-500/25"
                      : "bg-slate-900/20 border-white/5 opacity-75 hover:opacity-100 hover:bg-slate-900/40"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl text-xl text-slate-950 bg-gradient-to-br ${p.avatarColor} shrink-0 shadow-md`}>
                    {p.emoji}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
                      {p.name}
                      {isSelected && (
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">{p.label}</p>
                    <p className="text-[9px] text-slate-500 leading-normal line-clamp-2 mt-0.5">{p.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Active Coach Indicator */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-white/5 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">TUTOR INTEL:</span>
            <span className="font-bold text-white">{currentCoach.name} — {currentCoach.label}</span>
          </div>
          <span className="text-slate-500 text-[10px]">COGNITIVE ENGINE</span>
        </div>

        {/* Messages Feed */}
        <div className="p-6 h-72 overflow-y-auto space-y-4 flex flex-col bg-[#05080e]/40">
          <AnimatePresence>
            {chatHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-emerald-500 text-slate-950 font-semibold self-end rounded-tr-none shadow-md"
                    : "bg-slate-900/80 border border-white/5 text-slate-200 self-start rounded-tl-none font-sans"
                }`}
              >
                <p>{msg.text}</p>
                {msg.sender === "advisor" && (
                  <span className="block mt-1.5 text-[9px] text-slate-500 font-mono">
                    {currentCoach.name} ({currentCoach.label}) • {msg.isAi ? "Gemini-3.5" : "Expert Heuritics"}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {sendingChat && (
            <div className="flex items-center gap-2 self-start bg-slate-900/80 border border-white/5 text-slate-400 rounded-2xl px-4 py-3 text-xs rounded-tl-none animate-pulse">
              <Bot className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>{currentCoach.name} is formulating diagnostics...</span>
            </div>
          )}
        </div>

        {/* Typing container */}
        <form onSubmit={handleSendChat} className="p-4 bg-slate-900/50 border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder={`Ask Coach ${currentCoach.name} about carbon indexes...`}
            className="flex-1 bg-[#090d16]/80 border border-white/8 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
          />
          <button
            type="submit"
            disabled={!chatMessage.trim() || sendingChat}
            className="p-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 disabled:text-slate-600 text-slate-950 rounded-2xl transition-all shrink-0 cursor-pointer flex items-center justify-center shadow-md shadow-emerald-500/5"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
