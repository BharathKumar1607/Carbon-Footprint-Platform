import React, { useState, useEffect } from "react";
import { FileText, Sparkles, RefreshCw, Printer, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface EnvironmentalReportsProps {
  userId: string;
  triggerRefresh: boolean;
}

export default function EnvironmentalReports({ userId, triggerRefresh }: EnvironmentalReportsProps) {
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState("");
  const [isAi, setIsAi] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
        setModelUsed(data.modelUsed || "Expert Engine");
        setIsAi(!!data.isAiGenerated);
      } else {
        throw new Error("Failed to compile carbon report");
      }
    } catch (err) {
      setError("Failed to generate report. Neural networks are calibrating. Please try again soon.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadReport();
    }
  }, [userId, triggerRefresh]);

  // Robust, zero-dependency Markdown-to-JSX typesetting parser
  const renderMarkdown = (mdText: string) => {
    if (!mdText) return null;
    
    const lines = mdText.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-sm font-bold text-white uppercase tracking-wider mt-5 mb-2.5 pb-10/10 border-b border-white/5 font-sans">
            {trimmed.substring(4)}
          </h3>
        );
      }
      if (trimmed.startsWith("#### ")) {
        return (
          <h4 key={idx} className="text-xs font-bold text-emerald-400 tracking-wide mt-4 mb-2 flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            {trimmed.substring(5)}
          </h4>
        );
      }
      
      // Bullets
      if (trimmed.startsWith("* ")) {
        const bulletContent = trimmed.substring(2);
        return (
          <li key={idx} className="text-xs text-slate-300 leading-relaxed list-disc list-inside ml-2.5 mt-1.5 font-sans">
            {parseBoldMarkers(bulletContent)}
          </li>
        );
      }
      
      // Separators or blank lines
      if (trimmed === "" || trimmed === "---") {
        return <div key={idx} className="h-2.5"></div>;
      }
      
      // Standard Paragraph
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mt-1 font-sans">
          {parseBoldMarkers(trimmed)}
        </p>
      );
    });
  };

  const parseBoldMarkers = (text: string) => {
    const parts = text.split("**");
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-white font-sans">{part}</strong>;
      }
      return part;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="carbon-reports-section" className="apple-glass p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative metal top thread */}
      <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/8 to-transparent"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/15 text-emerald-400 rounded-2xl shadow-inner">
            <FileText className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block mb-0.5">COMPLIANCE REPORT</span>
            <h3 className="text-xl font-bold text-white tracking-tight">AI Environmental Audit</h3>
            <p className="text-slate-404 text-xs mt-0.5">Generate comprehensive emission assessments and carbon briefs.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report && (
            <button
              onClick={handlePrint}
              type="button"
              className="p-2 rounded-xl bg-slate-900/60 border border-white/6 hover:border-white/15 text-slate-300 hover:text-white transition-all text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              title="Print Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          )}
          <button
            onClick={loadReport}
            disabled={loading}
            className="p-2 px-3 rounded-xl bg-slate-900/60 border border-white/6 hover:border-emerald-500/30 text-slate-300 hover:text-white transition-all text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Generate climate audit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-slate-950/20 rounded-2xl border border-white/5">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-slate-400 text-xs font-mono">Compiling ledger metrics & tracking profiles...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 p-6 text-center bg-red-500/5 border border-red-500/10 rounded-2xl">
          <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-red-300 text-xs font-mono">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Metadata banner */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>STATUS: VERIFIABLE AI AUDIT</span>
            </div>
            <div>
              <span>ENGINE: {modelUsed}</span>
            </div>
          </div>

          {/* Core Content Sheet */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#05080e]/40 border border-white/5 rounded-2xl p-5 md:p-6 overflow-y-auto max-h-[380px] shadow-inner"
          >
            <div className="prose prose-invert prose-xs max-w-none text-slate-300 space-y-3">
              {renderMarkdown(report)}
            </div>
          </motion.div>

          {/* Action note */}
          <p className="text-[9px] text-slate-500 font-mono text-right italic">
            *This weekly report correlates local input multipliers with active Gemini carbon heuristics.
          </p>
        </div>
      )}
    </div>
  );
}
