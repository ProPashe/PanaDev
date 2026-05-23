import React from "react";
import {
  Heart,
  CheckCircle,
  ArrowRight,
  Users,
  Coins,
  X,
  ExternalLink,
  Mail,
  Phone
} from "lucide-react";
import { Sponsorship } from "../../types";

interface SponsorshipProps {
  isDark: boolean;
  theme: any;
  sponsorships: Sponsorship[];
  sponsorForm: any;
  setSponsorForm: (form: any) => void;
  handleSponsorSubmit: (e: React.FormEvent) => Promise<void>;
  sponsorLoading: boolean;
  user: any;
  setIsSignInModalOpen: (open: boolean) => void;
  setActiveTab: (tab: any) => void;
}

export default function SponsorshipPage({
  isDark,
  theme,
  sponsorships,
  sponsorForm,
  setSponsorForm,
  handleSponsorSubmit,
  sponsorLoading,
  user,
  setIsSignInModalOpen,
  setActiveTab
}: SponsorshipProps) {

  return (
    <div className="space-y-12 py-4 animate-fade-in text-left">

      {/* Introduction text */}
      <div className="border-b border-slate-500/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-505 bg-amber-950/20 px-2.5 py-1 rounded inline-block uppercase border border-amber-900/10">
            SPONSORSHIP &amp; SUPPORT
          </span>
          <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading} mt-2 tracking-tight`}>
            Partner with PanaDev
          </h2>
          <p className={`${theme.textMuted} text-xs md:text-sm max-w-xl mt-1.5`}>
            Support our mission to build quality software solutions, open-source tools, and digital ecosystems across Africa and beyond. Fill in the form below and our team will reach out to you directly.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-1.5 self-start sm:self-center text-xs font-bold font-mono px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 text-slate-500 hover:text-slate-700 bg-slate-100/60 hover:bg-slate-200/60"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>

      {/* Active Sponsors Registry */}
      <div className="space-y-4">
        <h4 className={`text-xs uppercase font-mono font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-705'}`}>
          Active Sponsors Registry
        </h4>
        <div className={`p-6 rounded-2xl border ${theme.cardInner} space-y-4`}>
          {sponsorships.length === 0 ? (
            <p className={`${theme.textMuted} text-xs font-mono italic text-center py-4`}>No active sponsors registered yet. Be the first to support PanaDev!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {sponsorships.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 relative overflow-hidden bg-slate-900/10 border-slate-800`}
                >
                  <div className="space-y-1.5">
                    <h4 className={`text-sm font-extrabold font-sans leading-none truncate ${theme.textHeading}`}>{s.name}</h4>
                    {s.organization && <span className="text-[9px] font-mono text-slate-500 block leading-none">{s.organization}</span>}
                  </div>

                  <div className="flex items-center justify-between font-mono text-[10px] pt-2 border-t border-slate-500/5">
                    <span className="text-emerald-450 font-bold">${s.amount || "—"}</span>
                    {s.website && (
                      <a href={s.website} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Why sponsor section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: <Heart className="w-5 h-5 text-rose-400" />,
            title: "Support African Tech",
            desc: "Help us build world-class software tools designed and deployed in Zimbabwe and the broader African market."
          },
          {
            icon: <Users className="w-5 h-5 text-cyan-400" />,
            title: "Brand Visibility",
            desc: "Get your brand featured prominently across PanaDev platforms, reaching thousands of developers and businesses."
          },
          {
            icon: <Coins className="w-5 h-5 text-amber-400" />,
            title: "Tailored Partnerships",
            desc: "We work with you to create a sponsorship arrangement that fits your goals — no fixed tiers, flexible agreements."
          }
        ].map((item, idx) => (
          <div key={idx} className={`border ${theme.card} p-5 rounded-2xl flex flex-col gap-4`}>
            <div className={`p-2.5 w-fit rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-50 border-slate-205'}`}>
              {item.icon}
            </div>
            <div>
              <h3 className={`text-sm font-extrabold ${theme.textHeading} mb-1`}>{item.title}</h3>
              <p className={`text-xs leading-relaxed ${theme.textMuted}`}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sponsorship Form */}
      <div
        id="sponsor-form-block"
        className={`border rounded-3xl p-6 md:p-8 ${theme.card}`}
      >
        <form onSubmit={handleSponsorSubmit} className="space-y-5">
          <div className="border-b pb-3 text-left font-mono mb-2">
            <span className="text-[10px] uppercase text-cyan-405 font-bold block">Sponsorship Enquiry Form</span>
            <span className={`text-[11px] ${theme.textMuted}`}>Fill in your details and we will get back to you within 24 hours.</span>
          </div>

          {/* Row 1: Name + Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Liam Vance"
                value={sponsorForm.sponsorName}
                onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorName: e.target.value })}
                className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold">Company / Organisation (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Apex Core Ltd"
                value={sponsorForm.companyName}
                onChange={(e) => setSponsorForm({ ...sponsorForm, companyName: e.target.value })}
                className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
              />
            </div>
          </div>

          {/* Row 2: Email + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={sponsorForm.sponsorEmail}
                onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorEmail: e.target.value })}
                className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +263 77 123 4567"
                value={sponsorForm.phone}
                onChange={(e) => setSponsorForm({ ...sponsorForm, phone: e.target.value })}
                className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
              />
            </div>
          </div>

          {/* Row 3: Amount + Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold">Proposed Support Amount (USD) *</label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 500"
                value={sponsorForm.fundingAmount}
                onChange={(e) => setSponsorForm({ ...sponsorForm, fundingAmount: parseInt(e.target.value, 10) })}
                className={`w-full rounded px-2.5 py-2 text-xs font-mono outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold">Sponsor Website Link (Optional)</label>
              <input
                type="url"
                placeholder="https://yourcompany.com"
                value={sponsorForm.website}
                onChange={(e) => setSponsorForm({ ...sponsorForm, website: e.target.value })}
                className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
              />
            </div>
          </div>

          {/* Row 4: Message */}
          <div>
            <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold">Message / Notes (Optional)</label>
            <textarea
              rows={3}
              placeholder="Tell us about your sponsorship goals, preferred partnership type, or any specific requirements..."
              value={sponsorForm.message}
              onChange={(e) => setSponsorForm({ ...sponsorForm, message: e.target.value })}
              className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500 resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={sponsorLoading}
            className="w-full bg-[#10b981] hover:bg-emerald-450 text-black font-extrabold py-3.5 rounded-xl text-xs font-mono uppercase transition cursor-pointer shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
          >
            {sponsorLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <>
                <span>Submit Sponsorship Enquiry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
