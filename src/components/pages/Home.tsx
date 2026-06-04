import React from "react";
import { 
  Sparkles, Code2, Layers, Award, Activity, Calendar, Send, 
  ShieldCheck, ArrowRight, Terminal, CheckCircle, Database,
  Smartphone, Palette, Network, Cpu, TrendingUp, Star,
  Briefcase, Building2, GraduationCap, HeartPulse, ShoppingCart, Zap
} from "lucide-react";
import { Project, Feedback } from "../../types";

interface HomeProps {
  isDark: boolean;
  theme: any;
  setActiveTab: (tab: any) => void;
  projects: Project[];
  feedbacks: Feedback[];
  setSelectedProjectId: (id: string) => void;
}

export default function Home({ isDark, theme, setActiveTab, projects, feedbacks, setSelectedProjectId }: HomeProps) {
  // Take up to 3 feedbacks as testimonials
  const testimonials = feedbacks.slice(0, 3);

  // Take first 3 projects as featured
  const featuredProjects = projects.slice(0, 3);

  const services = [
    {
      icon: <Code2 className="w-6 h-6 text-emerald-500" />,
      title: "Website Development",
      description: "Business platforms, analytics dashboards, and responsive web applications built with React and Tailwind CSS."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-cyan-500" />,
      title: "Mobile Apps",
      description: "Fluid and native-feeling Android & iOS applications powered by React Native and optimized layouts."
    },
    {
      icon: <Palette className="w-6 h-6 text-pink-500" />,
      title: "UI/UX Design",
      description: "Modern, high-fidelity interfaces utilizing clean typography, generous spacing, and custom color mappings."
    },
    {
      icon: <Database className="w-6 h-6 text-amber-500" />,
      title: "Database Systems",
      description: "Secure, reliable JSON databases and Firestore cloud stores designed for rapid document tracking."
    },
    {
      icon: <Network className="w-6 h-6 text-purple-500" />,
      title: "Networking Applications",
      description: "Socket-level pipelines, proxy routers, and low-latency API backplanes for scalable architecture."
    },
    {
      icon: <Cpu className="w-6 h-6 text-red-500" />,
      title: "AI Integration",
      description: "Smart features integrated directly with Google's Gemini SDK for semantic summaries and automation."
    }
  ];

  const stats = [
    { value: "20+", label: "Projects Completed" },
    { value: "10+", label: "Happy Clients" },
    { value: "5+", label: "Core Technologies" },
    { value: "100%", label: "SLA Uptime" }
  ];

  const industries = [
    { name: "Tech Startups", icon: <Zap className="w-5 h-5 text-amber-500"/> },
    { name: "Financial Services", icon: <Building2 className="w-5 h-5 text-emerald-500"/> },
    { name: "Education", icon: <GraduationCap className="w-5 h-5 text-cyan-500"/> },
    { name: "Healthcare", icon: <HeartPulse className="w-5 h-5 text-rose-500"/> },
    { name: "E-commerce", icon: <ShoppingCart className="w-5 h-5 text-purple-500"/> },
    { name: "Government/NGOs", icon: <Briefcase className="w-5 h-5 text-blue-500"/> }
  ];

  const reasons = [
    { title: "Blazing Speed", desc: "Optimized code for instant load times.", icon: <Zap className="w-5 h-5 text-amber-400"/> },
    { title: "Ironclad Security", desc: "Built with modern encryption standards.", icon: <ShieldCheck className="w-5 h-5 text-emerald-400"/> },
    { title: "Dedicated Support", desc: "Direct access to our engineering team.", icon: <Activity className="w-5 h-5 text-cyan-400"/> },
    { title: "Infinite Scalability", desc: "Architecture that grows with your business.", icon: <TrendingUp className="w-5 h-5 text-purple-400"/> }
  ];

  return (
    <div className="space-y-20 py-4 text-left">
      
      {/* Animated Hero Section */}
      <div 
        id="home-hero"
        className={`relative rounded-[2.5rem] overflow-hidden p-8 md:p-16 border ${
          isDark 
            ? "bg-[#050a14] border-slate-800/80 shadow-2xl" 
            : "bg-linear-to-br from-white via-slate-50 to-emerald-50/30 border-slate-200 shadow-xl"
        }`}
      >
        {/* Abstract animated grid lines and radial ambient glows */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-size-[24px_24px]" />
        
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 w-125 h-125 bg-emerald-500/20 rounded-full blur-[100px] opacity-50 animate-float pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 left-20 w-100 h-100 bg-cyan-500/10 rounded-full blur-[80px] opacity-40 animate-float pointer-events-none mix-blend-screen" style={{animationDelay: '2s'}} />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="relative z-10 max-w-4xl space-y-8 animate-fade-in-up">
          <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-mono border backdrop-blur-md ${
            isDark 
              ? "bg-[#051c15]/60 border-[#0c4e31]/50 text-[#00cc99]" 
              : "bg-emerald-50/80 border-emerald-200 text-emerald-800"
          }`}>
            <Sparkles className="w-4 h-4 text-[#00cc99] animate-pulse" />
            <span className="font-bold tracking-widest uppercase">PanaDev Digital Solutions</span>
          </div>

          <h1 className={`text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter ${theme.textHeading} leading-[1.1]`}>
            Building Modern, Secure & <br className="hidden md:block"/>
            <span className="gradient-text bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-size-[200%_auto] animate-[shimmer_3s_linear_infinite]">
              Scalable Systems.
            </span>
          </h1>

          <p className={`${isDark ? "text-slate-400" : "text-slate-600"} text-lg md:text-xl max-w-2xl leading-relaxed font-sans font-medium`}>
            We build high-quality digital products that close the technology gap between Africa and the rest of the world. Designed for your needs, built to global standards.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => setActiveTab("projects")}
              className="group flex items-center gap-3 bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 py-3.5 px-8 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 cursor-pointer"
            >
              <Layers className="w-5 h-5" />
              <span>View Portfolio</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => setActiveTab("booking")}
              className={`group flex items-center gap-3 py-3.5 px-8 rounded-2xl font-bold text-sm transition-all border cursor-pointer ${
                isDark 
                  ? "bg-slate-900/50 border-slate-700 text-white hover:bg-slate-800" 
                  : "bg-white/50 border-slate-200 text-slate-800 hover:bg-slate-50"
              } backdrop-blur-sm`}
            >
              <Calendar className="w-5 h-5" />
              <span>Book Consultation</span>
            </button>
          </div>
        </div>

        {/* Floating Trust Badge */}
        <div className={`absolute right-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 p-6 rounded-3xl ${isDark ? 'bg-[#0a101c]/80 border-slate-800/50' : 'bg-white/80 border-white'} backdrop-blur-xl border shadow-2xl w-72 animate-fade-in-up`} style={{animationDelay: '0.4s'}}>
          <div className="flex items-center gap-3 border-b border-slate-500/20 pb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h4 className={`font-bold ${theme.textHeading} leading-none`}>Enterprise Grade</h4>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">100% SLA Uptime</span>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            {[
              { label: "AES Encrypted Data", active: true },
              { label: "Responsive Architecture", active: true },
              { label: "24/7 Priority Support", active: true }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.active ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                  <CheckCircle className={`w-3 h-3 ${item.active ? 'text-[#050a14]' : 'text-slate-500'}`} />
                </div>
                <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 p-8 md:p-10 rounded-4xl border ${isDark ? 'bg-linear-to-r from-slate-900 via-[#0a101c] to-slate-900 border-slate-800/60' : 'bg-white border-slate-200'} shadow-sm text-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-emerald-500/5 pointer-events-none" />
        {stats.map((stat, idx) => (
          <div key={idx} className="space-y-2 relative z-10 animate-fade-in-up" style={{animationDelay: `${idx * 0.1}s`}}>
            <p className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-linear-to-br from-emerald-400 to-cyan-500 font-mono tracking-tighter">
              {stat.value}
            </p>
            <p className={`${theme.textMuted} text-[10px] md:text-xs font-mono uppercase tracking-widest font-bold`}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Services Grid */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full inline-block uppercase tracking-widest border border-emerald-500/20">
            OUR SPECIALIZATIONS
          </span>
          <h2 className={`text-3xl md:text-4xl font-black ${theme.textHeading} tracking-tight`}>
            Core Services
          </h2>
          <p className={`${theme.textMuted} text-sm md:text-base leading-relaxed`}>
            We engineer pristine, secure, and intuitive applications that automate daily workflows and inspire user confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <div 
              key={idx}
              className={`p-8 rounded-4xl border ${theme.cardInner} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group flex flex-col justify-between relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                {React.cloneElement(service.icon, { className: "w-24 h-24" })}
              </div>
              <div className="space-y-5 relative z-10">
                <div className={`p-4 rounded-2xl w-fit ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className={`text-lg font-bold ${theme.textHeading}`}>{service.title}</h3>
                <p className={`${theme.textMuted} text-sm leading-relaxed`}>{service.description}</p>
              </div>
              <button 
                onClick={() => setActiveTab("services")}
                className="mt-8 flex items-center gap-2 text-xs font-mono font-bold text-emerald-500 hover:text-emerald-400 select-none text-left cursor-pointer w-fit group/btn"
              >
                <span>Explore Details</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Projects Showcase */}
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <span className="text-[10px] font-mono font-bold text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-full inline-block uppercase tracking-widest border border-cyan-500/20">
              OUR SELECTED PORTFOLIO
            </span>
            <h2 className={`text-3xl md:text-4xl font-black ${theme.textHeading} tracking-tight`}>
              Featured Success Stories
            </h2>
            <p className={`${theme.textMuted} text-sm md:text-base leading-relaxed`}>
              Explore our recent success stories, engineering-grade platforms, and interactive client-side demonstrations.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab("projects")}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 py-3 px-6 rounded-2xl font-bold font-mono text-sm border border-slate-800 transition shadow-lg shrink-0 cursor-pointer group"
          >
            <span>Explore All Projects</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <div 
              key={project.id}
              className={`rounded-4xl border ${theme.cardInner} flex flex-col overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group`}
            >
              {/* Image Placeholder - User will replace this with real images */}
              <div className={`aspect-video w-full ${isDark ? 'bg-slate-900/80' : 'bg-slate-100'} flex items-center justify-center border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10" />
                <span className="text-slate-500 font-mono text-xs z-20 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Add Screenshot Here
                </span>
              </div>

              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6 relative z-20 -mt-10">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-900/50 uppercase font-bold tracking-wider backdrop-blur-md">
                      {project.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-950/80 px-2 py-1 rounded-md border border-amber-900/50 backdrop-blur-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold">{project.metrics.stars}</span>
                    </div>
                  </div>
                  <h3 className={`text-xl font-black ${theme.textHeading} leading-tight`}>{project.title}</h3>
                  <p className={`${theme.textMuted} text-sm leading-relaxed line-clamp-2`}>
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span key={i} className={`text-[10px] font-mono px-2.5 py-1 rounded-md font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setActiveTab("projects");
                  }}
                  className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-slate-900 rounded-xl text-sm font-bold font-mono transition-all duration-300 cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us & Industries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10 border-t border-slate-500/10">
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-purple-500 bg-purple-500/10 px-3 py-1.5 rounded-full inline-block uppercase tracking-widest border border-purple-500/20">
              WHY PANADEV
            </span>
            <h3 className={`text-2xl md:text-3xl font-black ${theme.textHeading} tracking-tight`}>
              The PanaDev Advantage
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reasons.map((r, i) => (
              <div key={i} className={`p-5 rounded-2xl border ${theme.cardInner} space-y-3`}>
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {r.icon}
                </div>
                <h4 className={`font-bold ${theme.textHeading}`}>{r.title}</h4>
                <p className={`${theme.textMuted} text-xs leading-relaxed`}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full inline-block uppercase tracking-widest border border-amber-500/20">
              INDUSTRIES
            </span>
            <h3 className={`text-2xl md:text-3xl font-black ${theme.textHeading} tracking-tight`}>
              Sectors We Serve
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {industries.map((ind, i) => (
              <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${theme.cardInner} hover:border-emerald-500/30 transition-colors`}>
                {ind.icon}
                <span className={`text-sm font-semibold ${theme.textHeading}`}>{ind.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Testimonials */}
      <div className="space-y-10 pt-10 border-t border-slate-500/10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full inline-block uppercase tracking-widest border border-amber-500/20">
            PROVEN TRACK RECORD
          </span>
          <h2 className={`text-3xl md:text-4xl font-black ${theme.textHeading} tracking-tight`}>
            Client Testimonials
          </h2>
          <p className={`${theme.textMuted} text-sm md:text-base leading-relaxed`}>
            Hear from corporate engineers, designers, and accounting leaders who have integrated PanaDev apps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.length > 0 ? (
            testimonials.map((test) => (
              <div 
                key={test.id}
                className={`p-8 rounded-4xl border ${theme.cardInner} flex flex-col justify-between h-full space-y-6 relative hover:-translate-y-1 transition-transform`}
              >
                <div className="absolute top-6 right-6 text-6xl font-serif text-slate-800/30 leading-none">"</div>
                <div className="space-y-4 relative z-10">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < test.rating ? "text-amber-500 fill-amber-500" : "text-slate-700"}`} 
                      />
                    ))}
                  </div>
                  <p className={`${theme.textHeading} leading-relaxed text-sm italic`}>
                    "{test.comment}"
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-slate-500/10 pt-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-cyan-500 text-slate-900 font-bold flex items-center justify-center text-sm font-mono shadow-md">
                    {test.clientName[0]}
                  </div>
                  <div>
                    <h4 className={`font-bold ${theme.textHeading} text-sm leading-none mb-1`}>{test.clientName}</h4>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wide">{test.clientEmail}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`col-span-3 text-center py-12 ${theme.textMuted} italic bg-slate-900/20 rounded-3xl border border-dashed border-slate-700`}>
              No reviews yet. Be the first to share your experience!
            </div>
          )}
        </div>
      </div>

      {/* CTA Banner */}
      <div className={`relative overflow-hidden p-10 md:p-14 rounded-[2.5rem] bg-linear-to-br ${isDark ? 'from-emerald-950 via-[#0a101c] to-[#0ea5e9]/20 border-emerald-900/30' : 'from-emerald-50 via-white to-cyan-50 border-emerald-100'} border flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-2xl`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        <div className="space-y-4 max-w-2xl relative z-10">
          <h3 className={`text-3xl md:text-4xl font-black ${theme.textHeading} tracking-tight`}>Ready to build something amazing?</h3>
          <p className={`${theme.textMuted} text-base leading-relaxed`}>
            Partner with us to support open-source web ecosystems, lightweight templates, and secure digital platforms. Let's bring your vision to life.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab("booking")}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 px-8 rounded-2xl font-bold font-mono text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer transition-all hover:-translate-y-0.5"
          >
            Start a Project
          </button>
          <button
            onClick={() => setActiveTab("sponsorship")}
            className={`py-3.5 px-8 rounded-2xl font-bold font-mono text-sm border transition-all cursor-pointer ${
              isDark ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-800'
            }`}
          >
            Become a Partner
          </button>
        </div>
      </div>

    </div>
  );
}
