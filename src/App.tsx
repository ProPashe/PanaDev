import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Layers, Grid3X3, Sliders, Users, Calendar, UserCheck, MessageSquare,
  Award, ShieldCheck, Sun, Moon, Menu, X, Terminal, LogOut, Loader2
} from "lucide-react";
import { auth, signInWithGoogle, checkRedirectResult, firebaseSignOut, getAuthToken } from "@/src/lib/firebase";
import Home from "@/src/components/pages/Home";
import Projects from "@/src/components/pages/Projects";
import Services from "@/src/components/pages/Services";
import About from "@/src/components/pages/About";
import Bookings from "@/src/components/pages/Booking";
import Sponsorship from "@/src/components/pages/Sponsorship";
import FeedbackPage from "@/src/components/pages/Feedback";
import ClientHub from "@/src/components/pages/ClientHub";
import AdminDashboard from "@/src/components/pages/AdminDashboard";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

type Tab = "home" | "projects" | "services" | "about" | "booking" | "sponsorship" | "feedback" | "admin" | "clienthub";

interface User { name: string; email: string; avatarUrl: string }
interface Project {
  id: string; title: string; description: string; fullDescription: string;
  tags: string[]; deployedUrl: string; githubUrl: string; category: string;
  status?: string; metrics: { stars: number; downloads?: string; users?: string };
}
interface Feedback {
  id: string; projectId: string; clientName: string; clientEmail: string;
  rating: number; comment: string; createdAt: string;
}
interface Booking {
  id: string; clientName: string; clientEmail: string; companyName?: string;
  date: string; timeSlot: string; projectType: string;
  description: string; createdAt: string; status: string; budget?: string;
}

