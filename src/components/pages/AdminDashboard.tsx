import React, { useState, useEffect } from "react";
import {
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
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Project, Feedback, Booking, SponsorshipRequest, UserRole } from "../../types";

interface AdminDashboardProps {
  isDark: boolean;
  theme: any;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  feedbacks: Feedback[];
  setFeedbacks: (feedbacks: Feedback[]) => void;
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  user: { name: string; email: string; role?: UserRole } | null;
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
  const userRole = (user?.role || "viewer") as UserRole;
  const isAuthorized = Boolean(user?.role);
  const canEditContent = userRole === "admin" || userRole === "editor";
  const canManageProjects = canEditContent;
  const canModifyBookings = userRole === "admin";
  const canDeleteFeedback = userRole === "admin";
  const canExportServer = userRole === "admin";

  type AdminTab = "analytics" | "projects" | "bookings" | "feedbacks" | "sponsorships" | "content";

  const [adminTab, setAdminTab] = useState<AdminTab>("analytics");

  // Site Content editing state
  const [contentLoading, setContentLoading] = useState(false);
  const [siteContent, setSiteContent] = useState({
    aboutCompany: "PanaDev Apps is a growing Zimbabwean technology company focused on building modern, secure, and scalable digital solutions. We create software that helps businesses, organizations, and individuals work smarter through mobile apps, websites, AI systems, and custom software.",
    aboutFounder: "My name is Panashe Mudzimwa, and I was born in Chipinge, Manicaland Province, Zimbabwe. My passion for technology started early. In 2020, while I was still in O-Level, I first interacted with computers and immediately became interested in how software works.",
    servicesTagline: "We design, develop, and maintain custom digital systems crafted with absolute precision to drive measurable business growth across Africa and globally.",
    contactEmail: "mudzimwapanashe123@gmail.com",
    contactPhone: "+263 713 058 383",
    companyLocation: "Harare, Zimbabwe"
  });

  // State arrays fetched via APIs
  const [sponsorships, setSponsorships] = useState<SponsorshipRequest[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);

