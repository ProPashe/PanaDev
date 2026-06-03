import React from "react";
import { 
  Calendar, 
  Lock, 
  CheckCircle, 
  Activity, 
  Clock, 
  HelpCircle, 
  Video, 
  Users, 
  MapPin, 
  Send,
  X
} from "lucide-react";
import { Booking } from "../../types";

interface BookingProps {
  isDark: boolean;
  theme: any;
  bookings: Booking[];
  bookingForm: any;
  setBookingForm: (form: any) => void;
  handleBookingSubmit: (e: React.FormEvent) => Promise<void>;
  bookingLoading: boolean;
  user: any;
  setIsSignInModalOpen: (open: boolean) => void;
  setActiveTab: (tab: any) => void;
}

export default function Bookings({
  isDark,
  theme,
  bookings,
  bookingForm,
  setBookingForm,
  handleBookingSubmit,
  bookingLoading,
  user,
  setIsSignInModalOpen,
  setActiveTab
}: BookingProps) {
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
      {/* Introduction text */}
      <div className="border-b border-slate-500/10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-505 bg-cyan-950/20 px-2.5 py-1 rounded inline-block uppercase border border-cyan-900/10">
              CONSULTATION BOOKING
            </span>
            <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading} mt-2 tracking-tight`}>
              Schedule Design Consultation
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
          Book a consultation with our team. Choose a date, time, and project type, and we will get in touch to confirm your session.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left column info */}
        <div className="xl:col-span-5 space-y-6">
          <div className="space-y-4 font-mono text-[11px] text-left">
            <div className={`p-4 rounded-xl border ${theme.card}`}>
              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className={`text-xs font-bold font-sans ${theme.textHeading}`}>Google Meet / Zoom</h4>
                  <p className={`${theme.textMuted} text-[10px] leading-relaxed mt-1`}>
                    Virtual screen-sharing sessions via Google Meet or Zoom. A recording can be shared to your email afterwards.
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${theme.card}`}>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className={`text-xs font-bold font-sans ${theme.textHeading}`}>Interactive Team Audits</h4>
                  <p className={`${theme.textMuted} text-[10px] leading-relaxed mt-1`}>
                    Invite your team members to join the session and review project blueprints, requirements, and architecture together.
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${theme.card}`}>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className={`text-xs font-bold font-sans ${theme.textHeading}`}>Physical Meetings</h4>
                  <p className={`${theme.textMuted} text-[10px] leading-relaxed mt-1`}>
                    Available for enterprise clients in Harare. Subject to availability — please mention this in your booking description.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Anonymized Reservations Registry */}
          <div className="space-y-3">
            <h4 className={`text-xs uppercase font-mono font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Recent Bookings
            </h4>
            <div className={`border rounded-2xl p-4 text-[11px] font-mono select-none ${theme.cardInner}`}>
              {bookings.length === 0 ? (
                <p className={`${theme.textMuted} italic`}>No reservation slots currently locked. Book yours now!</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {bookings.map((b) => (
                    <div 
                      key={b.id} 
                      className={`flex justify-between items-center pb-2 border-b last:border-0 ${
                        isDark ? 'border-slate-900/60' : 'border-slate-100'
                      } ${theme.textMuted}`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">📅 {b.date} // {b.timeSlot.split(" ")[0]}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/20 text-emerald-400 font-bold tracking-wider uppercase border border-emerald-900/10 shrink-0">
                        {b.projectType.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right column form */}
        <div className={`xl:col-span-7 border ${theme.card} rounded-3xl p-6 md:p-8 relative overflow-hidden bg-[#0c1220]/5`}>


          <form onSubmit={handleBookingSubmit} className="space-y-5">
            <h4 className={`text-xs uppercase font-mono tracking-wider font-bold border-b pb-2 mb-2 text-left ${
              isDark ? 'text-cyan-400 border-slate-900' : 'text-cyan-700 border-slate-200'
            }`}>
              Your Appointment Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold text-left">Your Client Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Liam Vance"
                  value={bookingForm.clientName}
                  onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                  className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold text-left">Your Client Email</label>
                <input 
                  type="email"
                  required
                  placeholder="liam@vance.net"
                  value={bookingForm.clientEmail}
                  onChange={(e) => setBookingForm({ ...bookingForm, clientEmail: e.target.value })}
                  className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold text-left">Company/Team Registry (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Apex Core S.A."
                  value={bookingForm.companyName}
                  onChange={(e) => setBookingForm({ ...bookingForm, companyName: e.target.value })}
                  className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold text-left">Design Consultation Category</label>
                <select
                  value={bookingForm.projectType}
                  onChange={(e) => setBookingForm({ ...bookingForm, projectType: e.target.value as any })}
                  className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border`}
                >
                  <option value="web">Web Application blueprint</option>
                  <option value="mobile">Fluid Mobile App (React Native)</option>
                  <option value="consulting">General architecture audit</option>
                  <option value="other">Other custom sandbox solutions</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold text-left">Preferred Date</label>
                <input 
                  type="date"
                  required
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold text-left">Preferred Time Slot (UTC)</label>
                <select
                  value={bookingForm.timeSlot}
                  onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                  className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none ${theme.input} border`}
                >
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM UTC</option>
                  <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM UTC</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM UTC</option>
                  <option value="04:30 PM - 05:30 PM">04:30 PM - 05:30 PM UTC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold text-left">Estimated Project Budget Allocation (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold font-mono">$</span>
                <input 
                  type="text"
                  placeholder="e.g. 1500, $2,000 - $5,000, or type your target budget"
                  value={bookingForm.budget || ""}
                  onChange={(e) => setBookingForm({ ...bookingForm, budget: e.target.value })}
                  className={`w-full rounded pl-7 pr-2.5 py-2 text-xs font-sans outline-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-505 font-mono mb-1 font-bold text-left">Project Description</label>
              <textarea 
                rows={3}
                required
                placeholder="Describe your project goals, any features you need, or questions you want to discuss..."
                value={bookingForm.description}
                onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                className={`w-full rounded px-2.5 py-2 text-xs font-sans outline-none resize-none ${theme.input} border focus:ring-1 focus:ring-cyan-500`}
              />
            </div>

            <div className="flex flex-col gap-3 text-[10px] text-slate-400 font-mono">
              <label className="inline-flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={bookingForm.termsAccepted || false}
                  onChange={(e) => setBookingForm({ ...bookingForm, termsAccepted: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  required
                />
                <span className="leading-tight text-slate-200">
                  I have read and agree to the <a href="/terms-and-conditions.txt" download target="_blank" rel="noopener noreferrer" className="underline text-cyan-300 hover:text-cyan-200">Terms & Conditions</a>.
                </span>
              </label>
              <p className="text-[10px] text-slate-500">
                Please download and review the agreement before submitting your consultation request.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={bookingLoading || !bookingForm.termsAccepted}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold py-3.5 rounded-xl text-xs font-mono uppercase transition cursor-pointer shadow-md shadow-cyan-600/10"
              >
                {bookingLoading ? "Registering Reservation..." : "Submit Consultation Request"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBookingForm({
                    clientName: user?.name || "",
                    clientEmail: user?.email || "",
                    companyName: "",
                    date: new Date().toISOString().split("T")[0],
                    timeSlot: "09:00 AM - 10:00 AM",
                    projectType: "web",
                    description: "",
                    budget: "",
                    termsAccepted: false
                  });
                  setActiveTab("home");
                }}
                className={`px-5 py-3.5 rounded-xl text-xs font-mono font-bold uppercase transition cursor-pointer border ${
                  isDark ? "border-slate-800 hover:bg-slate-900 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-600"
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
}