function AppInner() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInName, setSignInName] = useState("");
  const [signInEmail, setSignInEmail] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [successModalData, setSuccessModalData] = useState<{
    type: string; title: string; message: string; whatsAppUrl: string; whatsAppText: string;
  } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [sponsorLoading, setSponsorLoading] = useState(false);

  const [feedbackForm, setFeedbackForm] = useState({ clientName: "", clientEmail: "", rating: 5, comment: "", projectId: "" });
  const [bookingForm, setBookingForm] = useState({ clientName: "", clientEmail: "", companyName: "", date: new Date().toISOString().split("T")[0], timeSlot: "02:00 PM - 03:00 PM", projectType: "web" as const, description: "", budget: "" });
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sponsorForm, setSponsorForm] = useState({ sponsorName: "", sponsorEmail: "", phone: "", companyName: "", fundingAmount: 0, website: "", message: "" });
  const [idToken, setIdToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const BASE = "";

  // Auth-aware API fetch — attaches Bearer token for admin-protected routes
  const apiFetch = async (path: string, init?: RequestInit) => {
    const token = idToken || await getAuthToken();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    return fetch(`${BASE}/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...authHeaders, ...(init?.headers || {}) }
    });
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
        const initials = (firebaseUser.displayName || firebaseUser.email || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase();
        const loggedUser = {
          name: firebaseUser.displayName || firebaseUser.email || "User",
          email: firebaseUser.email || "",
          avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=059669`
        };
        setUser(loggedUser);
        localStorage.setItem("panadev_user", JSON.stringify(loggedUser));
        setIsSignInModalOpen(false);
      } else {
        setIdToken(null);
        // Don't wipe user — allow guest browsing from localStorage
      }
    });
    return () => unsubscribe();
  }, []);

  // Check for redirect result after Google sign-in
  useEffect(() => {
    checkRedirectResult()
      .then((result) => {
        if (result) {
          const { user: firebaseUser, token } = result;
          setIdToken(token);
          const loggedUser = {
            name: firebaseUser.displayName || firebaseUser.email || "User",
            email: firebaseUser.email || "",
            avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${(firebaseUser.displayName || "U")[0]}&backgroundColor=059669`
          };
          setUser(loggedUser);
          localStorage.setItem("panadev_user", JSON.stringify(loggedUser));
          setIsSignInModalOpen(false);
          showToast(`Welcome, ${loggedUser.name}! ✓`);
        }
      })
      .catch((err) => {
        console.error("Redirect result error:", err);
      });
  }, []);

  // Load theme
  useEffect(() => {
    const theme = localStorage.getItem("panadev_theme");
    if (theme) setIsDark(theme === "dark");
    // Restore guest user from localStorage on first load
    const stored = localStorage.getItem("panadev_user");
    if (stored && !auth.currentUser) { try { setUser(JSON.parse(stored)); } catch {} }
  }, []);

  // Sync forms when user changes
  useEffect(() => {
    if (user) {
      setFeedbackForm(f => ({ ...f, clientName: user.name, clientEmail: user.email }));
      setBookingForm(b => ({ ...b, clientName: user.name, clientEmail: user.email }));
      setContactForm(c => ({ ...c, name: user.name, email: user.email }));
      setSponsorForm(s => ({ ...s, sponsorName: user.name, sponsorEmail: user.email, phone: s.phone }));
    } else {
      setFeedbackForm({ clientName: "", clientEmail: "", rating: 5, comment: "", projectId: "" });
      setBookingForm({ clientName: "", clientEmail: "", companyName: "", date: new Date().toISOString().split("T")[0], timeSlot: "02:00 PM - 03:00 PM", projectType: "web", description: "", budget: "" });
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setSponsorForm({ sponsorName: "", sponsorEmail: "", phone: "", companyName: "", fundingAmount: 0, website: "", message: "" });
    }
  }, [user]);

  // Fetch public data (projects + feedbacks)
  useEffect(() => {
    Promise.all([
      apiFetch("/projects").then(r => r.json()).catch(() => []),
      apiFetch("/feedback").then(r => r.json()).catch(() => []),
    ]).then(([p, f]) => {
      setProjects(Array.isArray(p) ? p : []);
      setFeedbacks(Array.isArray(f) ? f : []);
    }).finally(() => setIsLoading(false));
  }, []);

  // Fetch admin-only data when authenticated
  useEffect(() => {
    if (!idToken) return;
    Promise.all([
      apiFetch("/bookings").then(r => r.json()).catch(() => []),
      apiFetch("/sponsorships").then(r => r.json()).catch(() => []),
    ]).then(([b, s]) => {
      setBookings(Array.isArray(b) ? b : []);
      setSponsorships(Array.isArray(s) ? s : []);
    });
  }, [idToken]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      // signInWithGoogle now redirects — the result is handled by checkRedirectResult on next load
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "Sign-in failed. Please try again.", "error");
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await firebaseSignOut();
    setUser(null);
    setIdToken(null);
    localStorage.removeItem("panadev_user");
    showToast("Signed out successfully.");
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.clientName || !feedbackForm.comment) { showToast("Fill in all required fields.", "error"); return; }
    try {
      setFeedbackLoading(true);
      const projId = feedbackForm.projectId || selectedProjectId || "general";
      const res = await apiFetch("/feedback", { method: "POST", body: JSON.stringify({ ...feedbackForm, projectId: projId }) });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(prev => [data.feedback, ...prev]);
        const waText = `Hello Panashe! I submitted client feedback:\n\nName: ${feedbackForm.clientName}\nEmail: ${feedbackForm.clientEmail}\nRating: ${feedbackForm.rating}/5\n\nComment: "${feedbackForm.comment}"`;
        setSuccessModalData({ type: "feedback", title: "Review Submitted!", message: `Your ${feedbackForm.rating}-star review has been received. Thank you!`, whatsAppUrl: `https://wa.me/263713058383?text=${encodeURIComponent(waText)}`, whatsAppText: "Follow up on WhatsApp" });
        setFeedbackForm(f => ({ ...f, comment: "", projectId: "" }));
        showToast("Review submitted!");
      } else { showToast(data.error || "Error submitting review.", "error"); }
    } catch { showToast("Something went wrong.", "error"); }
    finally { setFeedbackLoading(false); }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.clientName || !bookingForm.description) { showToast("Fill in all required fields.", "error"); return; }
    try {
      setBookingLoading(true);
      const res = await apiFetch("/bookings", { method: "POST", body: JSON.stringify(bookingForm) });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => [data.booking, ...prev]);
        const waText = `Hello Panashe! I booked a consultation:\n\nName: ${bookingForm.clientName}\nEmail: ${bookingForm.clientEmail}\nCompany: ${bookingForm.companyName || "N/A"}\nType: ${bookingForm.projectType}\nDate: ${bookingForm.date} @ ${bookingForm.timeSlot}\nBudget: ${bookingForm.budget || "Not specified"}\n\nDetails: "${bookingForm.description}"`;
        setSuccessModalData({ type: "booking", title: "Consultation Booked!", message: `Your appointment on ${bookingForm.date} at ${bookingForm.timeSlot} is confirmed. We will reach out shortly.`, whatsAppUrl: `https://wa.me/263713058383?text=${encodeURIComponent(waText)}`, whatsAppText: "Confirm via WhatsApp" });
        setBookingForm(b => ({ ...b, companyName: "", description: "", budget: "" }));
        showToast("Consultation booked!");
      } else { showToast(data.error || "Error booking.", "error"); }
    } catch { showToast("Something went wrong.", "error"); }
    finally { setBookingLoading(false); }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) { showToast("Fill in all required fields.", "error"); return; }
    try {
      setContactLoading(true);
      const res = await apiFetch("/contacts", { method: "POST", body: JSON.stringify(contactForm) });
      const data = await res.json();
      if (data.success) {
        const waText = `Hello Panashe! I submitted an inquiry:\n\nName: ${contactForm.name}\nEmail: ${contactForm.email}\nSubject: ${contactForm.subject || "General"}\n\nMessage: "${contactForm.message}"`;
        setSuccessModalData({ type: "contact", title: "Message Sent!", message: `Your message about "${contactForm.subject || "General Enquiry"}" has been received. We will get back to you soon.`, whatsAppUrl: `https://wa.me/263713058383?text=${encodeURIComponent(waText)}`, whatsAppText: "Follow up via WhatsApp" });
        setContactForm(c => ({ ...c, subject: "", message: "" }));
        showToast("Message sent!");
      } else { showToast(data.error || "Error sending.", "error"); }
    } catch { showToast("Something went wrong.", "error"); }
    finally { setContactLoading(false); }
  };

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorForm.sponsorName || !sponsorForm.sponsorEmail || !sponsorForm.phone) { showToast("Fill in all required fields.", "error"); return; }
    try {
      setSponsorLoading(true);
      const res = await apiFetch("/sponsorships", { method: "POST", body: JSON.stringify(sponsorForm) });
      const data = await res.json();
      if (data.id || data.success !== false) {
        const waText = `Hello Panashe! New sponsorship enquiry:\n\nName: ${sponsorForm.sponsorName}\nEmail: ${sponsorForm.sponsorEmail}\nPhone: ${sponsorForm.phone}\nCompany: ${sponsorForm.companyName || "N/A"}\nAmount: $${sponsorForm.fundingAmount}\nWebsite: ${sponsorForm.website || "N/A"}\n\nMessage: "${sponsorForm.message || "None"}"`;
        setSuccessModalData({ type: "sponsor", title: "Enquiry Received!", message: `Thank you, ${sponsorForm.sponsorName}! Your sponsorship enquiry has been received. We will contact you at ${sponsorForm.sponsorEmail} or ${sponsorForm.phone} within 24 hours.`, whatsAppUrl: `https://wa.me/263713058383?text=${encodeURIComponent(waText)}`, whatsAppText: "Discuss on WhatsApp" });
        setSponsorForm({ sponsorName: "", sponsorEmail: "", phone: "", companyName: "", fundingAmount: 0, website: "", message: "" });
        showToast("Sponsorship enquiry submitted!");
      } else { showToast(data.error || "Error submitting.", "error"); }
    } catch { showToast("Something went wrong.", "error"); }
    finally { setSponsorLoading(false); }
  };

  const theme = {
    bg: isDark ? "bg-[#070b13] text-zinc-100" : "bg-[#f8fafc] text-slate-800",
    sidebar: isDark ? "bg-[#090e18] border-slate-900/80" : "bg-white border-slate-200 shadow-xs",
    sidebarHeader: isDark ? "bg-[#0a101c]/40 border-b border-slate-900/85" : "bg-slate-50 border-b border-slate-200",
    sidebarFooter: isDark ? "border-t border-slate-900 bg-[#060a12]/50 text-slate-500" : "border-t border-slate-200 bg-slate-50/85 text-slate-600",
    sidebarBtnActive: isDark ? "bg-slate-900 text-emerald-400 border border-slate-800 font-black shadow" : "bg-emerald-50 text-emerald-800 border border-emerald-200/50 font-black",
    sidebarBtnInactive: isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-950/20" : "text-slate-500 hover:text-slate-850 hover:bg-slate-100",
    card: isDark ? "bg-slate-950 border border-slate-900 text-zinc-100" : "bg-white border border-slate-200 text-slate-800 shadow-xs",
    cardInner: isDark ? "bg-[#04080e] border border-slate-950" : "bg-slate-50 border border-slate-200",
    badge: isDark ? "bg-emerald-950/40 border border-emerald-900/40 text-emerald-400" : "bg-emerald-50 border border-emerald-200 text-emerald-800",
    textMuted: isDark ? "text-slate-400" : "text-slate-600",
    textHeading: isDark ? "text-white" : "text-slate-900",
    input: isDark ? "bg-slate-900 border border-slate-800 text-white placeholder-slate-500" : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white",
  };

  const isAdmin = user?.email === "mudzimwapanashe123@gmail.com";

  const navGroups = [
    { label: "Navigate", items: [
      { id: "home",     label: "Home",     icon: <Layers className="w-4 h-4 text-emerald-500" /> },
      { id: "projects", label: "Projects", icon: <Grid3X3 className="w-4 h-4 text-cyan-500" /> },
      { id: "services", label: "Services", icon: <Sliders className="w-4 h-4 text-teal-500" /> },
      { id: "about",    label: "About Us", icon: <Users className="w-4 h-4 text-pink-500" /> },
    ]},
    { label: "Connect", items: [
      { id: "booking",     label: "Book Consultation", icon: <Calendar className="w-4 h-4 text-amber-500" /> },
      { id: "clienthub",  label: "Client Hub",        icon: <UserCheck className="w-4 h-4 text-emerald-400" /> },
      { id: "feedback",   label: "Reviews",            icon: <MessageSquare className="w-4 h-4 text-purple-500" /> },
      { id: "sponsorship",label: "Sponsorship",        icon: <Award className="w-4 h-4 text-rose-500" /> },
    ]},
    ...(isAdmin ? [{ label: "Admin", items: [
      { id: "admin", label: "Admin Console", icon: <ShieldCheck className="w-4 h-4 text-blue-500" /> },
    ]}] : []),
  ];

  const allNavItems = navGroups.flatMap(g => g.items);

  const NavBtn = ({ tab, ...props }: any) => (
    <button
      {...props}
      data-testid={`nav-${tab.id}`}
      onClick={() => { setActiveTab(tab.id as Tab); if (tab.id === "projects") setSelectedProjectId(""); setMobileSidebarOpen(false); }}
      className={`relative group w-full flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-bold transition text-left cursor-pointer ${activeTab === tab.id ? theme.sidebarBtnActive : theme.sidebarBtnInactive}`}
    >
      {activeTab !== tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-emerald-500 rounded-r opacity-0 group-hover:h-4 group-hover:opacity-100 transition-all duration-300" />}
      <div className={`transition-transform duration-300 ${activeTab !== tab.id ? 'group-hover:translate-x-1' : ''}`}>
        {tab.icon}
      </div>
      <span className={`transition-transform duration-300 ${activeTab !== tab.id ? 'group-hover:translate-x-1' : ''}`}>{tab.label}</span>
    </button>
  );

  return (
    <div className={`flex h-screen overflow-hidden ${theme.bg}`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col w-56 shrink-0 border-r ${theme.sidebar} overflow-y-auto relative`}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
        <div className={`flex items-center gap-2.5 px-5 py-5 ${theme.sidebarHeader}`}>
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Terminal className="w-4 h-4 text-black" />
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-sm tracking-tight font-mono ${theme.textHeading} leading-none`}>PanaDev</span>
            <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase mt-0.5 tracking-wider">Digital Apps</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-5">
          {navGroups.map(g => (
            <div key={g.label}>
              <p className="text-[9px] font-mono font-bold uppercase text-slate-500 px-3 mb-1 tracking-widest">{g.label}</p>
              <div className="space-y-0.5">{g.items.map(t => <NavBtn key={t.id} tab={t} />)}</div>
            </div>
          ))}
        </nav>
        <div className={`px-4 py-4 ${theme.sidebarFooter}`}>
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[9px] font-mono shrink-0">{user.name[0]}</div>
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold truncate ${theme.textHeading}`}>{user.name}</p>
                  <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={handleSignOut} data-testid="btn-signout" className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-450 hover:text-rose-400 cursor-pointer">
                <LogOut className="w-3 h-3" /><span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button onClick={() => setIsSignInModalOpen(true)} data-testid="btn-signin" className="w-full py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-center font-bold font-mono text-[10px] uppercase hover:bg-emerald-500/20 transition cursor-pointer">
              Sign In with Google
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile Header */}
        <header className={`lg:hidden flex items-center justify-between px-4 py-3 border-b ${theme.sidebarHeader}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center"><Terminal className="w-3.5 h-3.5 text-black" /></div>
            <span className={`font-black text-sm font-mono ${theme.textHeading}`}>PanaDev</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDark(!isDark)} className={`p-1.5 rounded-lg border ${isDark ? "border-slate-800 text-amber-400" : "border-slate-200 text-purple-600"}`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileSidebarOpen(true)} className={`p-1.5 rounded-lg border ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className={`w-64 h-full ${theme.sidebar} flex flex-col overflow-y-auto`}>
              <div className={`flex items-center justify-between px-5 py-5 ${theme.sidebarHeader}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]"><Terminal className="w-4 h-4 text-black" /></div>
                  <div className="flex flex-col">
                    <span className={`font-black text-sm font-mono ${theme.textHeading} leading-none`}>PanaDev</span>
                    <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase mt-0.5 tracking-wider">Digital Apps</span>
                  </div>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-500 hover:text-rose-450"><X className="w-5 h-5" /></button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-5">
                {navGroups.map(g => (
                  <div key={g.label}>
                    <p className="text-[9px] font-mono font-bold uppercase text-slate-500 px-3 mb-1 tracking-widest">{g.label}</p>
                    <div className="space-y-0.5">{g.items.map(t => <NavBtn key={t.id} tab={t} />)}</div>
                  </div>
                ))}
              </nav>
              <div className={`px-4 py-4 ${theme.sidebarFooter}`}>
                {user ? (
                  <button onClick={handleSignOut} className="text-rose-400 text-[10px] font-mono font-bold"><LogOut className="w-3 h-3 inline mr-1" />Sign Out</button>
                ) : (
                  <button onClick={() => { setMobileSidebarOpen(false); setIsSignInModalOpen(true); }} className="w-full py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-center font-bold font-mono text-[10px] uppercase cursor-pointer">Sign In</button>
                )}
              </div>
            </div>
            <div className="flex-1 bg-slate-950/80" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Theme toggle (desktop) */}
        <div className="hidden lg:flex justify-end px-8 pt-4">
          <button onClick={() => { setIsDark(!isDark); localStorage.setItem("panadev_theme", !isDark ? "dark" : "light"); }} className={`p-1.5 rounded-lg border ${isDark ? "border-slate-800 text-amber-400" : "border-slate-200 text-purple-600"}`}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-5 md:px-10 pb-12 pt-4 md:pt-6 max-w-5xl mx-auto w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-[10px] font-mono uppercase tracking-wider animate-pulse">Loading PanaDev...</p>
            </div>
          ) : (
            <>
              {activeTab === "home" && <Home isDark={isDark} theme={theme} setActiveTab={setActiveTab} projects={projects} feedbacks={feedbacks} setSelectedProjectId={setSelectedProjectId} />}
              {activeTab === "projects" && <Projects isDark={isDark} theme={theme} projects={projects} feedbacks={feedbacks} selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} handleFeedbackSubmit={handleFeedbackSubmit} feedbackForm={feedbackForm} setFeedbackForm={setFeedbackForm} feedbackLoading={feedbackLoading} user={user} setIsSignInModalOpen={setIsSignInModalOpen} />}
              {activeTab === "services" && <Services isDark={isDark} theme={theme} setActiveTab={setActiveTab} />}
              {activeTab === "about" && <About isDark={isDark} theme={theme} setActiveTab={setActiveTab} />}
              {activeTab === "booking" && <Bookings isDark={isDark} theme={theme} bookings={bookings} bookingForm={bookingForm} setBookingForm={setBookingForm} handleBookingSubmit={handleBookingSubmit} bookingLoading={bookingLoading} user={user} setIsSignInModalOpen={setIsSignInModalOpen} setActiveTab={setActiveTab} />}
              {activeTab === "sponsorship" && <Sponsorship isDark={isDark} theme={theme} sponsorships={sponsorships} sponsorForm={sponsorForm} setSponsorForm={setSponsorForm} handleSponsorSubmit={handleSponsorSubmit} sponsorLoading={sponsorLoading} user={user} setIsSignInModalOpen={setIsSignInModalOpen} setActiveTab={setActiveTab} />}
              {activeTab === "feedback" && <FeedbackPage isDark={isDark} theme={theme} feedbacks={feedbacks} projects={projects} feedbackForm={feedbackForm} setFeedbackForm={setFeedbackForm} handleFeedbackSubmit={handleFeedbackSubmit} feedbackLoading={feedbackLoading} user={user} setIsSignInModalOpen={setIsSignInModalOpen} setActiveTab={setActiveTab} />}
              {activeTab === "clienthub" && <ClientHub isDark={isDark} theme={theme} projects={projects} bookings={bookings} user={user} showToast={showToast} setIsSignInModalOpen={setIsSignInModalOpen} setActiveTab={setActiveTab} />}
              {activeTab === "admin" && <AdminDashboard isDark={isDark} theme={theme} projects={projects} setProjects={setProjects} feedbacks={feedbacks} setFeedbacks={setFeedbacks} bookings={bookings} setBookings={setBookings} user={user} showToast={showToast} setActiveTab={setActiveTab} apiFetch={apiFetch} />}
            </>
          )}
        </main>

        <footer className={`py-6 border-t flex flex-col items-center justify-center gap-3 text-center text-[10px] font-mono ${theme.sidebarFooter}`}>
          <div className="flex gap-4">
            <a href="https://wa.me/263713058383" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-500 transition-colors">WhatsApp</a>
            <a href="mailto:mudzimwapanashe123@gmail.com" className="text-slate-400 hover:text-[#0ea5e9] transition-colors">Email</a>
            <a href="https://github.com/ProPashe" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-200 transition-colors">GitHub</a>
          </div>
          <p>© 2026 PanaDev Apps. All rights reserved. | Harare, Zimbabwe</p>
        </footer>
      </div>

      {/* Sign In Modal */}
      {isSignInModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsSignInModalOpen(false)}>
          <div className={`w-full max-w-sm rounded-2xl border ${theme.card} p-8 space-y-6 text-center`} onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsSignInModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-rose-400"><X className="w-4 h-4" /></button>
            
            {/* Logo & Title */}
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Terminal className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className={`text-base font-extrabold font-mono ${theme.textHeading}`}>Sign In to PanaDev</h3>
              <p className={`text-[11px] ${theme.textMuted} leading-relaxed`}>
                Admin access requires your Google account. Your identity is verified server-side using Firebase Auth.
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>{authLoading ? "Signing in..." : "Continue with Google"}</span>
            </button>

            <p className={`text-[10px] ${theme.textMuted}`}>
              Only <span className="text-emerald-500 font-mono font-bold">mudzimwapanashe123@gmail.com</span> has admin access.
            </p>
          </div>
        </div>
      )}

      {/* WhatsApp Success Modal */}
      {successModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSuccessModalData(null)}>
          <div className={`w-full max-w-sm rounded-2xl border ${theme.card} p-6 space-y-5 text-center`} onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <h3 className={`text-base font-extrabold ${theme.textHeading} mb-2`}>{successModalData.title}</h3>
              <p className={`text-xs ${theme.textMuted} leading-relaxed`}>{successModalData.message}</p>
            </div>
            <div className="flex flex-col gap-2">
              <a href={successModalData.whatsAppUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold rounded-lg text-xs font-mono transition cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                <span>{successModalData.whatsAppText}</span>
              </a>
              <button onClick={() => setSuccessModalData(null)} className={`py-2 text-xs font-mono font-bold rounded-lg border transition cursor-pointer ${isDark ? "border-slate-800 text-slate-400 hover:bg-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/263713058383?text=Hello%20PanaDev!%20I%20would%20like%20to%20discuss%20a%20project." 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 left-6 z-40 bg-[#25D366] hover:bg-[#1ebe5d] text-white p-3.5 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition-transform hover:scale-110 flex items-center justify-center group"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
        <span className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Chat with us</span>
      </a>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-xs font-mono font-bold shadow-lg border transition animate-in slide-in-from-bottom-2 ${
          toast.type === "success" ? "bg-emerald-950 border-emerald-800 text-emerald-300" : "bg-rose-950 border-rose-800 text-rose-300"
        }`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
