import React, { useState } from "react";
import { 
  Search, 
  Layers, 
  ExternalLink, 
  Github, 
  Star, 
  CheckCircle, 
  Activity, 
  MessageSquare,
  Play,
  ArrowLeft,
  Settings,
  Server,
  Database,
  Code
} from "lucide-react";
import { Project, Feedback } from "../../types";

interface ProjectsProps {
  isDark: boolean;
  theme: any;
  projects: Project[];
  feedbacks: Feedback[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  handleFeedbackSubmit: (e: React.FormEvent) => Promise<void>;
  feedbackForm: any;
  setFeedbackForm: (form: any) => void;
  feedbackLoading: boolean;
  user: any;
  setIsSignInModalOpen: (open: boolean) => void;
}

export default function Projects({
  isDark,
  theme,
  projects,
  feedbacks,
  selectedProjectId,
  setSelectedProjectId,
  handleFeedbackSubmit,
  feedbackForm,
  setFeedbackForm,
  feedbackLoading,
  user,
  setIsSignInModalOpen
}: ProjectsProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [isDetailView, setIsDetailView] = useState<boolean>(selectedProjectId !== "");

  // Flatten and extract unique tags for listing
  const allTags = ["All", ...Array.from(new Set(projects.flatMap(p => p.tags)))];
  const allCategories = ["All", ...Array.from(new Set(projects.map(p => p.category)))];

  // Filters projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesTag = selectedTag === "All" || p.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0] || null;
  const projectFeedbacks = feedbacks.filter(f => f.projectId === selectedProjectId);

  const getStatusBadge = (status: string) => {
    if (status === "Pending") return { label: "Pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    if (status === "In-Progress") return { label: "In Active Beta", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
    return { label: "Completed", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  };

  const getProblemSolved = (proj: Project) => {
    if (proj.id === "tasksync") {
      return {
        issue: "Modern business and project teams require a simple, unified, and fast way to align on daily goals and track priorities without the overhead of heavy and expensive enterprise tracking software.",
        architecture: "High-performance interactive board featuring smooth drag animations, customizable stages, and instant local and cloud database loading."
      };
    }
    if (proj.id === "pixelcraft") {
      return {
        issue: "Creative specialists and web teams often face complex, bloated offline design software when trying to quickly build, scale, and export lightweight custom vector assets or SVG graphics for their web builds.",
        architecture: "Automated vector design canvas rendering lightweight SVG shapes, custom dimensions, and instant high-fidelity code generation."
      };
    }
    return {
      issue: proj.fullDescription || "Custom operational problem solved by this system.",
      architecture: proj.tags.join(" • ") || "Bespoke Full-Stack Software Integration"
    };
  };

  if (isDetailView && activeProject) {
    const extraInfo = getProblemSolved(activeProject);
    const status = getStatusBadge(activeProject.status || "Completed");

    return (
      <div className="space-y-10 py-4 animate-fade-in text-left">
        {/* Back navigation header */}
        <div className="flex items-center justify-between border-b border-slate-500/10 pb-4">
          <button 
            onClick={() => {
              setIsDetailView(false);
              setSelectedProjectId("");
            }}
            className="flex items-center gap-2 text-xs font-mono font-bold text-slate-505 hover:text-emerald-500 transition cursor-pointer select-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono border px-2.5 py-0.5 rounded-full uppercase ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Project Header Title Block & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <span className={`text-[10px] font-mono border px-2.5 py-1 rounded inline-block uppercase ${theme.badge}`}>
              {activeProject.category}
            </span>
            <h1 className={`text-3xl md:text-4xl font-extrabold ${theme.textHeading} tracking-tight leading-none`}>
              {activeProject.title}
            </h1>
            <p className={`${theme.textMuted} text-xs md:text-sm leading-relaxed max-w-2xl`}>
              {activeProject.fullDescription}
            </p>
          </div>

          <div className="lg:col-span-4 bg-slate-900/10 rounded-2xl border border-slate-500/10 p-5 space-y-3 font-mono text-[11px] h-full justify-between flex flex-col">
            <span className="text-[10px] uppercase text-slate-550 block font-bold">Product Status & Engagement</span>
            <div className="space-y-2 flex-1 pt-1">
              <div className="flex justify-between border-b border-slate-500/5 pb-1.5">
                <span className="text-slate-500">Approval Rating:</span>
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {activeProject.metrics.stars} Stars
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-500/5 pb-1.5">
                <span className="text-slate-500">Monthly Inquiries:</span>
                <span className={`${theme.textHeading} font-bold`}>{activeProject.metrics.downloads || "3.5k/mo"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Live Users:</span>
                <span className="text-emerald-400 font-bold">{activeProject.metrics.users || "1.2k"}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <a 
                href={activeProject.deployedUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-450 text-black py-2 rounded-lg font-bold text-xs"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a 
                href={activeProject.githubUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1 bg-slate-900 border border-slate-800 text-zinc-100 hover:bg-slate-800 py-2 rounded-lg font-bold text-xs"
              >
                <span>Repository</span>
                <Github className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Architectural layout breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 md:p-8 rounded-2xl border ${theme.card} space-y-4`}>
            <div className="flex items-center gap-2 text-rose-450 font-mono text-xs font-bold">
              <Settings className="w-4 h-4 text-rose-500" />
              <span>Problem Solved</span>
            </div>
            <p className={`${theme.textMuted} text-xs leading-relaxed`}>
              {extraInfo.issue}
            </p>
          </div>

          <div className={`p-6 md:p-8 rounded-2xl border ${theme.card} space-y-4`}>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
              <Server className="w-4 h-4 text-cyan-500" />
              <span>Technical Architecture</span>
            </div>
            <p className={`${theme.textMuted} text-xs leading-relaxed`}>
              {extraInfo.architecture}
            </p>
          </div>
        </div>

        {/* Feedback & Review section for this project */}
        <div className="space-y-6 pt-4">
          <h3 className={`text-xl font-extrabold ${theme.textHeading} tracking-tight`}>
            Client Reviews
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Reviews display Left */}
            <div className="lg:col-span-7 space-y-4">
              {projectFeedbacks.length === 0 ? (
                <div className={`p-8 text-center rounded-xl border border-dashed ${isDark ? 'border-zinc-800' : 'border-zinc-300'} ${theme.textMuted}`}>
                  No reviews yet. Be the first to leave one below.
                </div>
              ) : (
                <div className="space-y-4">
                  {projectFeedbacks.map((f) => (
                    <div key={f.id} className={`p-4 rounded-xl border ${theme.cardInner} space-y-2.5 text-xs text-left`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400 font-mono text-[10px]">{f.clientEmail}</span>
                        <div className="flex gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < f.rating ? "fill-amber-500" : "text-slate-700"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className={`${theme.textMuted} italic`}>"{f.comment}"</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-500/5">
                        <span className="font-bold text-emerald-400">Verified Review</span>
                        <span>•</span>
                        <span>{new Date(f.createdAt).toISOString().split("T")[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submission Form Right */}
            <div className={`lg:col-span-5 border rounded-2xl p-5 ${theme.card} relative overflow-hidden`}>


              <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs font-mono">
                <h4 className={`text-xs uppercase font-bold border-b pb-1.5 ${isDark ? 'text-emerald-400 border-slate-900' : 'text-emerald-700 border-slate-200'}`}>
                  Write a Review
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-505 mb-1 font-bold">CLIENT NAME</label>
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={feedbackForm.clientName}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, clientName: e.target.value })}
                      className={`w-full rounded p-1.5 border ${theme.input} text-center font-bold focus:ring-1 focus:ring-emerald-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-505 mb-1 font-bold">CLIENT EMAIL</label>
                    <input 
                      type="email" 
                      placeholder="Your Email" 
                      value={feedbackForm.clientEmail}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, clientEmail: e.target.value })}
                      className={`w-full rounded p-1.5 border ${theme.input} text-center font-bold focus:ring-1 focus:ring-emerald-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-505 mb-1 font-bold text-left">YOUR RATING</label>
                  <select
                    value={feedbackForm.rating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value, 10) })}
                    className={`w-full rounded p-1.5 border ${theme.input}`}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ Excellent — Exceeded expectations</option>
                    <option value="4">⭐⭐⭐⭐ Very good — Highly satisfied</option>
                    <option value="3">⭐⭐⭐ Good — Met expectations</option>
                    <option value="2">⭐⭐ Fair — Room for improvement</option>
                    <option value="1">⭐ Poor — Did not meet expectations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-505 mb-1 font-bold text-left">YOUR COMMENT</label>
                  <textarea 
                    rows={2}
                    required
                    placeholder="Share your experience with this project..."
                    value={feedbackForm.comment}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                    className={`w-full rounded p-1.5 border resize-none ${theme.input}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold rounded-lg font-mono text-[10px] uppercase transition cursor-pointer"
                >
                  {feedbackLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4 animate-fade-in text-left">
      {/* Title & Filter Options */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-500/10 pb-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-emerald-505 bg-emerald-950/20 px-2.5 py-1 rounded inline-block uppercase border border-emerald-900/10">
            PanaDev Applications Ecosystem
          </span>
          <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading} tracking-tight`}>
            Production Software Portfolio
          </h2>
          <p className={`${theme.textMuted} text-xs md:text-sm max-w-xl`}>
            Run live in-browser application compilers, inspect code architectures, or write satisfaction auditing reviews.
          </p>
        </div>

        {/* Modern Search bar */}
        <div className="relative w-full xl:w-72">
          <input
            type="text"
            placeholder="Search keywords or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-mono outline-none border focus:ring-1 focus:ring-emerald-500 ${theme.input}`}
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Structured Category Toggles */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <span className="text-[10px] font-mono font-bold text-slate-505 uppercase">Categories:</span>
        {allCategories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-xs rounded-full border transition cursor-pointer text-left ${
              selectedCategory === cat 
                ? "bg-slate-900 border-emerald-500 text-emerald-400 font-bold" 
                : isDark ? "bg-slate-950 border-slate-900 text-slate-400 hover:text-white" : "bg-white border-slate-205 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Technology Tag Cloud Filters */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[10px] font-mono font-bold text-slate-550 uppercase mr-1.5">Technologies:</span>
        {allTags.map((tag, i) => (
          <button
            key={i}
            onClick={() => setSelectedTag(tag)}
            className={`px-2.5 py-0.5 text-[10px] font-mono rounded border transition cursor-pointer text-left ${
              selectedTag === tag 
                ? "bg-emerald-950/20 border-emerald-500 text-emerald-405 font-bold" 
                : isDark ? "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid of Projects */}
      {filteredProjects.length === 0 ? (
        <div className={`p-16 text-center rounded-2xl border border-dashed text-sm font-mono flex flex-col items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-300'} ${theme.textMuted}`}>
          <span>No compiled portfolios correspond to current filter variables.</span>
          <button 
            onClick={() => { setSearch(""); setSelectedCategory("All"); setSelectedTag("All"); }}
            className="text-xs text-emerald-500 hover:underline font-bold mt-2 cursor-pointer select-none"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredProjects.map((project) => {
            const status = getStatusBadge(project.status || "Completed");
            return (
              <div 
                key={project.id}
                className={`rounded-2xl border ${theme.card} flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition duration-200 group`}
              >
                {/* Header info */}
                <div className={`p-4 md:p-5 border-b ${isDark ? 'border-slate-900 bg-slate-900/10' : 'border-slate-105 bg-slate-50/40'} flex justify-between items-start gap-3`}>
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-mono text-cyan-500 bg-cyan-950/10 border border-cyan-500/20 px-2 py-0.5 rounded uppercase font-semibold">
                      {project.category}
                    </span>
                    <h3 className={`text-base font-bold ${theme.textHeading} leading-tight`}>{project.title}</h3>
                  </div>
                  <span className={`text-[10px] font-mono border px-1.5 py-0.5 rounded shrink-0 uppercase ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Body info */}
                <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                  <p className={`${theme.textMuted} text-xs leading-relaxed`}>
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag, i) => (
                      <span key={i} className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className={`p-4 border-t ${isDark ? 'border-slate-900 bg-slate-900/5' : 'border-slate-105 bg-slate-50/20'} flex gap-2`}>
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setIsDetailView(true);
                    }}
                    className="flex-1 text-center py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold font-mono transition cursor-pointer"
                  >
                    View Architecture
                  </button>
                  <a 
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-2 rounded-lg border ${isDark ? 'border-slate-800 bg-[#090f19]/30 text-slate-400 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'} transition`}
                    title="View GitHub Repository Source"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
