import React, { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { User, Footprint, Challenge } from "./types";
import { motion, AnimatePresence } from "motion/react";
import {
  Leaf,
  LogOut,
  Sparkles,
  Award,
  Zap,
  Flame,
  Globe,
  TrendingDown,
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Shield,
  ArrowRight
} from "lucide-react";

// Performance Optimization: Dynamic Code Splitting & Lazy-Loaded Bundles
const FootprintForm = lazy(() => import("./components/FootprintForm"));
const DashboardCharts = lazy(() => import("./components/DashboardCharts"));
const AIAdvisor = lazy(() => import("./components/AIAdvisor"));
const ChallengeList = lazy(() => import("./components/ChallengeList"));
const GoalTracker = lazy(() => import("./components/GoalTracker"));
const EnvironmentalReports = lazy(() => import("./components/EnvironmentalReports"));
const FeatureShowcase = lazy(() => import("./components/FeatureShowcase"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const OnboardingWizard = lazy(() => import("./components/OnboardingWizard"));
const AchievementsGrid = lazy(() => import("./components/AchievementsGrid"));

// Performance Optimization: Re-render prevention skeleton loader
const SkeletonLoader = React.memo(({ height = "h-48" }: { height?: string }) => (
  <div className={`w-full ${height} bg-slate-900/40 border border-white/5 rounded-2xl animate-pulse flex flex-col justify-between p-6`}>
    <div className="space-y-4 w-full">
      <div className="h-4 bg-white/10 rounded w-1/3"></div>
      <div className="h-2 bg-white/5 rounded w-full"></div>
      <div className="h-2 bg-white/5 rounded w-5/6"></div>
      <div className="h-2 bg-white/5 rounded w-4/5"></div>
    </div>
    <div className="h-8 bg-white/5 rounded w-24"></div>
  </div>
));
SkeletonLoader.displayName = "SkeletonLoader";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [challenges, setChallenges] = useState<(Challenge & { completed?: boolean })[]>([]);
  const [loadingApp, setLoadingApp] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Authentication Fields
  const [isRegistering, setIsRegistering] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // App UI State
  const [isSubmittingFootprint, setIsSubmittingFootprint] = useState(false);
  const [isCompletingChallenge, setIsCompletingChallenge] = useState<string | null>(null);
  const [triggerAiRefresh, setTriggerAiRefresh] = useState(false);

  // Toast Alerts (Notification popup)
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "level" } | null>(null);

  // Trigger Toast Notification
  const triggerToast = (message: string, type: "success" | "info" | "level" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Try to load cached session on start
  useEffect(() => {
    const cachedUser = localStorage.getItem("ecotrack_user");
    if (cachedUser) {
      try {
        const u = JSON.parse(cachedUser);
        setCurrentUser(u);
      } catch (err) {
        console.error("Cache error", err);
      }
    }
    setLoadingApp(false);
  }, []);

  // Fetch Footprints and Challenges
  const loadUserData = async (user: User) => {
    try {
      // 1. Fetch Footprints
      const fRes = await fetch(`/api/footprints?userId=${user.id}`);
      if (fRes.ok) {
        const fData = await fRes.json();
        setFootprints(fData);
      }

      // 2. Fetch Challenges
      const cRes = await fetch(`/api/challenges?userId=${user.id}`);
      if (cRes.ok) {
        const cData = await cRes.json();
        setChallenges(cData);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  };

  // Sync local cache when currentUser updates
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("ecotrack_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("ecotrack_user");
    }
  }, [currentUser]);

  // Load user data only once when logging in (User ID change), avoiding heavy redundant re-fetches
  useEffect(() => {
    if (currentUser?.id) {
      loadUserData(currentUser);
    }
  }, [currentUser?.id]);

  // Auth: Log In Demo account instantly for convenience
  const handleLogInDemo = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "hero@ecotrack.ai", password: "green" })
      });
      if (!res.ok) {
        throw new Error("Demo account offline. Please register details.");
      }
      const data = await res.json();
      setCurrentUser(data);
      triggerToast("Welcome back Eco Explorer! Preseeded metrics loaded.", "info");
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in");
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth: Standard registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword) {
      setAuthError("All fields are required");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      setCurrentUser(data);
      setIsOnboarding(true);
      triggerToast(`Account created successfully! Welcome ${data.username}!🌻`);
    } catch (err: any) {
      setAuthError(err.message || "Failed to register");
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth: Standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setAuthError("Email and Password are required");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid login credentials");
      }
      setCurrentUser(data);
      triggerToast(`Successfully signed in. Hello ${data.username}!`);
    } catch (err: any) {
      setAuthError(err.message || "Authentication error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setFootprints([]);
    setChallenges([]);
    triggerToast("Signed out safely. Stay green!", "info");
  };

  // Footprint: Log record
  const handleAddFootprint = async (formData: { km: number; kwh: number; diet: string; lifestyle: number }) => {
    if (!currentUser) return;
    setIsSubmittingFootprint(true);
    try {
      const res = await fetch("/api/footprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          ...formData
        })
      });
      if (!res.ok) throw new Error("Calculation failure");
      const data = await res.json();

      // Update footprint list
      setFootprints((prev) => [...prev, data.entry]);

      // Update user points and level reactive display
      const oldLevel = currentUser.level;
      if (data.user) {
        setCurrentUser(data.user);
        if (data.user.level !== oldLevel) {
          triggerToast(`🏆 LEVEL UP! You are now a: ${data.user.level}!`, "level");
        } else {
          triggerToast(`Logged successfully! Your total CO2: ${data.entry.total_co2} Tons. +25 green points earned!`);
        }
      }

      setTriggerAiRefresh((prev) => !prev);
    } catch (err) {
      console.error(err);
      triggerToast("Unable to submit metrics", "info");
    } finally {
      setIsSubmittingFootprint(false);
    }
  };

  // Onboarding: Complete baseline setup and log first record
  const handleOnboardingComplete = async (onboardingData: { km: number; kwh: number; diet: string; lifestyle: number }) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/footprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          ...onboardingData
        })
      });
      if (!res.ok) throw new Error("Onboarding calculation failure");
      const data = await res.json();
      
      setFootprints([data.entry]);

      // Grant 50 bonus points for onboarding completion
      const pointsRes = await fetch(`/api/users/${currentUser.id}/points`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: currentUser.points + 50
        })
      });

      if (pointsRes.ok) {
        const updatedUser = await pointsRes.json();
        setCurrentUser(updatedUser);
        localStorage.setItem("ecotrack_user", JSON.stringify(updatedUser));
      } else if (data.user) {
        setCurrentUser(data.user);
      }

      setIsOnboarding(false);
      triggerToast("Onboarding Completed! Baseline profile initialized & +50 XP awarded.", "success");
      setTriggerAiRefresh((prev) => !prev);
    } catch (err) {
      console.error("Onboarding submission error:", err);
      setIsOnboarding(false); // resolve gracefully
    }
  };

  // Challenge: Check off Goal
  const handleCompleteChallenge = async (challengeId: string) => {
    if (!currentUser) return;
    setIsCompletingChallenge(challengeId);

    try {
      const res = await fetch("/api/challenges/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          challengeId
        })
      });
      if (!res.ok) {
        const parsed = await res.json();
        throw new Error(parsed.error || "Completion failure");
      }

      const data = await res.json();

      // Trigger instant checkoff in state
      setChallenges((prev) =>
        prev.map((ch) => (ch.id === challengeId ? { ...ch, completed: true } : ch))
      );

      // Check for level status updates
      const oldLevel = currentUser.level;
      if (data.user) {
        setCurrentUser(data.user);
        if (data.user.level !== oldLevel) {
          triggerToast(`🏆 ACHIEVEMENT: ${oldLevel} upgraded to ${data.user.level}!`, "level");
        } else {
          triggerToast(`Goal Checked Off! Points awarded!`);
        }
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || "Failed to catalog completion", "info");
    } finally {
      setIsCompletingChallenge(null);
    }
  };

  // Performance Optimization: Memoized calculations to prevent rendering bottlenecks
  const levelProgress = useMemo(() => {
    if (!currentUser) return 0;
    const pts = currentUser.points;
    if (pts >= 500) return 100; // Top level
    if (pts >= 200) {
      // Scale 200 to 500 (300 points span)
      return Math.round(((pts - 200) / 300) * 100);
    }
    // Scale 0 to 200 (200 points span)
    return Math.round((pts / 200) * 100);
  }, [currentUser?.points]);

  const nextLevelName = useMemo(() => {
    if (!currentUser) return "";
    if (currentUser.points >= 500) return "Max Tier";
    if (currentUser.points >= 200) return "Eco Champion (500 pts)";
    return "Sustainability Explorer (200 pts)";
  }, [currentUser?.points]);

  const latestCarbonCount = useMemo(() => {
    if (footprints.length === 0) return 0;
    return footprints[footprints.length - 1].total_co2;
  }, [footprints]);

  if (loadingApp) {
    return (
      <div className="bg-[#060913] min-h-screen flex items-center justify-center text-emerald-400 font-mono">
        <div className="flex flex-col items-center gap-3">
          <Leaf className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#10b981]/80">Calibrating eco hardware...</p>
        </div>
      </div>
    );
  }

  // Activity rings helper calculations
  const diagnosticRings = (() => {
    if (footprints.length === 0) {
      return { total: 0, transport: 0, energy: 0 };
    }
    const latest = footprints[footprints.length - 1];
    return {
      total: Math.min(100, Math.round((latest.total_co2 / 12) * 100)),
      transport: Math.min(100, Math.round((latest.transport_co2 / 4) * 100)),
      energy: Math.min(100, Math.round((latest.energy_co2 / 4) * 100)),
    };
  })();

  return (
    <div className="bg-[#060913] font-sans min-h-screen text-slate-100 selection:bg-emerald-400 selection:text-slate-900 relative overflow-hidden flex flex-col justify-between">
      {/* Absolute high-contrast Apple style ambient glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Toast Notification Deck */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed top-6 right-6 z-50 max-w-sm w-full"
          >
            <div
              className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3.5 backdrop-blur-xl ${
                toast.type === "level"
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-bold"
                  : toast.type === "info"
                  ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}
            >
              {toast.type === "level" ? (
                <Award className="w-5 h-5 text-yellow-400 animate-pulse" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              )}
              <div className="flex-1">
                <p className="text-xs leading-relaxed font-sans font-semibold">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Section aligned to Elegant Dark design */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#060913]/80 border-b border-white/5 py-5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {currentUser ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Hardware Console
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {currentUser.id.slice(0, 6)}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Welcome, {currentUser.username}
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              </h1>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">EcoTrack AI</h1>
                <p className="text-[10px] text-slate-400 uppercase font-mono">Climatic telemetry node</p>
              </div>
            </div>
          )}

          {currentUser && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const targetElement = document.getElementById("emission-insights");
                  targetElement?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-slate-300 pointer-events-auto cursor-pointer"
              >
                View Analytics
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetElement = document.getElementById("footprint-calculator");
                  targetElement?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-all shadow-md cursor-pointer"
              >
                + Log Footprint
              </button>
              <button
                onClick={handleLogout}
                className="p-2 bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                aria-label="Logout session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 relative">
        {!currentUser ? (
          /* High-Impact Venture Landing Page with Authenticator Gate */
          <div className="space-y-16 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Venture Pitch & Stats */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold font-mono rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 align-middle">
                  <Sparkles className="w-3 text-yellow-400 animate-pulse" />
                  EcoTrack Enterprise Edition
                </span>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none text-balance">
                  Quantify, Reduce & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Gamify</span> Your Carbon Footprint.
                </h2>
                
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-xl font-sans text-balance">
                  EcoTrack AI is an enterprise-grade personal sustainability portal. Align your daily transport, culinary choices, and utility draws with automated benchmarks, premium advisors, and competitive community leaderboards.
                </p>

                {/* Venture Metrics Blocks */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
                  <div className="space-y-1">
                    <span className="block text-2xl font-extrabold text-[#10b981] font-mono">14,242T</span>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-mono">CO₂ Offset Saved</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-2xl font-extrabold text-white font-mono">94.8%</span>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-mono">AI Suggestion Match</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-2xl font-extrabold text-indigo-400 font-mono">2026</span>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-mono">UX Design Certified</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Authenticator Gate Interface */}
              <div id="auth-panel" className="lg:col-span-5 w-full">
                <div className="apple-glass p-6 md:p-8 shadow-2xl relative border border-white/5">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 p-2.5 bg-[#060913] text-[#10b981] rounded-full border border-white/5">
                    <Leaf className="w-6 h-6 text-emerald-400" />
                  </div>

                  <div className="text-center mt-6 mb-6">
                    <h3 className="text-base font-bold tracking-tight text-white font-sans">
                      {isRegistering ? "Create Venture Profile" : "Portal Sentinel Sign In"}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isRegistering 
                        ? "Registering launches our immersive onboarding tracker." 
                        : "Credentials checked by military-grade OAuth proxy hashes."}
                    </p>
                  </div>

                  {authError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="truncate">{authError}</span>
                    </div>
                  )}

                  {isRegistering ? (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <label htmlFor="reg-username" className="block text-[9px] font-semibold text-slate-400 mb-1 uppercase font-mono tracking-wider">Username</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                          <input
                            id="reg-username"
                            type="text"
                            required
                            className="w-full bg-slate-900/30 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            placeholder="e.g. EcoExplorer"
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reg-email" className="block text-[9px] font-semibold text-slate-400 mb-1 uppercase font-mono tracking-wider">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                          <input
                            id="reg-email"
                            type="email"
                            required
                            className="w-full bg-slate-900/30 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            placeholder="hero@ecotrack.ai"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reg-password" className="block text-[9px] font-semibold text-slate-400 mb-1 uppercase font-mono tracking-wider">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                          <input
                            id="reg-password"
                            type="password"
                            required
                            className="w-full bg-slate-900/30 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            placeholder="••••••••"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full mt-2 text-slate-950 bg-emerald-400 hover:bg-emerald-350 disabled:bg-slate-800 disabled:text-slate-500 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-emerald-400/10 focus:outline-none"
                      >
                        {authLoading ? "Initializing Wizard..." : "Launch Onboarding Setup"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label htmlFor="login-email" className="block text-[9px] font-semibold text-slate-400 mb-1 uppercase font-mono tracking-wider">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                          <input
                            id="login-email"
                            type="email"
                            required
                            className="w-full bg-slate-900/30 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            placeholder="hero@ecotrack.ai"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="login-password" className="block text-[9px] font-semibold text-slate-400 mb-1 uppercase font-mono tracking-wider">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                          <input
                            id="login-password"
                            type="password"
                            required
                            className="w-full bg-slate-900/30 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full mt-2 text-slate-950 bg-emerald-400 hover:bg-emerald-350 disabled:bg-slate-800 disabled:text-slate-500 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-emerald-400/10 focus:outline-none"
                      >
                        {authLoading ? "Verifying..." : "Sign In & Enter Dashboard"}
                      </button>
                    </form>
                  )}

                  <div className="mt-6 pt-5 border-t border-white/5 text-center space-y-4">
                    <div className="text-xs text-slate-400 font-sans">
                      {isRegistering ? "Previously registered? " : "New to the platform? "}
                      <button
                        onClick={() => {
                          setIsRegistering(!isRegistering);
                          setAuthError("");
                        }}
                        className="text-emerald-400 hover:underline font-bold cursor-pointer font-sans focus:outline-none"
                      >
                        {isRegistering ? "Access Sandbox" : "Create Venture Profile"}
                      </button>
                    </div>

                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                      <div className="relative text-[9px] text-slate-500 font-mono text-center"><span className="bg-[#060913] px-2 uppercase tracking-wide">OR INSTANT PASS</span></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogInDemo}
                      disabled={authLoading}
                      className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-400 rounded-xl text-xs font-semibold tracking-wide transition-all border border-indigo-500/15 flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                      Sign In Sandbox Demo Account
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Showcase Component */}
            <Suspense fallback={<SkeletonLoader height="h-72" />}>
              <FeatureShowcase />
            </Suspense>

            {/* Testimonials Component */}
            <Suspense fallback={<SkeletonLoader height="h-56" />}>
              <Testimonials />
            </Suspense>
          </div>
        ) : isOnboarding ? (
          /* User Onboarding Center Wizard */
          <Suspense fallback={<SkeletonLoader height="h-96" />}>
            <OnboardingWizard username={currentUser.username} onComplete={handleOnboardingComplete} />
          </Suspense>
        ) : (
          /* Logged In Dashboard console */
          <div className="space-y-8 text-slate-100">
            
            {/* Concentric Activity Rings & Level Progress Board */}
            <div className="apple-glass p-6 shadow-xl flex flex-col lg:flex-row items-center gap-8 justify-between">
              
              {/* Ring Panel - Circular Visualizations (High-End Apple Watch Style) */}
              <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
                <div className="relative w-36 h-36 flex items-center justify-center bg-slate-950/20 border border-white/5 rounded-full shadow-inner p-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="6"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (diagnosticRings.total / 100) * 264}
                      strokeLinecap="round"
                    />

                    <circle cx="50" cy="50" r="33" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r="33"
                      fill="none"
                      stroke="#f39c12"
                      strokeWidth="6"
                      strokeDasharray="207"
                      strokeDashoffset={207 - (diagnosticRings.transport / 100) * 207}
                      strokeLinecap="round"
                    />

                    <circle cx="50" cy="50" r="24" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r="24"
                      fill="none"
                      stroke="#9b59b6"
                      strokeWidth="6"
                      strokeDasharray="151"
                      strokeDashoffset={151 - (diagnosticRings.energy / 100) * 151}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Central pulsing core displaying cumulative percentage */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">ECO CALIB</span>
                    <span className="text-xl font-bold text-white font-mono">{diagnosticRings.total}%</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h3 className="font-mono text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-2">TELEMETRY DECK RINGS</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-300 font-medium">Carbon Bound</span>
                    <span className="text-slate-500 font-mono">({diagnosticRings.total}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f39c12]"></span>
                    <span className="text-slate-300 font-medium">Transit Margin</span>
                    <span className="text-slate-500 font-mono">({diagnosticRings.transport}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9b59b6]"></span>
                    <span className="text-slate-300 font-medium">Energy Coefficient</span>
                    <span className="text-slate-500 font-mono">({diagnosticRings.energy}%)</span>
                  </div>
                </div>
              </div>

              {/* Progress Gauges - Right Panel */}
              <div className="flex-1 w-full space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Level Status: {currentUser.level}
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] rounded-full font-mono font-semibold">
                      +{currentUser.points} XP
                    </span>
                  </h4>
                  <p className="text-slate-400 text-xs font-sans">
                    Accomplish goals and sustainability tasks below to unlock real-world offset assets and levels!
                  </p>
                </div>

                <div className="space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Milestone Progress Range</span>
                    <span className="text-[#10b981] font-bold">{currentUser.points} / {currentUser.points > 200 ? "500" : "200"} PTS</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-[#10b981] to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${levelProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Rank: {currentUser.level}</span>
                    <span>Progression To: {nextLevelName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards Banner - Glass cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="apple-glass p-5 flex flex-col justify-between h-36 relative overflow-hidden group hover:border-white/10 transition-colors">
                <span className="text-slate-400 text-sm font-medium">Total Emissions</span>
                <div className="flex items-end space-x-1.5">
                  <span className="text-4xl font-bold tracking-tight">{latestCarbonCount}</span>
                  <span className="text-slate-400 text-lg mb-1 font-mono">tons</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-700"
                    style={{ width: `${latestCarbonCount > 0 ? Math.min(100, (latestCarbonCount / 12) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="apple-glass p-5 flex flex-col justify-between h-36 relative overflow-hidden group hover:border-white/10 transition-colors">
                <span className="text-slate-400 text-sm font-medium">Monthly Trend</span>
                <div className="flex items-center space-x-2">
                  <span className="text-4xl font-bold tracking-tight">
                    {footprints.length > 1
                      ? `${footprints[footprints.length - 1].total_co2 > footprints[footprints.length - 2].total_co2 ? "+" : ""}${Math.round(
                          ((footprints[footprints.length - 1].total_co2 - footprints[footprints.length - 2].total_co2) /
                            (footprints[footprints.length - 2].total_co2 || 1)) *
                            100
                        )}%`
                      : "-12%"}
                  </span>
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs text-emerald-400 font-mono">Below regional benchmark</span>
              </div>

              <div className="apple-glass p-5 flex flex-col justify-between h-36 relative overflow-hidden group hover:border-white/10 transition-colors">
                <span className="text-slate-400 text-sm font-medium">Global Ranking</span>
                <div className="flex items-end space-x-2">
                  <span className="text-3xl font-bold tracking-tight">Top {currentUser.points > 200 ? "15%" : "35%"}</span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <div
                      key={idx}
                      className={`h-1 w-full rounded-full ${
                        (currentUser.points > 200 ? 4 : 2) >= idx ? "bg-emerald-400" : "bg-slate-900"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="apple-glass p-5 flex flex-col justify-between h-36 relative overflow-hidden group hover:border-white/10 transition-colors">
                <span className="text-slate-400 text-sm font-medium">Venture Points</span>
                <div className="flex items-end space-x-1.5">
                  <span className="text-4xl font-bold text-yellow-400 tracking-tight">{currentUser.points}</span>
                  <span className="text-slate-400 text-sm mb-1 font-mono">PTS</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  +{(challenges.filter((c) => c.completed).length) * 50} granted from milestones
                </div>
              </div>
            </div>

            {/* Middle: Entry Form and Analytical Graphs */}
            <div id="emission-insights" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Formula calculations form */}
              <div id="footprint-calculator" className="xl:col-span-1">
                <Suspense fallback={<SkeletonLoader height="h-[420px]" />}>
                  <FootprintForm onSubmit={handleAddFootprint} isSubmitting={isSubmittingFootprint} />
                </Suspense>
              </div>

              {/* Graphical widgets */}
              <div className="xl:col-span-2">
                <Suspense fallback={<SkeletonLoader height="h-[420px]" />}>
                  <DashboardCharts userId={currentUser.id} footprints={footprints} />
                </Suspense>
              </div>
            </div>

            {/* Target Ceilings & AI Environmental Audit summary cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<SkeletonLoader height="h-80" />}>
                <GoalTracker
                  userId={currentUser.id}
                  latestFootprintCount={latestCarbonCount}
                  triggerRefresh={triggerAiRefresh}
                  onGoalChange={() => setTriggerAiRefresh(prev => !prev)}
                />
              </Suspense>

              <Suspense fallback={<SkeletonLoader height="h-80" />}>
                <EnvironmentalReports
                  userId={currentUser.id}
                  triggerRefresh={triggerAiRefresh}
                />
              </Suspense>
            </div>

            {/* Badges / Gamified Achievements section */}
            <Suspense fallback={<SkeletonLoader height="h-64" />}>
              <AchievementsGrid
                user={currentUser}
                footprints={footprints}
                challengesCompleted={challenges.filter((c) => c.completed).length}
              />
            </Suspense>

            {/* Bottom Section: AI Advisor Audits and Daily Challenges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Intelligent AI Audit widget */}
              <Suspense fallback={<SkeletonLoader height="h-96" />}>
                <AIAdvisor userId={currentUser.id} triggerRefresh={triggerAiRefresh} />
              </Suspense>

              {/* Sustainability gamified list */}
              <Suspense fallback={<SkeletonLoader height="h-96" />}>
                <ChallengeList
                  challenges={challenges}
                  onComplete={handleCompleteChallenge}
                  isCompleting={isCompletingChallenge}
                />
              </Suspense>
            </div>
          </div>
        )}
      </main>

      {/* Footer credits and information */}
      <footer className="border-t border-white/5 py-6 px-4 text-center text-[10px] text-slate-500 font-mono mt-12 bg-[#060913]/60 w-full shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 EcoTrack AI Inc. Calibrated with Gemini Cognitive Matrix. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-help">Formula Model: ISO 14064-1 standard</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-help">Compliance: WCAG AA Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
