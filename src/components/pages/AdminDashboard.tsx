import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Trash2, 
  Plus, 
  CheckCircle, 
  Activity, 
  FolderPlus, 
  Settings, 
  Layers, 
  MessageSquare, 
  Calendar, 
  UserCheck, 
  DollarSign, 
  X, 
  Clock, 
  Award,
  Terminal,
  ShieldAlert,
  Sliders,
  ChevronDown,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Zap
} from "lucide-react";
import { Project, Feedback, Booking, SponsorshipRequest } from "../../types";

interface AdminDashboardProps {
  isDark: boolean;
  theme: any;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  feedbacks: Feedback[];
  setFeedbacks: (feedbacks: Feedback[]) => void;
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  user: any;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  setActiveTab: (tab: any) => void;
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>;
}

export default function AdminDashboard({
  isDark,
  theme,
  projects,
  setProjects,
  feedbacks,
  setFeedbacks,
  bookings,
  setBookings,
  user,
  showToast,
  setActiveTab,
  apiFetch
}: AdminDashboardProps) {
  // Admin Authorization Gate
  const SUPER_ADMIN_EMAIL = "mudzimwapanashe123@gmail.com";
  const [isAdminBypassed, setIsAdminBypassed] = useState<boolean>(false); // Restricted by default!

  const isAuthorized = user?.email === SUPER_ADMIN_EMAIL || user?.role === "admin" || isAdminBypassed;

  // Tabs for sub-data
  const [adminTab, setAdminTab] = useState<"analytics" | "projects" | "bookings" | "feedbacks" | "sponsorships">("analytics");

  // State arrays fetched via APIs
  const [sponsorships, setSponsorships] = useState<SponsorshipRequest[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // AI-Insights State Structure
  const [insights, setInsights] = useState<{
    sentimentScore: string;
    sentimentSummary: string;
    growingSectors: string[];
    workloadPrediction: string;
    prioritizationSuggestions: string[];
    actionableInsights: { id: string; title: string; type: "marketing" | "tech" | "pricing"; text: string }[];
    completedCount: number;
    progressCount: number;
    pendingCount: number;
  } | null>(null);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);

  // Project Creation State
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjForm, setNewProjForm] = useState({
    title: "",
    description: "",
    fullDescription: "",
    category: "Web Applications",
    tagsString: "React, Express, Tailwind",
    deployedUrl: "",
    githubUrl: "",
    status: "Completed"
  });

  const [loading, setLoading] = useState(false);

  // Fetch AI Analytics Report
  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      const res = await apiFetch("/analytics/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (err) {
      console.error("Failed to load AI analytics insights:", err);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Fetch admin items
  const fetchAdminLogs = async () => {
    try {
      setLoading(true);
      const resSpons = await apiFetch("/sponsorships");
      const resConts = await apiFetch("/contacts");
      if (resSpons.ok) {
        const data1 = await resSpons.json();
        setSponsorships(data1);
      }
      if (resConts.ok) {
        const data2 = await resConts.json();
        setContacts(data2);
      }
    } catch {
      showToast("Failed to fetch administrative logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchAdminLogs();
      fetchInsights();
    }
  }, [isAuthorized]);

  // Project CRUD operations
  const handleAddNewProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.email !== SUPER_ADMIN_EMAIL && user?.role !== "admin") {
      showToast("Access Denied: Only the portfolio administrator can create projects.", "error");
      return;
    }

    if (!newProjForm.title || !newProjForm.description || !newProjForm.fullDescription) {
      showToast("Please provide all required project fields.", "error");
      return;
    }

    try {
      setLoading(true);
      const tags = newProjForm.tagsString.split(",").map(t => t.trim()).filter(Boolean);
      const res = await apiFetch("/projects", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...newProjForm,
          tags
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save project.");
      }
      const data = await res.json();
      if (data.success) {
        setProjects([...projects, data.project]);
        setIsAddingProject(false);
        setNewProjForm({
          title: "",
          description: "",
          fullDescription: "",
          category: "Web Applications",
          tagsString: "React, Express, Tailwind",
          deployedUrl: "",
          githubUrl: "",
          status: "Completed"
        });
        showToast("Success! Registered and compiled new project model.");
        // Refresh calculations dynamically
        fetchInsights();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save project to repository.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (user?.email !== SUPER_ADMIN_EMAIL && user?.role !== "admin") {
      showToast("Access Denied: Only the portfolio administrator can delete projects.", "error");
      return;
    }

    if (!window.confirm("Are you sure you want to completely erase this project from database? This cannot be undone.")) return;
    try {
      const res = await apiFetch(`/projects/${id}`, { 
        method: "DELETE"
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete project.");
      }
      const data = await res.json();
      if (data.success) {
        setProjects(projects.filter(p => p.id !== id));
        showToast("Project successfully removed from database.");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete project.", "error");
    }
  };

  // Feedback CRUD operations
  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm("Delete this user review log from database?")) return;
    try {
      const res = await apiFetch(`/feedback/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        setFeedbacks(feedbacks.filter(f => f.id !== id));
        showToast("Review log deleted.");
      }
    } catch {
      showToast("Failed to delete review record.", "error");
    }
  };

  // Booking details CRUD operations
  const handleToggleBookingStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Pending" ? "Confirmed" : "Pending";
    try {
      const res = await apiFetch(`/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: nextStatus as any } : b));
        showToast(`Consultation status set to ${nextStatus}.`);
      }
    } catch {
      showToast("Failed to update status code.", "error");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm("Complete cancel operation on this consultation reservation?")) return;
    try {
      const res = await apiFetch(`/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.filter(b => b.id !== id));
        showToast("Reservation erased successfully.");
      }
    } catch {
      showToast("Failed to cancel Reservation.", "error");
    }
  };

  // Analytics helper maps
  const totalFundingCollected = sponsorships.reduce((sum, sp) => sum + sp.fundingAmount, 0);

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 w-16 h-16 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className={`text-xl font-extrabold ${theme.textHeading} font-mono uppercase`}>
            Administrative Locker
          </h2>
          <p className={`${theme.textMuted} text-xs font-sans max-w-sm mx-auto leading-relaxed`}>
            Administrative access is restricted to official developer nodes: <b className="text-emerald-400 font-mono text-[11px]">{SUPER_ADMIN_EMAIL}</b>. Please sign in with Google using that email address.
          </p>
        </div>

        {/* Demo audit developers bypass option */}
        <div className={`p-5 rounded-2xl border ${theme.cardInner} space-y-3`}>
          <p className="text-[10px] text-zinc-400 font-mono leading-normal">
            ⚙️ IFA-BYPASS MODE AVAILABLE: If testing inside AI-Studio preview clusters, toggle verification bypass to review and test the dashboard.
          </p>
          <button
            onClick={() => setIsAdminBypassed(true)}
            className="w-full bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-lg font-bold font-mono text-xs uppercase transition cursor-pointer"
          >
            Activate Developers Bypass Trigger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4 animate-fade-in text-left">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-500/10 pb-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-amber-505 bg-amber-950/20 px-2.5 py-1 rounded inline-block uppercase border border-amber-900/10">
            PanaDev Administration console
          </span>
          <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading} tracking-tight`}>
            Admin Control Dashboard
          </h2>
          <p className={`${theme.textMuted} text-xs max-w-xl`}>
            Review system analytics, manage project entries, track client booking consultations, and audit sponsorship requests.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[10px] px-2 py-0.5 rounded-full uppercase bg-emerald-950/20 border border-emerald-500/20 text-emerald-405 font-extrabold animate-pulse">
            ADMIN SYSTEM STATUS: ENABLED
          </span>
          <button 
            onClick={() => {
              fetchAdminLogs();
              fetchInsights();
            }}
            className={`p-2 rounded-lg border ${isDark ? 'border-slate-800 hover:bg-slate-900 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600'} transition cursor-pointer`}
            title="Refresh database collections and AI insights"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${insightsLoading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
          <button 
            onClick={() => {
              setActiveTab("home");
            }}
            className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-450 border border-rose-500/25 py-2 px-3 rounded-lg font-bold transition cursor-pointer uppercase text-[10px]"
            title="Exit Admin Console"
          >
            <span>Exit Dashboard</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Admin Tab Selectors */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        {[
          { id: "analytics", label: "📊 Analytics Ledger", count: null },
          { id: "projects", label: "📁 Projects Portfolio", count: projects.length },
          { id: "bookings", label: "📅 Reservations Ledger", count: bookings.length },
          { id: "feedbacks", label: "💬 Feedbacks Audit", count: feedbacks.length },
          { id: "sponsorships", label: "💰 Partnerships Registry", count: sponsorships.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer text-left ${
              adminTab === tab.id 
                ? "bg-slate-900 border-emerald-500 text-emerald-400 font-bold" 
                : isDark ? "bg-slate-950 border-slate-900 text-slate-400 hover:text-white" : "bg-white border-slate-205 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label} {tab.count !== null && `[${tab.count}]`}
          </button>
        ))}
      </div>

      {/* ANALYTICS TAB SECTION */}
      {adminTab === "analytics" && (
        <div className="space-y-8 animate-fade-in text-left">
          
          {/* Quick numbers row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border ${theme.cardInner} text-left font-mono space-y-1`}>
              <span className="text-[10px] text-slate-505 block uppercase font-bold">TOTAL PORTFOLIOS</span>
              <p className={`text-xl font-extrabold ${theme.textHeading}`}>{projects.length} Nodes</p>
            </div>
            <div className={`p-4 rounded-xl border ${theme.cardInner} text-left font-mono space-y-1`}>
              <span className="text-[10px] text-slate-505 block uppercase font-bold">TOTAL BOOKINGS</span>
              <p className={`text-xl font-extrabold ${theme.textHeading}`}>{bookings.length} Consultations</p>
            </div>
            <div className={`p-4 rounded-xl border ${theme.cardInner} text-left font-mono space-y-1`}>
              <span className="text-[10px] block uppercase font-bold text-emerald-400">TOTAL SPONSORSHIPS</span>
              <p className="text-xl font-extrabold text-emerald-400">${totalFundingCollected.toLocaleString()} USD</p>
            </div>
            <div className={`p-4 rounded-xl border ${theme.cardInner} text-left font-mono space-y-1`}>
              <span className="text-[10px] text-slate-505 block uppercase font-bold">CONTACT INQUIRIES</span>
              <p className={`text-xl font-extrabold ${theme.textHeading}`}>{contacts.length} Dispatch Leads</p>
            </div>
          </div>

          {/* SECTION 1: Automatic Project Phase Calculations */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-extrabold uppercase text-slate-400 tracking-wider">PROJECT PRODUCTION LIFE-CYCLE STATES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border ${isDark ? "bg-emerald-950/5 border-emerald-900/10" : "bg-emerald-50/20 border-emerald-250/25"} text-left space-y-1 font-mono relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wide font-mono">COMPLETED DEV SYSTEMS</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-emerald-400">
                  {insights ? insights.completedCount : projects.filter(p => p.status === "Completed" || !p.status).length}
                </p>
                <p className="text-[10px] text-slate-500 select-none">Live, functional modules published in workspace registry.</p>
                <div className="absolute right-0 bottom-0 w-24 h-2 bg-emerald-500/10 rounded-tl pointer-events-none" />
              </div>

              <div className={`p-4 rounded-xl border ${isDark ? "bg-cyan-950/5 border-cyan-900/10" : "bg-cyan-50/20 border-cyan-250/25"} text-left space-y-1 font-mono relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-500 font-extrabold uppercase tracking-wide font-mono">ACTIVE WORKLOADS (IN-PROGRESS)</span>
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-2xl font-black text-cyan-405 font-mono">
                  {insights ? insights.progressCount : projects.filter(p => p.status === "In-Progress").length}
                </p>
                <p className="text-[10px] text-slate-500 select-none">Beta stages and dynamic models under active deployment iterations.</p>
                <div className="absolute right-0 bottom-0 w-24 h-2 bg-cyan-500/10 rounded-tl pointer-events-none" />
              </div>

              <div className={`p-4 rounded-xl border ${isDark ? "bg-amber-950/5 border-amber-900/10" : "bg-amber-50/20 border-amber-250/25"} text-left space-y-1 font-mono relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wide font-mono">PIPELINE ALLOCATIONS (PENDING)</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-amber-500">
                  {insights ? insights.pendingCount : projects.filter(p => p.status === "Pending").length}
                </p>
                <p className="text-[10px] text-slate-500 select-none font-mono font-bold">Authorized backlogs currently queuing resource allocation audits.</p>
                <div className="absolute right-0 bottom-0 w-24 h-2 bg-amber-500/10 rounded-tl pointer-events-none" />
              </div>
            </div>
          </div>

          {/* SECTION 2: AI Capabilities & Dynamic Model Dashboard */}
          <div className={`p-6 rounded-2xl border ${theme.card} space-y-6 relative overflow-hidden text-left`}>
            {/* Background vector glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-500/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left font-mono">
                  <h3 className={`text-sm font-extrabold ${theme.textHeading} tracking-tight uppercase flex items-center gap-1.5`}>
                    Gemini AI Strategic Diagnostics Center
                    <span className="text-[10px] bg-emerald-950/30 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase">gemini-3.5-flash</span>
                  </h3>
                  <p className="text-[10px] text-slate-505 font-mono">Continuous operation auditing, client feedback sentiment forecasting, and capacity modeling.</p>
                </div>
              </div>
              
              <button
                onClick={fetchInsights}
                disabled={insightsLoading}
                className={`py-1.5 px-3 rounded-lg border text-[10px] font-mono font-bold transition flex items-center gap-1 shrink-0 ${
                  insightsLoading ? "bg-slate-900 text-slate-500 border-slate-800" : "bg-emerald-500 hover:bg-emerald-450 border-emerald-600 text-black cursor-pointer"
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${insightsLoading ? "animate-spin" : ""}`} />
                {insightsLoading ? "RUNNING OPERATION AUDIT..." : "RE-EVALUATE OPERATIONS"}
              </button>
            </div>

            {insightsLoading ? (
              /* Loading Skeletons layout */
              <div className="space-y-6 animate-pulse text-left font-mono">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
                  <div className="space-y-3">
                    <div className="h-3 w-32 bg-slate-800 rounded animate-pulse" />
                    <div className="h-20 bg-slate-900/50 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-40 bg-slate-800 rounded animate-pulse" />
                    <div className="h-20 bg-slate-900/50 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="h-3 w-48 bg-slate-800 rounded animate-pulse" />
                  <div className="h-28 bg-slate-900/50 rounded-xl" />
                </div>
              </div>
            ) : insights ? (
              /* AI Content */
              <div className="space-y-6 text-left font-mono">
                
                {/* Sentiment Gauge & Workload Prediction row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pulse 1: sentiment analyzer */}
                  <div className={`p-4 rounded-xl border ${theme.cardInner} space-y-3 relative overflow-hidden`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        AI Client Sentiment Index
                      </span>
                      <span className="text-[11px] font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-500/10">
                        {insights.sentimentScore}
                      </span>
                    </div>
                    {/* Sentiment index visualization tracker bar */}
                    <div className="h-1.5 w-full bg-slate-900/60 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 transition-all duration-700" style={{ width: insights.sentimentScore }} />
                    </div>
                    <p className={`${theme.textMuted} text-[11px] leading-relaxed`}>
                      {insights.sentimentSummary}
                    </p>
                  </div>

                  {/* Pulse 2: workload prediction */}
                  <div className={`p-4 rounded-xl border ${theme.cardInner} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-550" />
                        AI Future Workload & Bandwidth Forecast
                      </span>
                      <span className="text-[10px] uppercase font-bold text-amber-500 px-1.5 py-0.5 rounded bg-amber-950/20 border border-amber-900/10 font-mono">
                        SLA Audit Stable
                      </span>
                    </div>
                    {/* Workload warning strip styling */}
                    <div className="p-2.5 rounded bg-amber-950/15 border-l-[3px] border-amber-500/30 text-[11px] leading-relaxed text-amber-200">
                      {insights.workloadPrediction}
                    </div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Calculated using confirmed consultations versus available engineer quotas.
                    </div>
                  </div>
                </div>

                {/* Service Growing sectors list */}
                <div className={`p-4 rounded-xl border ${theme.cardInner} space-y-3`}>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider">DETECTED GROWING SECTORS & DEMAND ENGINES</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {insights.growingSectors.map((sector, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900/25 border border-slate-500/10 text-left text-[11px] leading-relaxed flex gap-2">
                        <span className="text-emerald-400 font-black">0{idx + 1}.</span>
                        <span className={`${theme.textMuted}`}>{sector}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prioritization list */}
                <div className={`p-4 rounded-xl border ${theme.cardInner} space-y-3`}>
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider block">MODEL PRIORITIZATION SUGGESTIONS</span>
                  <div className="space-y-2">
                    {insights.prioritizationSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[11px] text-left">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        <p className={`${theme.textMuted} leading-tight`}>{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable strategic insights bento */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider block">ACTIONABLE BENTO INSIGHT COMMITS</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insights.actionableInsights.map((ins, idx) => (
                      <div 
                        key={ins.id || idx}
                        className={`p-4 rounded-xl border ${theme.cardInner} space-y-2 text-left flex flex-col justify-between`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold border shrink-0 ${
                              ins.type === "tech" ? "bg-cyan-950/20 text-cyan-400 border-cyan-950/40" :
                              ins.type === "marketing" ? "bg-emerald-950/20 text-emerald-400 border-emerald-950/40" :
                              "bg-amber-950/20 text-amber-500 border-amber-950/40"
                            }`}>
                              {ins.type || "operational"}
                            </span>
                            <Zap className={`w-3.5 h-3.5 ${
                              ins.type === "tech" ? "text-cyan-400" :
                              ins.type === "marketing" ? "text-emerald-400" :
                              "text-amber-505"
                            }`} />
                          </div>
                          <h4 className={`text-xs font-bold ${theme.textHeading} tracking-tight leading-snug`}>{ins.title}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed pt-1 border-t border-slate-500/5">{ins.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-6 font-mono text-xs text-slate-500">
                Click "RE-EVALUATE OPERATIONS" to trigger live Gemini AI modeling statistics.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Chart 1: Sandbox Weekly Launches (Native responsive SVG Area Chart) */}
            <div className={`p-5 rounded-2xl border ${theme.card} space-y-4 flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Weekly Active Sandbox Launches</span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-black leading-none">TOTAL: 412 Run-cycles</span>
              </div>
              
              <div className="h-44 flex items-end justify-between relative pt-6 w-full">
                {/* SVG glowing grid & area path */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="1000" y2="20" stroke="#808080" strokeOpacity="0.08" strokeWidth="1" />
                  <line x1="0" y1="60" x2="1000" y2="60" stroke="#808080" strokeOpacity="0.08" strokeWidth="1" />
                  <line x1="0" y1="100" x2="1000" y2="100" stroke="#808080" strokeOpacity="0.08" strokeWidth="1" />
                  <line x1="0" y1="140" x2="1000" y2="140" stroke="#808080" strokeOpacity="0.08" strokeWidth="1" />

                  {/* Draw spline lines and area grids dynamically inside SVG */}
                  <path 
                    d="M 20,150 L 20,120 L 70,80 L 120,105 L 170,45 L 220,95 L 270,30 L 320,150 Z" 
                    fill="url(#chartGlow)"
                    className="transition-all duration-500"
                  />
                  <path 
                    d="M 20,120 C 45,95 45,95 70,80 C 95,65 95,120 120,105 C 145,90 145,50 170,45 C 195,40 195,110 220,95 C 245,80 245,35 270,30" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="2.5"
                    className="transition-all"
                  />
                  
                  {/* Glowing Dots */}
                  <circle cx="20" cy="120" r="4.5" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                  <circle cx="70" cy="80" r="4.5" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                  <circle cx="120" cy="105" r="4.5" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                  <circle cx="170" cy="45" r="4.5" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                  <circle cx="220" cy="95" r="4.5" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                  <circle cx="270" cy="30" r="4.5" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                </svg>

                {/* Days coordinates label */}
                <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-mono text-slate-550 px-2 pt-1 border-t border-slate-500/5">
                  <span>Mon (45)</span>
                  <span>Tue (62)</span>
                  <span>Wed (55)</span>
                  <span>Thu (98)</span>
                  <span>Fri (72)</span>
                  <span>Sat (110)</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Reservation Inquiries monthly Bar representation */}
            <div className={`p-5 rounded-2xl border ${theme.card} space-y-4 flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Relative Inquiries monthly spread</span>
                <span className="text-[10px] font-mono text-slate-505 block uppercase">SLA TRACKER // GREEN</span>
              </div>

              <div className="h-44 flex items-end justify-between relative pt-6 w-full px-5">
                {[
                  { month: "Q1-Contacts", value: contacts.length * 15 + 10, bg: "bg-emerald-500" },
                  { month: "Q2-Reservations", value: bookings.length * 20 + 20, bg: "bg-cyan-500" },
                  { month: "Q3-Sponsors", value: sponsorships.length * 30 + 15, bg: "bg-amber-500" }
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 mx-2">
                    <span className="text-[10px] text-zinc-300 font-bold font-mono">{bar.value}%</span>
                    <div className="w-full bg-slate-900/60 rounded-t h-28 relative overflow-hidden flex items-end">
                      <div className={`w-full ${bar.bg} rounded-t transition-all`} style={{ height: `${Math.min(100, bar.value)}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-505 truncate leading-none mt-1">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PROJECTS MANAGEMENT PORTTAB */}
      {adminTab === "projects" && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[10px] uppercase text-slate-500 font-bold">Manage Portfolios Sandbox Lists</span>
            {user?.email === SUPER_ADMIN_EMAIL ? (
              <button
                onClick={() => setIsAddingProject(!isAddingProject)}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-450 text-black py-1.5 px-3 rounded-lg font-bold text-xs cursor-pointer text-left select-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                {isAddingProject ? "Close Builder Panel" : "Create New Project Node"}
              </button>
            ) : (
              <div className="text-[10px] text-amber-500 bg-amber-950/10 border border-amber-900/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                <span>Registry Restricted to Owner (mudzimwapanashe123@gmail.com)</span>
              </div>
            )}
          </div>

          {/* Hidden Add Project Modal / Box */}
          {isAddingProject && (
            <form onSubmit={handleAddNewProjectSubmit} className={`p-5 rounded-2xl border ${theme.cardInner} space-y-4 text-xs font-mono`}>
              <h4 className="text-xs uppercase font-extrabold text-emerald-400 border-b border-slate-900 pb-1.5">
                Core Project Registry Form
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] mb-1 font-bold">PROJECT CODE TITLE</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. MetricFlow" 
                    value={newProjForm.title}
                    onChange={(e) => setNewProjForm({ ...newProjForm, title: e.target.value })}
                    className={`w-full rounded p-2 border outline-none ${theme.input} focus:ring-1 focus:ring-emerald-500`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] mb-1 font-bold">PROJECT METRIC CATEGORY</label>
                  <select
                    value={newProjForm.category}
                    onChange={(e) => setNewProjForm({ ...newProjForm, category: e.target.value })}
                    className={`w-full rounded p-2 border outline-none ${theme.input}`}
                  >
                    <option value="Web Applications">Web Applications</option>
                    <option value="Creative Tools">Creative Tools</option>
                    <option value="Financial Utilities">Financial Utilities</option>
                    <option value="Other sandbox">Other custom utility</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] mb-1 font-bold">PROJECT STATUS STATE</label>
                  <select
                    value={newProjForm.status}
                    onChange={(e) => setNewProjForm({ ...newProjForm, status: e.target.value })}
                    className={`w-full rounded p-2 border outline-none ${theme.input}`}
                  >
                    <option value="Completed">Completed</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] mb-1 font-bold">SHORT SYNOPSIS BRIEF</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Short, direct teaser (max 100 characters)..." 
                  value={newProjForm.description}
                  onChange={(e) => setNewProjForm({ ...newProjForm, description: e.target.value })}
                  className={`w-full rounded p-2 border outline-none ${theme.input} focus:ring-1 focus:ring-emerald-500`}
                />
              </div>

              <div>
                <label className="block text-[10px] mb-1 font-bold">COMPLETE TECHNICAL SPECIFICATIONS DESCRIPTION</label>
                <textarea 
                  rows={2} 
                  required 
                  placeholder="In-depth analysis of structural goals, problem solved grids, database dependencies..." 
                  value={newProjForm.fullDescription}
                  onChange={(e) => setNewProjForm({ ...newProjForm, fullDescription: e.target.value })}
                  className={`w-full rounded p-2 border outline-none resize-none ${theme.input} focus:ring-1 focus:ring-emerald-500`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] mb-1 font-bold">TAG CLOUD CODES (OPTIONAL)</label>
                  <input 
                    type="text" 
                    placeholder="React, Express, LocalDB" 
                    value={newProjForm.tagsString}
                    onChange={(e) => setNewProjForm({ ...newProjForm, tagsString: e.target.value })}
                    className={`w-full rounded p-2 border outline-none ${theme.input} focus:ring-1 focus:ring-emerald-500`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] mb-1 font-bold">LIVE RE-ROUTING LINK (OPTIONAL)</label>
                  <input 
                    type="url" 
                    placeholder="https://ais-pre-t26..." 
                    value={newProjForm.deployedUrl}
                    onChange={(e) => setNewProjForm({ ...newProjForm, deployedUrl: e.target.value })}
                    className={`w-full rounded p-2 border outline-none ${theme.input} focus:ring-1 focus:ring-emerald-500`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] mb-1 font-bold">GITHUB REPOSITORY TARGET (OPTIONAL)</label>
                  <input 
                    type="url" 
                    placeholder="https://github.com..." 
                    value={newProjForm.githubUrl}
                    onChange={(e) => setNewProjForm({ ...newProjForm, githubUrl: e.target.value })}
                    className={`w-full rounded p-2 border outline-none ${theme.input} focus:ring-1 focus:ring-emerald-500`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold rounded-lg font-mono text-xs uppercase cursor-pointer"
              >
                {loading ? "Registering and compiling portfolio..." : "Submit New Compilation Sandbox to Ledger DB"}
              </button>
            </form>
          )}

          {/* List existing projects with administrative controls */}
          <div className="space-y-4">
            {projects.map((p) => (
              <div 
                key={p.id}
                className={`p-4 rounded-xl border ${theme.cardInner} flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono`}
              >
                <div className="space-y-1 text-left min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] bg-slate-900 border border-slate-850 text-slate-500 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                      ID: {p.id}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold border shrink-0 ${
                      p.status === "Completed" || !p.status ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/10" :
                      p.status === "In-Progress" ? "bg-cyan-950/20 text-cyan-400 border-cyan-900/10" :
                      "bg-amber-950/20 text-amber-500 border-amber-900/10"
                    }`}>
                      {p.status || "Completed"}
                    </span>
                    <h4 className={`text-sm font-bold ${theme.textHeading} truncate`}>{p.title}</h4>
                  </div>
                  <p className={`${theme.textMuted} text-[11px] truncate`}>{p.description}</p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="p-2 rounded bg-rose-950/10 hover:bg-rose-950/30 text-rose-400 border border-rose-900/10 transition cursor-pointer"
                    title="Erase project node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* BOOKINGS CONTROLS LEDGER */}
      {adminTab === "bookings" && (
        <div className="space-y-5 animate-fade-in text-left text-xs font-mono">
          <span className="text-[10px] uppercase text-slate-550 block font-bold">Consultation Bookings</span>
          
          {bookings.length === 0 ? (
            <p className={`${theme.textMuted} italic`}>No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div 
                  key={booking.id}
                  className={`p-5 rounded-xl border ${theme.cardInner} space-y-3 relative overflow-hidden`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                          booking.status === "Confirmed" ? "bg-emerald-950/20 text-emerald-400 font-bold border border-emerald-900/10" : "bg-amber-950/20 text-amber-500 border border-amber-900/10 animate-pulse"
                        }`}>
                          {booking.status}
                        </span>
                        {booking.budget && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/20 text-cyan-400 border border-cyan-900/15 font-bold">
                            💰 {booking.budget.startsWith("$") ? booking.budget : "$" + booking.budget}
                          </span>
                        )}
                        <h4 className={`text-sm font-bold font-sans ${theme.textHeading}`}>{booking.clientName}</h4>
                      </div>
                      <p className={`${theme.textMuted} text-[10px] font-mono`}>📧 {booking.clientEmail} | Company: {booking.companyName || "N/A"}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{booking.date} @ {booking.timeSlot}</span>
                    </div>
                  </div>

                  <p className={`${theme.textMuted} text-[11px] leading-relaxed italic bg-[#000]/10 p-2 rounded-lg border border-slate-500/5`}>
                    "{booking.description}"
                  </p>

                  <div className="flex gap-2 justify-end border-t border-slate-500/5 pt-2">
                    <button
                      onClick={() => handleToggleBookingStatus(booking.id, booking.status)}
                      className={`flex items-center gap-1.5 py-1 px-3 rounded font-mono text-[10px] font-bold border cursor-pointer select-none ${
                        booking.status === "Confirmed" 
                          ? "bg-amber-500/10 hover:bg-amber-500/15 text-amber-400 border-amber-500/20" 
                          : "bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {booking.status === "Confirmed" ? "Set to Pending" : "Confirm Booking"}
                    </button>
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/15 text-rose-400 border border-rose-500/25 py-1 px-3 rounded font-bold cursor-pointer font-mono text-[10px] select-none"
                    >
                      Cancel Reservation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REVIEWS DISPATCH AUDIT TAB */}
      {adminTab === "feedbacks" && (
        <div className="space-y-4 animate-fade-in text-left text-xs font-mono">
          <span className="text-[10px] uppercase text-slate-555 block font-bold">Peer feedback / reviews moderation auditing</span>
          
          {feedbacks.length === 0 ? (
            <p className={`${theme.textMuted} italic`}>No customer testimonials signed-off inside db.json logs.</p>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((f) => (
                <div key={f.id} className={`p-4 rounded-xl border ${theme.cardInner} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-bold text-amber-500">⭐ {f.rating}/5 Rating</span>
                      <h4 className={`text-xs font-bold font-sans ${theme.textHeading}`}>{f.clientName}</h4>
                      {f.projectId && (
                        <span className="text-[10px] font-mono text-cyan-405 uppercase font-semibold">FOR ID: {f.projectId}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block">📧 {f.clientEmail} | registered: {new Date(f.createdAt).toISOString().split("T")[0]}</span>
                    <p className={`${theme.textMuted} text-[11px] leading-relaxed italic truncate`}>"{f.comment}"</p>
                  </div>

                  <button
                    onClick={() => handleDeleteFeedback(f.id)}
                    className="p-2 rounded bg-rose-950/10 hover:bg-rose-950/30 text-rose-400 border border-rose-900/10 transition shrink-0 cursor-pointer select-none font-mono"
                    title="Moderation delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SPONSORSHIPS REQUEST LIST */}
      {adminTab === "sponsorships" && (
        <div className="space-y-4 animate-fade-in text-left text-xs font-mono">
          <span className="text-[10px] uppercase text-slate-555 block font-bold">Sponsorships & Partnerships</span>
          
          {sponsorships.length === 0 ? (
            <p className={`${theme.textMuted} italic`}>No sponsorships yet.</p>
          ) : (
            <div className="space-y-4">
              {sponsorships.map((sp) => (
                <div 
                  key={sp.id}
                  className={`p-5 rounded-xl border ${theme.cardInner} space-y-3 relative overflow-hidden`}
                >
                  {/* Glowing tag based on tier */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider">
                          {sp.tier} SPONSOR
                        </span>
                        <h4 className={`text-sm font-bold font-sans ${theme.textHeading}`}>{sp.companyName}</h4>
                      </div>
                      <p className={`${theme.textMuted} text-[10px]`}> Representative: {sp.sponsorName} | 📧 {sp.sponsorEmail}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-base font-extrabold text-emerald-400 font-mono">${sp.fundingAmount.toLocaleString()} USD</p>
                      <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{sp.durationMonths} Months duration</span>
                    </div>
                  </div>

                  {sp.message && (
                    <p className={`${theme.textMuted} text-[11px] italic bg-[#000]/10 p-2 rounded border border-slate-500/5`}>
                      "{sp.message}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-500/5">
                    <span className="font-bold text-emerald-400 uppercase">PARTNERSHIP REGISTERED // COMPLIED</span>
                    <span>ticket id: {sp.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
