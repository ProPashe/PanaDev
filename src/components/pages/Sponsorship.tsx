import React from "react";
import {
  Heart,
  CheckCircle,
  ArrowRight,
  Users,
  Coins,
  X,
  Download,
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
  const downloadSponsorContactCard = () => {
    const contactCard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:PanaDev Apps",
      "ORG:PanaDev Apps",
      "TEL;TYPE=WORK,VOICE:+263713058383",
      "EMAIL:mudzimwapanashe123@gmail.com",
      "NOTE:Reach out to PanaDev Apps for corporate sponsorship and partnership opportunities.",
      "END:VCARD"
    ].join("\r\n");

    const blob = new Blob([contactCard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "PanaDev-Contact.vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12 py-4 animate-fade-in text-left">

      {/* Introduction text */}
      <div className="border-b border-slate-500/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-505 bg-amber-950/20 px-2.5 py-1 rounded inline-block uppercase border border-amber-900/10">
            CORPORATE PARTNERSHIP &amp; SPONSORSHIP INTAKE
          </span>
          <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading} mt-2 tracking-tight`}>
            Partner with PanaDev
          </h2>
          <p className={`${theme.textMuted} text-xs md:text-sm max-w-xl mt-1.5`}>
            Thank you for your interest in partnering with PanaDev Apps. Please complete the verified fields below to outline your organization's sponsorship goals. An executive team member will review your proposal and contact you within 24 business hours to finalize alignment opportunities.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <button
            onClick={downloadSponsorContactCard}
            className="flex items-center gap-2 text-xs font-bold font-mono px-3 py-2 rounded-lg transition cursor-pointer text-slate-900 bg-emerald-300 hover:bg-emerald-400"
          >
            <Download className="w-4 h-4" />
            <span>Download Contact Card</span>
          </button>
          <button
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-2 rounded-lg transition cursor-pointer shrink-0 text-slate-500 hover:text-slate-700 bg-slate-100/60 hover:bg-slate-200/60"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
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
            <span className="text-[10px] uppercase text-cyan-405 font-bold block">Corporate Partnership Proposal</span>
            <span className={`text-[11px] ${theme.textMuted}`}>Complete your proposal below and our executive team will review it for next-step alignment.</span>
          </div>

          {/* Row 1: Name + Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold">Authorized Representative Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Donald Chigwida"
                value={sponsorForm.sponsorName}
                onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorName: e.target.value })}
                className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold">Organization / Company Name (Optional)</label>
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
                <Mail className="w-3 h-3" /> Corporate Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. partnerships@company.co.zw"
                value={sponsorForm.sponsorEmail}
                onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorEmail: e.target.value })}
                className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold flex items-center gap-1">
                <Phone className="w-3 h-3" /> Direct Contact Number *
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
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold">Intended Financial Commitment (USD) *</label>
              <input
                type="number"
                required
                min={100}
                placeholder="Enter amount (Minimum tier starts at $100)"
                value={sponsorForm.fundingAmount}
                onChange={(e) => setSponsorForm({ ...sponsorForm, fundingAmount: parseInt(e.target.value, 10) })}
                className={`w-full rounded px-2.5 py-2 text-xs font-mono outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold">Corporate Website / LinkedIn URL (Optional)</label>
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
            <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold">Partnership Objectives & Custom Requests (Optional)</label>
            <textarea
              rows={3}
              placeholder="Please outline your target audience, marketing expectations, or specific brand integration requirements..."
              value={sponsorForm.message}
              onChange={(e) => setSponsorForm({ ...sponsorForm, message: e.target.value })}
              className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500 resize-none`}
            />
          </div>

          <div className="flex items-start gap-3 text-[10px] font-mono text-slate-400 leading-snug mb-2">
            <input
              type="checkbox"
              id="authorizedRepresentative"
              checked={sponsorForm.termsAccepted ?? false}
              onChange={(e) => setSponsorForm({ ...sponsorForm, termsAccepted: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="authorizedRepresentative" className="text-[10px] leading-relaxed text-slate-400">
              I certify that I am an authorized representative of the aforementioned organization and that the information provided is accurate for initial evaluation purposes.
            </label>
          </div>

          <button
            type="submit"
            disabled={sponsorLoading || !(sponsorForm.termsAccepted ?? false)}
            className="w-full bg-[#10b981] hover:bg-emerald-450 text-black font-extrabold py-3.5 rounded-xl text-xs font-mono uppercase transition cursor-pointer shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sponsorLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <>
                <span>Submit Partnership Proposal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