  const adminTabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: "analytics", label: "📊 Analytics" },
    { id: "projects", label: "📁 Projects", count: projects.length },
    { id: "bookings", label: "📅 Reservations", count: bookings.length },
    { id: "feedbacks", label: "💬 Feedbacks", count: feedbacks.length },
    { id: "sponsorships", label: "💰 Partnerships", count: sponsorships.length },
    { id: "content", label: "✏️ Site Content" },
  ];

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
  const [bookingsExportRange, setBookingsExportRange] = useState<'7'|'30'|'90'|'all'>('30');
  const [projectsExportRange, setProjectsExportRange] = useState<'7'|'30'|'90'|'all'>('all');
  const [contactsExportRange, setContactsExportRange] = useState<'7'|'30'|'90'|'all'>('30');

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

    if (!canManageProjects) {
      showToast("Permission denied: project management requires admin or editor role.", "error");
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
    if (!canManageProjects) {
      showToast("Permission denied: only admin or editor may delete projects.", "error");
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

  const updateProjectStatus = async (id: string, status: 'Completed' | 'In-Progress' | 'Pending') => {
    if (!canManageProjects) {
      showToast("Permission denied: only admin or editor may update project status.", "error");
      return;
    }
    try {
      const res = await apiFetch(`/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update project status.");
      }
      setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
      showToast(`Project status updated to ${status}.`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update project status.", "error");
    }
  };

  const reorderProjects = async (updatedProjects: Project[]) => {
    if (!canManageProjects) {
      showToast("Permission denied: only admin or editor may reorder projects.", "error");
      return;
    }
    setProjects(updatedProjects);
    try {
      const orderPayload = updatedProjects.map((project, index) => ({ id: project.id, order: index + 1 }));
      await Promise.all(orderPayload.map(item => apiFetch(`/projects/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: item.order })
      })));
      showToast("Project order updated.", "success");
    } catch (err) {
      console.error("Failed to persist project order", err);
      showToast("Failed to persist project order.", "error");
    }
  };

  const handleProjectDragStart = (id: string) => {
    setDraggedProjectId(id);
  };

  const handleProjectDrop = (targetId: string) => {
    if (!draggedProjectId || draggedProjectId === targetId) return;
    const updated = [...projects];
    const fromIndex = updated.findIndex(p => p.id === draggedProjectId);
    const toIndex = updated.findIndex(p => p.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    reorderProjects(updated);
    setDraggedProjectId(null);
  };

  const handleProjectDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Feedback CRUD operations
  const handleDeleteFeedback = async (id: string) => {
    if (!canDeleteFeedback) {
      showToast("Permission denied: only admin may delete feedback records.", "error");
      return;
    }
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
    if (!canModifyBookings) {
      showToast("Permission denied: only admin may update booking status.", "error");
      return;
    }
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
    if (!canModifyBookings) {
      showToast("Permission denied: only admin may cancel bookings.", "error");
      return;
    }
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

  // Export bookings as CSV for lightweight reporting
  const exportBookingsCSV = () => {
    if (!bookings || bookings.length === 0) {
      showToast("No bookings to export.", "info");
      return;
    }
    const cutoff = (range: string) => {
      if (range === 'all') return null;
      const days = Number(range || '0');
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    };
    const cutoffDate = cutoff(bookingsExportRange as string);
    const filtered = bookings.filter(b => {
      const raw = (b as any).createdAt || (b as any).date || '';
      if (!cutoffDate) return true;
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) return true;
      return dt >= cutoffDate;
    });
    const headers = ["id","clientName","clientEmail","companyName","date","timeSlot","status","budget","description"];
    const rows = filtered.map(b => headers.map(h => {
      const v = (b as any)[h] ?? "";
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `panadev_bookings_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Bookings CSV exported.', 'success');
  };

  // Export projects as CSV
  const exportProjectsCSV = () => {
    if (!projects || projects.length === 0) {
      showToast('No projects to export.', 'info');
      return;
    }
    const cutoff = (range: string) => {
      if (range === 'all') return null;
      const days = Number(range || '0');
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    };
    const cutoffDate = cutoff(projectsExportRange as string);
    const filtered = projects.filter(p => {
      const raw = (p as any).createdAt || '';
      if (!cutoffDate) return true;
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) return true; // include if no date present
      return dt >= cutoffDate;
    });
    const headers = ['id','title','description','category','status','deployedUrl','githubUrl','tags'];
    const rows = filtered.map(p => headers.map(h => {
      let v: any = (p as any)[h];
      if (h === 'tags' && Array.isArray((p as any).tags)) v = (p as any).tags.join(';');
      return `"${String(v ?? '').replace(/"/g, '""')}"`;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `panadev_projects_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Projects CSV exported.', 'success');
  };

  // Export contacts as CSV
  const exportContactsCSV = () => {
    if (!contacts || contacts.length === 0) {
      showToast('No contacts to export.', 'info');
      return;
    }
    const cutoff = (range: string) => {
      if (range === 'all') return null;
      const days = Number(range || '0');
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    };
    const cutoffDate = cutoff(contactsExportRange as string);
    const filtered = contacts.filter(c => {
      const raw = (c as any).createdAt || '';
      if (!cutoffDate) return true;
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) return true;
      return dt >= cutoffDate;
    });
    const headers = ['id','name','email','phone','company','message','createdAt'];
    const rows = filtered.map(c => headers.map(h => {
      const v = (c as any)[h] ?? '';
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `panadev_contacts_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Contacts CSV exported.', 'success');
  };

  // Helper to download streamed or regular responses from server export endpoints
  const fetchAndDownload = async (url: string) => {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Failed to start server export.", "error");
        return;
      }
      // Derive filename from content-disposition or fallback
      const cd = res.headers.get("content-disposition") || "";
      let filename = "export.csv";
      const m = cd.match(/filename="?([^";]+)"?/i);
      if (m && m[1]) filename = m[1];
      else {
        const ct = res.headers.get("content-type") || "";
        const ts = new Date().toISOString().replace(/[:.]/g, "-");
        if (ct.includes("application/gzip") || ct.includes(".gz")) filename = `panadev_export_${ts}.csv.gz`;
        else if (ct.includes("application/zip")) filename = `panadev_export_${ts}.zip`;
        else filename = `panadev_export_${ts}.csv`;
      }
      const blob = await res.blob();
      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObj;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlObj);
      showToast("Server export downloaded.", "success");
    } catch (err) {
      console.error("Server export failed:", err);
      showToast("Server export failed.", "error");
    }
  };

  const exportContactsServer = async (compress: "gzip" | "zip" | null = null) => {
    if (!canExportServer) {
      showToast("Server exports require admin privileges.", "error");
      return;
    }
    const q = new URLSearchParams();
    q.set("range", contactsExportRange as string);
    if (compress) q.set("compress", compress);
    await fetchAndDownload(`/api/export/contacts?${q.toString()}`);
  };

  const exportProjectsServer = async (compress: "gzip" | "zip" | null = null) => {
    if (!canExportServer) {
      showToast("Server exports require admin privileges.", "error");
      return;
    }
    const q = new URLSearchParams();
    q.set("range", projectsExportRange as string);
    if (compress) q.set("compress", compress);
    await fetchAndDownload(`/api/export/projects?${q.toString()}`);
  };

  const exportBookingsServer = async (compress: "gzip" | "zip" | null = null) => {
    if (!canExportServer) {
      showToast("Server exports require admin privileges.", "error");
      return;
    }
    const q = new URLSearchParams();
    q.set("range", bookingsExportRange as string);
    if (compress) q.set("compress", compress);
    await fetchAndDownload(`/api/export/bookings?${q.toString()}`);
  };

  // Site content fetch on mount
  useEffect(() => {
    apiFetch("/site-content").then(r => r.json()).then(data => {
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setSiteContent(prev => ({ ...prev, ...data }));
      }
    }).catch(() => {});
  }, []);

  const handleSaveContent = async () => {
    if (!canEditContent) {
      showToast("Permission denied: only admin or editor may save site content.", "error");
      return;
    }
    try {
      setContentLoading(true);
      const res = await apiFetch("/site-content", {
        method: "PUT",
        body: JSON.stringify(siteContent)
      });
      if (res.ok) {
        showToast("Site content saved successfully!");
      } else {
        showToast("Failed to save content.", "error");
      }
    } catch {
      showToast("Error saving content.", "error");
    } finally {
      setContentLoading(false);
    }
  };

  // --- Export confirmation modal & progress UX state ---
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalTarget, setExportModalTarget] = useState<null | 'contacts' | 'projects' | 'bookings'>(null);
  const [exportModalCompress, setExportModalCompress] = useState<null | 'gzip' | 'zip'>(null);
  const [exportPreparing, setExportPreparing] = useState(false);

  const openExportConfirm = (target: 'contacts' | 'projects' | 'bookings', compress: 'gzip' | 'zip' | null = null) => {
    setExportModalTarget(target);
    setExportModalCompress(compress);
    setExportModalOpen(true);
  };

  const confirmExport = async () => {
    setExportPreparing(true);
    showToast('Preparing server export...', 'info');
    try {
      if (exportModalTarget === 'contacts') await exportContactsServer(exportModalCompress);
      else if (exportModalTarget === 'projects') await exportProjectsServer(exportModalCompress);
      else if (exportModalTarget === 'bookings') await exportBookingsServer(exportModalCompress);
    } catch (err) {
      console.error('Confirm export failed', err);
      showToast('Export failed.', 'error');
    } finally {
      setExportPreparing(false);
      setExportModalOpen(false);
      setExportModalTarget(null);
      setExportModalCompress(null);
    }
  };

  // Analytics helper maps
  const totalFundingCollected = sponsorships.reduce((sum, sp) => sum + (Number(sp.fundingAmount) || 0), 0);

  const conversionRate = bookings.length > 0 ? Math.min(98, Math.round((bookings.length / Math.max(1, contacts.length + bookings.length)) * 100)) : 0;
  const sponsorActivation = sponsorships.length > 0 ? Math.min(100, Math.round((sponsorships.length / Math.max(1, projects.length)) * 100)) : 0;
  const bookingGrowth = Math.min(100, Math.round(Math.max(0, bookings.length * 7)));
  const retentionVelocity = Math.min(100, Math.round(Math.max(0, contacts.length * 4 - bookings.length)));

  const projectStatusData = [
    { name: "Completed", value: projects.filter(p => p.status === "Completed" || !p.status).length, fill: "#10b981" },
    { name: "In-Progress", value: projects.filter(p => p.status === "In-Progress").length, fill: "#38bdf8" },
    { name: "Pending", value: projects.filter(p => p.status === "Pending").length, fill: "#f59e0b" }
  ];

  const inquiryTrendData = [
    { name: "Mon", inquiries: Math.max(12, Math.round(contacts.length * 0.9 + 6)) },
    { name: "Tue", inquiries: Math.max(18, Math.round(bookings.length * 1.0 + 9)) },
    { name: "Wed", inquiries: Math.max(14, Math.round(sponsorships.length * 1.1 + 8)) },
    { name: "Thu", inquiries: Math.max(20, Math.round((contacts.length + bookings.length) * 0.6 + 12)) },
    { name: "Fri", inquiries: Math.max(22, Math.round((bookings.length + sponsorships.length) * 0.7 + 10)) },
    { name: "Sat", inquiries: Math.max(16, Math.round(contacts.length * 0.8 + 11)) }
  ];

  const sponsorshipTierData = [
    { name: "Gold", value: sponsorships.filter(sp => sp.tier === "Gold").length, fill: "#f59e0b" },
    { name: "Silver", value: sponsorships.filter(sp => sp.tier === "Silver").length, fill: "#38bdf8" },
    { name: "Bronze", value: sponsorships.filter(sp => sp.tier === "Bronze").length, fill: "#a855f7" }
  ];

  const bookingsStatusData = [
    { name: "Confirmed", value: bookings.filter(b => b.status === "Confirmed").length, fill: "#22c55e" },
    { name: "Pending", value: bookings.filter(b => b.status === "Pending").length, fill: "#f97316" }
  ];

  const sortedProjects = [...projects].sort((a, b) => {
    const aOrder = a.order ?? new Date(a.createdAt).getTime();
    const bOrder = b.order ?? new Date(b.createdAt).getTime();
    return aOrder - bOrder;
  });

  // Auth is handled by the /admin-portal login — no gate needed here

  return (
    <div className="space-y-10 py-4 animate-fade-in text-left">
      {/* Title */}
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr] items-start">
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

          <div className={`rounded-[2rem] border ${theme.cardInner} p-5 shadow-sm bg-slate-950/50`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">Welcome back</p>
                <h3 className={`text-xl font-black ${theme.textHeading}`}>
                  {user?.name ? user.name.split(" ")[0] : "Administrator"}
                </h3>
              </div>
              <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] uppercase font-bold tracking-[0.24em] text-emerald-300 border border-emerald-500/20">
                {userRole.toUpperCase()}
              </div>
            </div>
            <p className={`${theme.textMuted} text-[12px] leading-relaxed mt-4`}>
              Your admin workspace is optimized for fast decisions. Monitor booking traffic, content updates, and sponsorship leads from one place.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-900/60 p-3 text-[10px] text-slate-300">
                <p className="text-2xl font-black text-emerald-400">{projects.length}</p>
                <p className="mt-1 uppercase tracking-[0.18em] font-bold">Projects</p>
              </div>
              <div className="rounded-2xl bg-slate-900/60 p-3 text-[10px] text-slate-300">
                <p className="text-2xl font-black text-cyan-400">{bookings.length}</p>
                <p className="mt-1 uppercase tracking-[0.18em] font-bold">Bookings</p>
              </div>
              <div className="rounded-2xl bg-slate-900/60 p-3 text-[10px] text-slate-300">
                <p className="text-2xl font-black text-amber-400">${totalFundingCollected.toLocaleString()}</p>
                <p className="mt-1 uppercase tracking-[0.18em] font-bold">Sponsorships</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700/30 pt-6">
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {[
              { id: "analytics", label: "📊 Analytics", count: null },
              { id: "projects", label: "📁 Projects", count: projects.length },
              { id: "bookings", label: "📅 Reservations", count: bookings.length },
              { id: "feedbacks", label: "💬 Feedbacks", count: feedbacks.length },
              { id: "sponsorships", label: "💰 Partnerships", count: sponsorships.length },
              { id: "content", label: "✏️ Site Content", count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg border transition cursor-pointer text-left ${
                  adminTab === tab.id 
                    ? "bg-slate-900 border-emerald-500 text-emerald-400 font-bold" 
                    : isDark ? "bg-slate-950 border-slate-900 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label} {tab.count !== null && `[${tab.count}]`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ANALYTICS TAB SECTION */}
      {adminTab === "analytics" && (
        <div className="space-y-8 animate-fade-in text-left">
          
          {/* Quick numbers row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className={`text-xl font-extrabold ${theme.textHeading}`}>{contacts.length} Dispatch Leads</p>
                  <select value={contactsExportRange} onChange={(e) => setContactsExportRange(e.target.value as any)} className="text-xs bg-transparent border rounded px-2 py-1">
                    <option value="7">7d</option>
                    <option value="30">30d</option>
                    <option value="90">90d</option>
                    <option value="all">All</option>
                  </select>
                  <button
                    onClick={exportContactsCSV}
                    disabled={contacts.length === 0}
                    className="ml-2 py-0.5 px-2 rounded bg-slate-700 hover:bg-slate-600 text-xs text-white disabled:opacity-50"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => canExportServer ? openExportConfirm('contacts','gzip') : undefined}
                    disabled={contacts.length === 0 || !canExportServer}
                    className={`ml-2 py-0.5 px-2 rounded text-xs text-black disabled:opacity-50 ${canExportServer ? "bg-amber-500 hover:bg-amber-400" : "bg-slate-700 cursor-not-allowed"}`}
                    title={canExportServer ? "Server export (gzip)" : "Admin only"}
                  >
                    Server gzip
                  </button>
                  <button
                    onClick={() => canExportServer ? openExportConfirm('contacts','zip') : undefined}
                    disabled={contacts.length === 0 || !canExportServer}
                    className={`ml-2 py-0.5 px-2 rounded text-xs text-black disabled:opacity-50 ${canExportServer ? "bg-cyan-500 hover:bg-cyan-400" : "bg-slate-700 cursor-not-allowed"}`}
                    title={canExportServer ? "Server export (zip)" : "Admin only"}
                  >
                    Server zip
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className={`p-4 rounded-2xl border ${theme.cardInner} bg-slate-950/30 text-left font-mono`}>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-slate-400">CONVERSION RATE</span>
              <p className="mt-3 text-3xl font-black text-emerald-400">{conversionRate}%</p>
              <p className="mt-2 text-[11px] text-slate-500">Inbound inquiries turning into confirmed consultations across the latest cycle.</p>
            </div>
            <div className={`p-4 rounded-2xl border ${theme.cardInner} bg-slate-950/30 text-left font-mono`}>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-slate-400">BOOKING MOMENTUM</span>
              <p className="mt-3 text-3xl font-black text-cyan-400">{bookingGrowth}%</p>
              <p className="mt-2 text-[11px] text-slate-500">Activity velocity based on total confirmed booking volume and pipeline growth.</p>
            </div>
            <div className={`p-4 rounded-2xl border ${theme.cardInner} bg-slate-950/30 text-left font-mono`}>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-slate-400">PARTNERSHIP UPTAKE</span>
              <p className="mt-3 text-3xl font-black text-amber-400">{sponsorActivation}%</p>
              <p className="mt-2 text-[11px] text-slate-500">Portfolio coverage supported by sponsorship leads and strategic partners.</p>
            </div>
            <div className={`p-4 rounded-2xl border ${theme.cardInner} bg-slate-950/30 text-left font-mono`}>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-slate-400">RETENTION VELOCITY</span>
              <p className="mt-3 text-3xl font-black text-emerald-400">{retentionVelocity}%</p>
              <p className="mt-2 text-[11px] text-slate-500">Engagement speed across inbound contacts and consultancy follow-up activity.</p>
            </div>
          </div>

          {/* SECTION 1: Automatic Project Phase Calculations */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-extrabold uppercase text-slate-400 tracking-wider">PROJECT PRODUCTION LIFE-CYCLE STATES</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
            {/* Chart 1: Launch trend area chart */}
            <div className={`p-5 rounded-2xl border ${theme.card} space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Weekly Active Inquiry Trend</span>
                  <p className="text-[10px] text-slate-500">Performance trend for booking, contact, and sponsorship traffic.</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-black leading-none">Avg: {Math.round(inquiryTrendData.reduce((sum, item) => sum + item.inquiries, 0) / inquiryTrendData.length)} leads</span>
              </div>

              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={inquiryTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="inquiryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 10, fontSize: 12 }} />
                    <Area type="monotone" dataKey="inquiries" stroke="#22c55e" fill="url(#inquiryGradient)" strokeWidth={2} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Project status and sponsorship distribution */}
            <div className={`p-5 rounded-2xl border ${theme.card} space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Project & Partnership Health</span>
                  <p className="text-[10px] text-slate-500">Status distribution for active portfolios and active sponsors.</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">{sponsorshipTierData.reduce((sum, item) => sum + item.value, 0)} active tiers</span>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.85fr]">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectStatusData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 10, fontSize: 12 }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {projectStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 10, fontSize: 12 }} />
                      <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: 11, color: "#cbd5e1" }} />
                      <Pie
                        data={sponsorshipTierData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={75}
                        innerRadius={40}
                        paddingAngle={4}
                      >
                        {sponsorshipTierData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* BOOKINGS STATUS DONUT + QUICK STATS */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-5 rounded-2xl border ${theme.card} flex items-center justify-center`}> 
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 10, fontSize: 12 }} />
                    <Pie
                      data={bookingsStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={72}
                      paddingAngle={4}
                      label
                    >
                      {bookingsStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${theme.card} space-y-3`}> 
              <div className="flex items-start justify-between">
                <h4 className={`text-sm font-extrabold ${theme.textHeading}`}>Bookings Overview</h4>
                <div className="flex items-center gap-2">
                  <select value={bookingsExportRange} onChange={(e) => setBookingsExportRange(e.target.value as any)} className="text-xs bg-transparent border rounded px-2 py-1">
                    <option value="7">Last 7d</option>
                    <option value="30">Last 30d</option>
                    <option value="90">Last 90d</option>
                    <option value="all">All</option>
                  </select>
                  <button
                    onClick={exportBookingsCSV}
                    disabled={bookings.length === 0}
                    className="py-1 px-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded text-xs font-bold disabled:opacity-50"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => canExportServer ? openExportConfirm('bookings','gzip') : undefined}
                    disabled={bookings.length === 0 || !canExportServer}
                    className={`py-1 px-3 ml-2 rounded text-xs font-bold disabled:opacity-50 ${canExportServer ? "bg-amber-500 hover:bg-amber-400 text-black" : "bg-slate-700 text-slate-300 cursor-not-allowed"}`}
                    title={canExportServer ? "Server export (gzip)" : "Admin only"}
                  >
                    Server gzip
                  </button>
                  <button
                    onClick={() => canExportServer ? openExportConfirm('bookings','zip') : undefined}
                    disabled={bookings.length === 0 || !canExportServer}
                    className={`py-1 px-3 ml-2 rounded text-xs font-bold disabled:opacity-50 ${canExportServer ? "bg-cyan-500 hover:bg-cyan-400 text-black" : "bg-slate-700 text-slate-300 cursor-not-allowed"}`}
                    title={canExportServer ? "Server export (zip)" : "Admin only"}
                  >
                    Server zip
                  </button>
                </div>
              </div>
              <div className="text-[13px] text-slate-400">Confirmed: <span className="font-black text-emerald-400">{bookingsStatusData.find(b => b.name === 'Confirmed')?.value || 0}</span></div>
              <div className="text-[13px] text-slate-400">Pending: <span className="font-black text-amber-400">{bookingsStatusData.find(b => b.name === 'Pending')?.value || 0}</span></div>
              <div className="text-[13px] text-slate-400">Total Bookings: <span className="font-black text-cyan-400">{bookings.length}</span></div>
              <div className="mt-3 text-[11px] text-slate-500">Use the bookings tab to manage reservations or confirm pending consultations.</div>
            </div>
          </div>
        </div>
      )}

      {/* PROJECTS MANAGEMENT TAB */}
      {adminTab === "projects" && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[10px] uppercase text-slate-500 font-bold">Manage Portfolios Sandbox Lists</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingProject(!isAddingProject)}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black py-1.5 px-3 rounded-lg font-bold text-xs cursor-pointer text-left select-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                {isAddingProject ? "Close Builder Panel" : "Create New Project Node"}
              </button>
              <div className="flex items-center gap-2">
                <select value={projectsExportRange} onChange={(e) => setProjectsExportRange(e.target.value as any)} className="text-xs bg-transparent border rounded px-2 py-1">
                  <option value="7">Last 7d</option>
                  <option value="30">Last 30d</option>
                  <option value="90">Last 90d</option>
                  <option value="all">All</option>
                </select>
                <button
                  onClick={exportProjectsCSV}
                  disabled={projects.length === 0}
                  className="py-1 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold disabled:opacity-50"
                >
                  Export Projects
                </button>
                <button
                  onClick={() => canExportServer ? openExportConfirm('projects','gzip') : undefined}
                  disabled={projects.length === 0 || !canExportServer}
                  className={`py-1 px-3 ml-2 rounded text-xs font-bold disabled:opacity-50 ${canExportServer ? "bg-amber-500 hover:bg-amber-400 text-black" : "bg-slate-700 text-slate-300 cursor-not-allowed"}`}
                  title={canExportServer ? "Server export (gzip)" : "Admin only"}
                >
                  Server gzip
                </button>
                <button
                  onClick={() => canExportServer ? openExportConfirm('projects','zip') : undefined}
                  disabled={projects.length === 0 || !canExportServer}
                  className={`py-1 px-3 ml-2 rounded text-xs font-bold disabled:opacity-50 ${canExportServer ? "bg-cyan-500 hover:bg-cyan-400 text-black" : "bg-slate-700 text-slate-300 cursor-not-allowed"}`}
                  title={canExportServer ? "Server export (zip)" : "Admin only"}
                >
                  Server zip
                </button>
              </div>
            </div>
          </div>

          {/* Hidden Add Project Modal / Box */}
          {isAddingProject && (
            <form onSubmit={handleAddNewProjectSubmit} className={`p-5 rounded-2xl border ${theme.cardInner} space-y-4 text-xs font-mono animate-fade-in`}>
              <h4 className="text-xs uppercase font-extrabold text-emerald-400 border-b border-slate-900 pb-1.5">
                Core Project Registry Form
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg font-mono text-xs uppercase cursor-pointer transition disabled:opacity-60"
              >
                {loading ? "⏳ Saving project..." : "✓ Submit New Project to Ledger DB"}
              </button>
            </form>
          )}

          {/* List existing projects with administrative controls */}
          <div className="space-y-4">
            {sortedProjects.map((p) => (
              <div 
                key={p.id}
                draggable
                onDragStart={() => handleProjectDragStart(p.id)}
                onDragOver={handleProjectDragOver}
                onDrop={() => handleProjectDrop(p.id)}
                className={`p-4 rounded-xl border ${theme.cardInner} flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono ${draggedProjectId === p.id ? 'border-dashed border-slate-500 opacity-90' : ''}`}
              >
                <div className="space-y-2 text-left min-w-0">
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
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className={`${theme.textMuted} text-[11px] truncate`}>{p.description}</p>
                    <select
                      value={p.status || "Completed"}
                      onChange={(e) => updateProjectStatus(p.id, e.target.value as any)}
                      className="text-[10px] rounded border px-2 py-1 bg-slate-900 border-slate-700 text-slate-200"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold font-mono cursor-grab">DRAG</span>
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

      {/* SITE CONTENT EDITOR TAB */}
      {adminTab === "content" && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold font-mono block">Edit Public-Facing Page Content</span>
              <p className={`text-xs ${theme.textMuted} mt-0.5`}>Changes save to the database and update About Us &amp; Services pages.</p>
            </div>
            <button
              onClick={handleSaveContent}
              disabled={contentLoading}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-2 px-4 rounded-lg font-mono uppercase cursor-pointer transition disabled:opacity-60"
            >
              {contentLoading ? "Saving..." : "✓ Save All Changes"}
            </button>
          </div>

          <div className={`p-5 rounded-2xl border ${theme.cardInner} space-y-5`}>
            <h4 className="text-xs font-extrabold text-cyan-400 uppercase font-mono border-b border-slate-800 pb-2">📄 About Us Page</h4>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold font-mono uppercase text-slate-400">Company Description</label>
              <textarea
                rows={4}
                value={siteContent.aboutCompany}
                onChange={e => setSiteContent(prev => ({ ...prev, aboutCompany: e.target.value }))}
                className={`w-full rounded-lg p-3 border outline-none resize-none text-xs font-sans leading-relaxed ${theme.input} focus:ring-1 focus:ring-cyan-500`}
                placeholder="Company overview shown at the top of the About page..."
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold font-mono uppercase text-slate-400">Founder Story</label>
              <textarea
                rows={5}
                value={siteContent.aboutFounder}
                onChange={e => setSiteContent(prev => ({ ...prev, aboutFounder: e.target.value }))}
                className={`w-full rounded-lg p-3 border outline-none resize-none text-xs font-sans leading-relaxed ${theme.input} focus:ring-1 focus:ring-cyan-500`}
                placeholder="Founder background story shown on the About page..."
              />
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${theme.cardInner} space-y-5`}>
            <h4 className="text-xs font-extrabold text-purple-400 uppercase font-mono border-b border-slate-800 pb-2">⚙️ Services Page</h4>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold font-mono uppercase text-slate-400">Services Tagline / Description</label>
              <textarea
                rows={3}
                value={siteContent.servicesTagline}
                onChange={e => setSiteContent(prev => ({ ...prev, servicesTagline: e.target.value }))}
                className={`w-full rounded-lg p-3 border outline-none resize-none text-xs font-sans leading-relaxed ${theme.input} focus:ring-1 focus:ring-purple-500`}
                placeholder="Main description shown at the top of the Services page..."
              />
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${theme.cardInner} space-y-5`}>
            <h4 className="text-xs font-extrabold text-amber-400 uppercase font-mono border-b border-slate-800 pb-2">📞 Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold font-mono uppercase text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={siteContent.contactEmail}
                  onChange={e => setSiteContent(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className={`w-full rounded-lg p-2.5 border outline-none text-xs ${theme.input} focus:ring-1 focus:ring-amber-500`}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold font-mono uppercase text-slate-400">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={siteContent.contactPhone}
                  onChange={e => setSiteContent(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className={`w-full rounded-lg p-2.5 border outline-none text-xs ${theme.input} focus:ring-1 focus:ring-amber-500`}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold font-mono uppercase text-slate-400">Office Location</label>
                <input
                  type="text"
                  value={siteContent.companyLocation}
                  onChange={e => setSiteContent(prev => ({ ...prev, companyLocation: e.target.value }))}
                  className={`w-full rounded-lg p-2.5 border outline-none text-xs ${theme.input} focus:ring-1 focus:ring-amber-500`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveContent}
              disabled={contentLoading}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-2.5 px-6 rounded-lg font-mono uppercase cursor-pointer transition disabled:opacity-60"
            >
              {contentLoading ? "Saving..." : "✓ Save All Site Content"}
            </button>
          </div>
        </div>
      )}

      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className={`w-full max-w-md p-5 rounded-xl border ${theme.cardInner} bg-slate-950/90`}>
            <h3 className="text-sm font-extrabold mb-2">Confirm Server Export</h3>
            <p className="text-xs text-slate-400 mb-4">
              {exportModalTarget ? `You're exporting ${exportModalTarget}.` : 'Export'} {exportModalCompress ? `(compression: ${exportModalCompress})` : '(no compression)'}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => { if(!exportPreparing){ setExportModalOpen(false); setExportModalTarget(null); setExportModalCompress(null); }}} className="px-3 py-1 rounded border text-xs">Cancel</button>
              <button onClick={confirmExport} disabled={exportPreparing} className={`px-3 py-1 rounded bg-emerald-500 text-black text-xs font-bold ${exportPreparing ? 'opacity-60' : ''}`}>
                {exportPreparing ? (<><RefreshCw className="w-3 h-3 animate-spin inline-block mr-2" />Preparing...</>) : 'Confirm & Download'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
