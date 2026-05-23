import React from "react";
import { 
  Code2, Smartphone, Palette, Database, Network, Cpu, X, ArrowRight, 
  CheckCircle, Layers, Users, Clock, HelpCircle, ShieldCheck, Zap, 
  Globe, Settings, Coins, Server, MonitorSmartphone, LayoutTemplate
} from "lucide-react";

interface ServicesProps {
  isDark: boolean;
  theme: any;
  setActiveTab: (tab: any) => void;
}

export default function Services({ isDark, theme, setActiveTab }: ServicesProps) {
  
  const developmentPhases = [
    {
      num: "01",
      title: "Requirements Discovery",
      desc: "An in-depth evaluation of your target metrics, workflows, and problems, transforming requirements into technical specifications.",
      features: ["Requirement Ledger Drafting", "Target Audience Personas Analysis", "Technical Spec Compilation"]
    },
    {
      num: "02",
      title: "Interactive Prototyping",
      desc: "Creating high-fidelity interactive wireframes outlining precise typography, color configurations, and component schemas.",
      features: ["High-Contrast Light/Dark Layout Panels", "Custom Font Pairing Exploration", "Interactive Component Map Diagrams"]
    },
    {
      num: "03",
      title: "High-Performance Development",
      desc: "Writing modular, scalable TypeScript programs backed by lightweight fast local or flexible cloud-synchronized databases.",
      features: ["Clean React Component Refactoring", "Robust Local & Cloud Database Hooks", "Optimal Responsive Mobile Optimization"]
    },
    {
      num: "04",
      title: "SLA Integration & Deploy",
      desc: "Injecting extensive automated build verification and secure sandbox isolation rulesets to lock stable multi-user hosting.",
      features: ["Complete Unit Testing Sandboxes", "Cloud Run Container Integration", "AES Encrypted Database Rules Verification"]
    }
  ];

  const packages = [
    {
      icon: <Globe className="w-8 h-8 text-emerald-500" />,
      title: "Website Starter Pack",
      desc: "Perfect for new businesses needing a professional online presence quickly.",
      badge: "Popular",
      color: "emerald",
      features: [
        "Responsive 5-page design",
        "SEO Optimization",
        "Contact form integration",
        "Mobile-first layouts",
        "1 month free support"
      ]
    },
    {
      icon: <Settings className="w-8 h-8 text-cyan-500" />,
      title: "Business Automation Pack",
      desc: "Streamline your internal operations with custom dashboard tools.",
      badge: "Enterprise",
      color: "cyan",
      features: [
        "Custom admin dashboard",
        "Database integration",
        "User role management",
        "Automated reporting",
        "Secure API endpoints"
      ]
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "School System Package",
      desc: "Complete portal for managing students, grades, and communications.",
      badge: "Specialized",
      color: "purple",
      features: [
        "Student & Parent portals",
        "Grade tracking system",
        "Attendance monitoring",
        "Announcement boards",
        "Cloud backups"
      ]
    },
    {
      icon: <Smartphone className="w-8 h-8 text-pink-500" />,
      title: "Mobile App Lite",
      desc: "A streamlined mobile application for Android and iOS devices.",
      badge: "Mobile",
      color: "pink",
      features: [
        "Cross-platform codebase",
        "Push notifications",
        "Offline capabilities",
        "App store deployment",
        "Native performance"
      ]
    }
  ];

  const techStack = [
    { category: "Frontend", tools: ["React 19", "Vite", "Tailwind CSS", "TypeScript", "Framer Motion"], icon: <MonitorSmartphone className="w-5 h-5 text-emerald-500"/> },
    { category: "Backend & APIs", tools: ["Node.js", "Express", "REST APIs", "WebSockets"], icon: <Server className="w-5 h-5 text-cyan-500"/> },
    { category: "Database", tools: ["SQLite", "Firebase", "JSON Stores", "PostgreSQL"], icon: <Database className="w-5 h-5 text-purple-500"/> },
    { category: "Design", tools: ["Figma", "Lucide Icons", "SVG Animations", "CSS Grid"], icon: <LayoutTemplate className="w-5 h-5 text-pink-500"/> }
  ];

  return (
    <div className="space-y-16 py-4 animate-fade-in-up text-left">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-500/10 pb-6">
        <div>
          <span className="text-[10px] font-mono font-bold text-emerald-505 bg-emerald-950/20 px-2.5 py-1 rounded inline-block uppercase border border-emerald-900/10 mb-2">
            ENGINEERING & CONSULTING
          </span>
          <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading} tracking-tight`}>
            Professional Services Matrix
          </h2>
          <p className={`${theme.textMuted} text-sm max-w-xl mt-3 leading-relaxed`}>
            We design, develop, and maintain custom digital systems crafted with absolute precision to drive measurable business growth across Africa and globally.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-1.5 self-start sm:self-center text-xs font-bold font-mono px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
            isDark ? "text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/60" : "text-slate-500 hover:text-slate-700 bg-slate-100/60 hover:bg-slate-200/60"
          }`}
        >
          <X className="w-3.5 h-3.5" />
          <span>Close</span>
        </button>
      </div>

      {/* Productized Packages Section */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-mono font-bold text-purple-500 bg-purple-950/20 px-2.5 py-1 rounded inline-block uppercase border border-purple-900/10 mb-2">
            SOLUTION PACKAGES
          </span>
          <h3 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading} tracking-tight`}>
            Productized Offers
          </h3>
          <p className={`${theme.textMuted} text-sm mt-3`}>
            Choose from our specialized development packages designed to solve common business needs efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {packages.map((pkg, idx) => (
            <div key={idx} className={`relative p-6 rounded-3xl border ${theme.cardInner} flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden`}>
              {/* Background gradient hint */}
              <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity bg-${pkg.color}-500`} />
              
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl bg-${pkg.color}-500/10 border border-${pkg.color}-500/20 shadow-inner`}>
                    {pkg.icon}
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-1 rounded-full bg-${pkg.color}-950/30 text-${pkg.color}-400 uppercase border border-${pkg.color}-500/30`}>
                    {pkg.badge}
                  </span>
                </div>

                <div>
                  <h4 className={`text-xl font-bold ${theme.textHeading} leading-tight`}>{pkg.title}</h4>
                  <p className={`${theme.textMuted} text-xs mt-2 leading-relaxed h-10`}>{pkg.desc}</p>
                </div>

                <div className="space-y-3 border-t border-slate-500/10 pt-4">
                  {pkg.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle className={`w-4 h-4 text-${pkg.color}-500 shrink-0 mt-0.5`} />
                      <span className={`${theme.textHeading} text-xs font-medium`}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 relative z-10 space-y-3">
                <div className={`text-center p-3 rounded-xl border border-dashed border-slate-500/30 bg-slate-900/20`}>
                  <span className={`font-mono font-bold text-lg text-${pkg.color}-400`}>Contact Us</span>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">For Custom Quote</span>
                </div>
                <button
                  onClick={() => setActiveTab("booking")}
                  className={`w-full py-3 rounded-xl bg-${pkg.color}-500 hover:bg-${pkg.color}-400 text-black text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-${pkg.color}-500/20`}
                >
                  <span>Book Package</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technologies Grid */}
      <div className="space-y-8 pt-10 border-t border-slate-500/10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-mono font-bold text-cyan-500 bg-cyan-950/20 px-2.5 py-1 rounded inline-block uppercase border border-cyan-900/10 mb-2">
            CORE STACK
          </span>
          <h3 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading} tracking-tight`}>
            Technologies We Use
          </h3>
          <p className={`${theme.textMuted} text-sm mt-3`}>
            We build with modern, high-performance tools to ensure your software is fast, scalable, and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((stack, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border ${theme.cardInner} space-y-4`}>
              <div className="flex items-center gap-3 border-b border-slate-500/10 pb-3">
                {stack.icon}
                <h4 className={`font-bold ${theme.textHeading}`}>{stack.category}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {stack.tools.map((tool, i) => (
                  <span key={i} className={`text-xs font-mono px-2.5 py-1 rounded-md ${isDark ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Workflow / Development Phases Section */}
      <div className="space-y-8 pt-10 border-t border-slate-500/10">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-950/20 px-2.5 py-1 rounded inline-block uppercase border border-amber-900/10 mb-2">
            PROCESS
          </span>
          <h3 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading} tracking-tight`}>
            Development Workflow
          </h3>
          <p className={`${theme.textMuted} text-sm max-w-xl mt-3`}>
            Our rigorous four-phase software engineering cycle designed to verify speed, aesthetics, and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative">
          {/* Connecting line for desktop */}
          <div className="hidden xl:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 z-0" />

          {developmentPhases.map((phase, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl border ${theme.cardInner} space-y-5 flex flex-col justify-between relative z-10 bg-inherit shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
                  <span className="text-xl font-black font-mono text-emerald-400">{phase.num}</span>
                </div>
                <h4 className={`text-base font-bold ${theme.textHeading} leading-tight`}>{phase.title}</h4>
                <p className={`${theme.textMuted} text-xs leading-relaxed`}>{phase.desc}</p>
              </div>

              {/* Phase deliverables */}
              <div className="border-t border-slate-500/10 pt-4 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2 tracking-wider">Key Deliverables:</span>
                {phase.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5 shrink-0" />
                    <span className={`${theme.textMuted}`}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
