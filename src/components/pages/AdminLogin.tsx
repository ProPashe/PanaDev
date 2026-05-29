import React, { useState } from "react";
import { Terminal, ShieldCheck, Loader2, Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";

interface AdminLoginProps {
  isDark: boolean;
  theme: any;
  onLoginSuccess: (user: any, token: string) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
  setActiveTab: (tab: any) => void;
}

export default function AdminLogin({
  isDark,
  theme,
  onLoginSuccess,
  showToast,
  setActiveTab
}: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter both email and password.", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        onLoginSuccess(data.user, data.token);
        showToast("Authenticated successfully as Admin! ✓", "success");
      } else {
        showToast(data.error || "Invalid email or password.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error during authentication. Check server status.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center p-4">
      {/* Decorative premium ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none animate-pulse" />

      {/* Back to Home Navigation */}
      <button 
        onClick={() => setActiveTab("home")}
        className={`absolute top-0 left-0 flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase transition-colors py-2 px-4 rounded-xl border ${
          isDark 
            ? "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/40" 
            : "border-slate-200 text-slate-655 hover:text-slate-900 hover:bg-slate-50"
        } cursor-pointer`}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return Home</span>
      </button>

      {/* Glassmorphic Auth Card Container */}
      <div className={`w-full max-w-md rounded-3xl border p-8 md:p-10 space-y-8 relative overflow-hidden backdrop-blur-md transition-all duration-300 ${
        isDark 
          ? "bg-slate-950/40 border-slate-900/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-slate-800/80" 
          : "bg-white/80 border-slate-200/90 shadow-[0_20px_40px_rgba(15,23,42,0.05)] hover:border-slate-300"
      }`}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Card Header & Branding */}
        <div className="text-center space-y-3.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-[1.5px] mx-auto shadow-lg shadow-emerald-500/10 group hover:scale-105 transition-transform duration-300">
            <div className={`w-full h-full rounded-2xl flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-white"}`}>
              <Terminal className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className={`text-xl font-extrabold font-mono tracking-tight uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
              PanaDev Gateway
            </h3>
            <p className={`text-xs font-mono uppercase tracking-widest ${isDark ? "text-emerald-500 font-bold" : "text-emerald-600 font-bold"}`}>
              Secure Admin Verification
            </p>
          </div>
          <p className={`text-[11px] max-w-[260px] mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Authenticate below to establish a secure administrative session context.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left font-mono">
          
          {/* Email Input Node */}
          <div className="space-y-2">
            <label className={`text-[10px] font-extrabold uppercase tracking-wider block pl-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Admin Email Context
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="developer@panadev.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className={`w-full py-3 pl-11 pr-4 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all placeholder-slate-600 ${
                  isDark 
                    ? "bg-slate-900/30 border-slate-800 text-slate-200 focus:ring-emerald-500/10 focus:border-emerald-500/50 hover:border-slate-700" 
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-emerald-500/10 focus:border-emerald-500/50 hover:border-slate-300"
                }`}
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Passkey Input Node */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Administrative Key
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                className={`w-full py-3 pl-11 pr-11 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all placeholder-slate-600 ${
                  isDark 
                    ? "bg-slate-900/30 border-slate-800 text-slate-200 focus:ring-emerald-500/10 focus:border-emerald-500/50 hover:border-slate-700" 
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-emerald-500/10 focus:border-emerald-500/50 hover:border-slate-300"
                }`}
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submission Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Validating Session Context...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Establish Credentials ✓</span>
              </>
            )}
          </button>
        </form>

        {/* Security Warning Footer */}
        <div className={`pt-6 border-t font-mono text-[9px] leading-relaxed text-center ${
          isDark ? "border-slate-900/80 text-slate-500" : "border-slate-200 text-slate-550"
        }`}>
          <span>SYSTEM NOTICE: This node records telemetry audits. Unauthorized access vectors are reported to root admin authorities.</span>
        </div>
      </div>
    </div>
  );
}
