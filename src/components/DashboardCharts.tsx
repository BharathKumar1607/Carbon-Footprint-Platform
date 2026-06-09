import { useState, useEffect } from "react";
import { Footprint } from "../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { TrendingUp, TrendingDown, RefreshCw, BarChart2, Award, Sparkles, BrainCircuit, Table2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardChartsProps {
  userId: string;
  footprints: Footprint[];
}

export default function DashboardCharts({ userId, footprints }: DashboardChartsProps) {
  const [viewMode, setViewMode] = useState<"history" | "forecast">("history");
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [forecastCommentary, setForecastCommentary] = useState("");
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [showDataTable, setShowDataTable] = useState(false);

  useEffect(() => {
    setForecastData([]);
  }, [footprints]);

  useEffect(() => {
    if (viewMode === "forecast" && userId && forecastData.length === 0) {
      const fetchForecast = async () => {
        try {
          setLoadingForecast(true);
          const res = await fetch("/api/ai/forecast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
          });
          if (res.ok) {
            const data = await res.json();
            
            const pastPoints = (data.historical || []).map((f: any) => {
              const date = new Date(f.timestamp);
              return {
                name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                "Logged CO2": f.total_co2,
                "Projected CO2": null,
              };
            }).slice(-5);

            const futurePoints = (data.forecast || []).map((f: any) => {
              return {
                name: f.dateStr,
                "Logged CO2": null,
                "Projected CO2": f.total_co2,
              };
            });

            const merged = [...pastPoints];
            if (pastPoints.length > 0 && futurePoints.length > 0) {
              const latestPast = pastPoints[pastPoints.length - 1];
              merged.push({
                name: "Today",
                "Logged CO2": latestPast["Logged CO2"],
                "Projected CO2": latestPast["Logged CO2"]
              });
            }
            
            futurePoints.forEach(p => merged.push(p));
            setForecastData(merged);
            setForecastCommentary(data.commentary || "");
          }
        } catch (err) {
          console.error("Forecast fetch error", err);
        } finally {
          setLoadingForecast(false);
        }
      };
      
      fetchForecast();
    }
  }, [viewMode, userId, forecastData.length]);

  if (footprints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center apple-glass h-64 border border-dashed border-white/5">
        <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
        <p className="text-slate-400 text-sm font-semibold">No logs recorded yet.</p>
        <p className="text-emerald-400 font-mono text-xs mt-1.5">Submit your first telemetry log above to compute tracking details.</p>
      </div>
    );
  }

  const trendData = footprints
    .map(f => {
      const date = new Date(f.timestamp);
      return {
        dateStr: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        "Total CO2 (Tons)": f.total_co2,
        Transport: f.transport_co2,
        Energy: f.energy_co2,
        Food: f.food_co2,
        Lifestyle: f.lifestyle_co2
      };
    })
    .slice(-7);

  const latest = footprints[footprints.length - 1];

  const breakdownData = [
    { category: "Transport", "CO2 (Tons)": latest.transport_co2, color: "#38bdf8" },
    { category: "Energy", "CO2 (Tons)": latest.energy_co2, color: "#fbbf24" },
    { category: "Food", "CO2 (Tons)": latest.food_co2, color: "#10b981" },
    { category: "Lifestyle", "CO2 (Tons)": latest.lifestyle_co2, color: "#c084fc" }
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Selector deck */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-2 rounded-2xl bg-slate-900/40 border border-white/8 w-full gap-3">
        <div className="flex items-center gap-1.5 pl-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Analytics Lounge</span>
        </div>
        
        <div className="flex gap-2 items-center flex-wrap shrink-0">
          <button
            onClick={() => setShowDataTable(!showDataTable)}
            type="button"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 ${
              showDataTable
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-white/5 bg-slate-950/20 text-slate-400 hover:text-white"
            }`}
            aria-label={showDataTable ? "Render interactive charts visualization" : "Render spreadsheet data table"}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>{showDataTable ? "Charts Mode" : "Table Audit"}</span>
          </button>

          <span className="h-4 w-[1px] bg-white/5 hidden sm:inline"></span>

          <div className="p-0.5 bg-slate-950/40 border border-white/5 rounded-xl flex">
            <button
              onClick={() => setViewMode("history")}
              type="button"
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer focus:outline-none ${
                viewMode === "history"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Logged History
            </button>
            <button
              onClick={() => setViewMode("forecast")}
              type="button"
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 focus:outline-none ${
                viewMode === "forecast"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>AI forecasts</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showDataTable ? (
          <motion.div
            key="grid-table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
          >
            {viewMode === "history" ? (
              <>
                {/* Historical Ledger Table */}
                <div className="apple-glass p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight uppercase font-mono text-emerald-400">Emissions Trend Ledger</h4>
                    <p className="text-slate-400 text-xs mb-4">Historical audit logs sorted chronologically.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <caption className="sr-only">Historic logged index results</caption>
                      <thead>
                        <tr className="border-b border-white/8 text-slate-500 font-mono">
                          <th scope="col" className="pb-2 text-[10px] font-bold">DATE</th>
                          <th scope="col" className="pb-2 text-[10px] font-bold text-right">TOTAL CO₂</th>
                          <th scope="col" className="pb-2 text-[10px] font-bold text-right">TRANSIT</th>
                          <th scope="col" className="pb-2 text-[10px] font-bold text-right">UTILITIES</th>
                          <th scope="col" className="pb-2 text-[10px] font-bold text-right">FOOD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/4">
                        {trendData.map((row, index) => (
                          <tr key={index} className="text-slate-300 hover:bg-slate-900/20 transition-colors">
                            <td className="py-2.5 font-medium">{row.dateStr}</td>
                            <td className="py-2.5 font-bold text-emerald-400 text-right">{row["Total CO2 (Tons)"].toFixed(2)}T</td>
                            <td className="py-2.5 text-right text-slate-400">{row.Transport.toFixed(2)}T</td>
                            <td className="py-2.5 text-right text-slate-400">{row.Energy.toFixed(2)}T</td>
                            <td className="py-2.5 text-right text-slate-400">{row.Food.toFixed(2)}T</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Categorical Distribution Table */}
                <div className="apple-glass p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight uppercase font-mono text-emerald-400 font-bold">Category Coefficients</h4>
                    <p className="text-slate-400 text-xs mb-4">Current carbon split distributions.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <caption className="sr-only">Active footprint categories metrics</caption>
                      <thead>
                        <tr className="border-b border-white/8 text-slate-500 font-mono">
                          <th scope="col" className="pb-2 text-[10px] font-bold">SECTOR</th>
                          <th scope="col" className="pb-2 text-[10px] font-bold text-right">CO₂ CONSTRAINTS</th>
                          <th scope="col" className="pb-2 text-[10px] font-bold text-right">RATIO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/4">
                        {(() => {
                          const totalMass = breakdownData.reduce((acc, c) => acc + c["CO2 (Tons)"], 0);
                          return breakdownData.map((row, index) => {
                            const percent = totalMass > 0 ? ((row["CO2 (Tons)"] / totalMass) * 100).toFixed(0) : 0;
                            return (
                              <tr key={index} className="text-slate-350 hover:bg-slate-900/25 transition-colors">
                                <td className="py-3 font-semibold flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: row.color }}></span>
                                  {row.category}
                                </td>
                                <td className="py-3 font-mono text-right font-bold text-slate-200">{row["CO2 (Tons)"].toFixed(2)}T</td>
                                <td className="py-3 font-mono text-right text-emerald-400 font-bold">{percent}%</td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="apple-glass p-6 shadow-xl flex flex-col justify-between w-full lg:col-span-2">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight uppercase font-mono text-emerald-400">Predictive Modeling Matrix</h4>
                  <p className="text-slate-400 text-xs mb-4 text-balance">Carbon constraints versus AI-forecasted metrics over a 4-week future span.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <caption className="sr-only">AI projections compared with historical records</caption>
                    <thead>
                      <tr className="border-b border-white/8 text-slate-500 font-mono">
                        <th scope="col" className="pb-2 text-[10px] font-bold">WEEKS</th>
                        <th scope="col" className="pb-2 text-[10px] font-bold text-right">LOGGED MATRIX</th>
                        <th scope="col" className="pb-2 text-[10px] font-bold text-right">AI PREDICTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/4">
                      {forecastData.map((row, index) => (
                        <tr key={index} className="text-slate-350 hover:bg-slate-900/25 transition-colors">
                          <td className="py-2.5 font-medium">{row.name}</td>
                          <td className="py-2.5 font-mono text-right text-emerald-400 font-bold">
                            {row["Logged CO2"] !== null && row["Logged CO2"] !== undefined ? `${row["Logged CO2"].toFixed(2)}T` : "—"}
                          </td>
                          <td className="py-2.5 font-mono text-right text-yellow-400 font-bold">
                            {row["Projected CO2"] !== null && row["Projected CO2"] !== undefined ? `${row["Projected CO2"].toFixed(2)}T` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* GRAPHICS CHART MODE */
          <motion.div
            key="grid-chart"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            {viewMode === "history" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {/* Line Chart */}
                <div className="apple-glass p-5 md:p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-350 uppercase tracking-wider font-mono mb-1">CO₂ Emissions Slope</h4>
                    <p className="text-slate-400 text-xs mb-4">Cumulative trends logged across your last 7 reports.</p>
                  </div>
                  <div className="w-full h-64 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="dateStr" stroke="#475569" fontSize={10} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(10, 15, 30, 0.95)",
                            borderColor: "rgba(255, 255, 255, 0.08)",
                            borderRadius: "16px",
                            fontSize: "11px",
                            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)"
                          }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }} />
                        <Line
                          type="monotone"
                          name="Metric Tons CO₂"
                          dataKey="Total CO2 (Tons)"
                          stroke="#10b981"
                          strokeWidth={3}
                          activeDot={{ r: 6 }}
                          dot={{ r: 3.5, stroke: "#060913", strokeWidth: 1.5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="apple-glass p-5 md:p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-350 uppercase tracking-wider font-mono mb-1">Current Log Distribution</h4>
                    <p className="text-slate-400 text-xs mb-4">Section splits calculated on your latest data point.</p>
                  </div>
                  <div className="w-full h-64 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={breakdownData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="category" stroke="#475569" fontSize={10} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(10, 15, 30, 0.95)",
                            borderColor: "rgba(255, 255, 255, 0.08)",
                            borderRadius: "16px",
                            fontSize: "11px"
                          }}
                        />
                        <Bar dataKey="CO2 (Tons)" radius={[8, 8, 0, 0]}>
                          {breakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              /* FORECAST MODE */
              <div className="apple-glass p-6 shadow-2xl space-y-6 w-full">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-350 uppercase tracking-wider font-mono mb-1">Systemic Carbon Regression</h4>
                    <p className="text-slate-400 text-xs">Four-week statistical slope modeled against historical parameters.</p>
                  </div>
                  
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/15 uppercase tracking-wide animate-pulse shrink-0">
                    Active Forecasting Node
                  </span>
                </div>

                {loadingForecast ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-slate-950/20 rounded-2xl border border-white/5">
                    <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
                    <p className="text-slate-400 text-xs font-mono">Running regression matrices...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecastData} margin={{ top: 15, right: 15, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                          <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(10, 15, 30, 0.95)",
                              borderColor: "rgba(255, 255, 255, 0.08)",
                              borderRadius: "16px",
                              fontSize: "11px"
                            }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }} />
                          
                          <Line
                            type="monotone"
                            name="Logged Ledger (Tons)"
                            dataKey="Logged CO2"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ r: 4, stroke: "#060913", strokeWidth: 1.5 }}
                            activeDot={{ r: 6 }}
                          />

                          <Line
                            type="monotone"
                            name="AI Projected Curves (Tons)"
                            dataKey="Projected CO2"
                            stroke="#fbbf24"
                            strokeWidth={3}
                            strokeDasharray="6 4"
                            dot={{ r: 4, stroke: "#060913", strokeWidth: 1.5 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {forecastCommentary && (
                      <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex items-start gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Statistical Advice Summary</h5>
                          <p className="text-slate-350 text-xs leading-relaxed font-sans text-balance">{forecastCommentary}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}
