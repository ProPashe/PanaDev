import React, { useState } from "react";
import { Star, MessageSquare, Plus, Lock, CheckCircle, HelpCircle, X } from "lucide-react";
import { Feedback } from "../../types";

interface FeedbackProps {
  isDark: boolean;
  theme: any;
  feedbacks: Feedback[];
  projects: any[];
  feedbackForm: any;
  setFeedbackForm: (form: any) => void;
  handleFeedbackSubmit: (e: React.FormEvent) => Promise<void>;
  feedbackLoading: boolean;
  user: any;
  setIsSignInModalOpen: (open: boolean) => void;
  setActiveTab: (tab: any) => void;
}

export default function FeedbackPage({
  isDark,
  theme,
  feedbacks,
  projects,
  feedbackForm,
  setFeedbackForm,
  handleFeedbackSubmit,
  feedbackLoading,
  user,
  setIsSignInModalOpen,
  setActiveTab
}: FeedbackProps) {
  const [ratingFilter, setRatingFilter] = useState<number | "All">("All");

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
    : "5.0";

  const ratingCounts = {
    5: feedbacks.filter(f => f.rating === 5).length,
    4: feedbacks.filter(f => f.rating === 4).length,
    3: feedbacks.filter(f => f.rating === 3).length,
    2: feedbacks.filter(f => f.rating === 2).length,
    1: feedbacks.filter(f => f.rating === 1).length,
  };

  const filteredFeedbacks = ratingFilter === "All"
    ? feedbacks
    : feedbacks.filter(f => f.rating === ratingFilter);

  // SVG helper for Google icon
  const GoogleIcon = () => (
    <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.4-4.69H24v8.9h12.75c-.55 2.89-2.2 5.33-4.66 6.98l7.24 5.62C43.59 36.6 46.5 30.83 46.5 24z" />
      <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.24-5.62c-2.01 1.35-4.59 2.18-8.65 2.18-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );

  return (
    <div className="space-y-12 py-4 animate-fade-in text-left">
      {/* Title */}
      <div className="border-b border-slate-500/10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-505 bg-emerald-950/20 px-2.5 py-1 rounded inline-block uppercase border border-emerald-900/10">
              CLIENT REVIEWS
            </span>
            <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading} mt-2 tracking-tight`}>
              Feedback & Reviews Hub
            </h2>
          </div>
          <button
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-1.5 self-start sm:self-center text-xs font-bold font-mono px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 text-slate-500 hover:text-slate-700 bg-slate-100/60 hover:bg-slate-200/60"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>
        <p className={`${theme.textMuted} text-xs md:text-sm max-w-xl mt-3`}>
          Read reviews from our clients and share your own experience working with us.
        </p>
      </div>

      {/* Aggregate review dashboard metadata */}
      <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 md:p-8 rounded-2xl border ${theme.card}`}>
        
        {/* Rating Average Left (3 cols) */}
        <div className="md:col-span-4 text-center md:border-r border-slate-500/15 py-2 space-y-2">
          <p className="text-5xl font-black font-mono text-emerald-500 tracking-tight">{averageRating}</p>
          <div className="flex gap-1 justify-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.round(parseFloat(averageRating)) ? "fill-amber-500" : "text-slate-700"}`} 
              />
            ))}
          </div>
          <p className="text-[10px] font-mono text-slate-505 uppercase block">Based on {feedbacks.length} reviews</p>
        </div>

        {/* Spread percentages Center (5 cols) */}
        <div className="md:col-span-5 space-y-2 font-mono text-[10px] text-slate-500">
          <span className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Satisfaction Spread</span>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
            const pct = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-12 text-left">{stars} Stars</span>
                <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-slate-900' : 'bg-slate-150'} relative overflow-hidden`}>
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right font-bold text-zinc-100">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>

        {/* Explainer CTA Right (3 cols) */}
        <div className="md:col-span-3 text-center space-y-2.5">
          <HelpCircle className="w-7 h-7 text-cyan-400 mx-auto animate-pulse" />
          <h4 className={`font-bold font-sans text-xs ${theme.textHeading}`}>Share Your Experience</h4>
          <p className={`${theme.textMuted} text-[10px] leading-relaxed max-w-xs mx-auto`}>
            We value your feedback. Leave a review to let us know how we did on your project.
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Review Cards Left (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Sort / Filter:</span>
            {["All", 5, 4, 3].map((val, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRatingFilter(val as any)}
                className={`px-3 py-1 text-xs rounded-full border transition cursor-pointer font-mono ${
                  ratingFilter === val 
                    ? "bg-slate-900 border-emerald-500 text-emerald-400 font-bold" 
                    : isDark ? "bg-slate-950 border-slate-900 text-slate-400" : "bg-white border-slate-205 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {val === "All" ? "All Reviews" : `⭐ ${val} Stars`}
              </button>
            ))}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {filteredFeedbacks.length === 0 ? (
              <p className={`${theme.textMuted} italic text-sm text-center py-12`}>No reviews registered matching current filter rules.</p>
            ) : (
              filteredFeedbacks.map((f) => {
                const projName = f.projectId ? pTitle(f.projectId) : "General Service Audit";
                return (
                  <div key={f.id} className={`p-5 rounded-2xl border ${theme.cardInner} space-y-3`}>
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <h4 className={`font-black font-sans leading-none text-base ${theme.textHeading}`}>{f.clientName}</h4>
                        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block mt-1">FOR // {projName}</span>
                      </div>
                      <div className="flex gap-0.5 text-amber-500 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < f.rating ? "fill-amber-500" : "text-slate-700"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className={`${theme.textMuted} text-xs leading-relaxed italic text-left`}>"{f.comment}"</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-505 pt-2 border-t border-slate-500/5">
                      <span className="font-extrabold text-emerald-405">Verified Review</span>
                      <span>•</span>
                      <span>{new Date(f.createdAt).toISOString().split("T")[0]}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Forms Submission Right (5 cols) */}
        <div className={`xl:col-span-5 border rounded-3xl p-6 md:p-8 relative overflow-hidden bg-[#0c1220]/5 ${theme.card}`}>
          {/* Sign in validation overlay */}


          <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs font-mono">
            <h4 className={`text-xs uppercase font-mono tracking-wider font-extrabold border-b pb-1.5 mb-2 text-left ${
              isDark ? 'text-emerald-400 border-slate-900' : 'text-emerald-700 border-slate-202'
            }`}>
              Leave a Review
            </h4>

            <div>
              <label className="block text-[10px] text-slate-505 mb-1 font-bold text-left">Your Client Name</label>
              <input 
                type="text"
                required
                placeholder="Your Name"
                value={feedbackForm.clientName}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, clientName: e.target.value })}
                className={`w-full rounded p-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-emerald-500 font-semibold text-center`}
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-505 mb-1 font-bold text-left">Your Client Email</label>
              <input 
                type="email"
                required
                placeholder="Your Email"
                value={feedbackForm.clientEmail}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, clientEmail: e.target.value })}
                className={`w-full rounded p-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-emerald-500 font-semibold text-center`}
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-505 mb-1 font-bold text-left">Which Project?</label>
              <select
                value={feedbackForm.projectId}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, projectId: e.target.value })}
                className={`w-full rounded p-2 text-xs outline-none ${theme.input} border font-sans`}
              >
                <option value="">General / Overall Service</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>Project: {p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-505 mb-1 font-bold text-left">Your Rating</label>
              <select
                value={feedbackForm.rating}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value, 10) })}
                className={`w-full rounded p-2 text-xs outline-none ${theme.input} border font-sans`}
              >
                <option value="5">⭐⭐⭐⭐⭐ Excellent — Exceeded expectations</option>
                <option value="4">⭐⭐⭐⭐ Very good — Highly satisfied</option>
                <option value="3">⭐⭐⭐ Good — Met expectations</option>
                <option value="2">⭐⭐ Fair — Room for improvement</option>
                <option value="1">⭐ Poor — Did not meet expectations</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-505 mb-1 font-bold text-left">Your Review</label>
              <textarea 
                rows={3}
                required
                placeholder="Share your thoughts on our work, communication, quality, or anything else..."
                value={feedbackForm.comment}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                className={`w-full rounded p-2 text-xs font-sans outline-none resize-none ${theme.input} border focus:ring-1 focus:ring-emerald-500`}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={feedbackLoading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                {feedbackLoading ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeedbackForm({
                    clientName: user?.name || "",
                    clientEmail: user?.email || "",
                    rating: 5,
                    projectId: "",
                    comment: ""
                  });
                  setActiveTab("home");
                }}
                className={`px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase transition cursor-pointer border ${
                  isDark ? "border-slate-800 hover:bg-slate-900 text-slate-400" : "border-slate-205 hover:bg-slate-50 text-slate-600"
                }`}
              >
                Cancel & Exit Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  function pTitle(pId: string) {
    const pr = projects.find(p => p.id === pId);
    return pr ? pr.title : pId;
  }
}
