import React from "react";
import { 
  Award, BookOpen, MapPin, Activity, TrendingUp, Terminal, Code2, 
  Cpu, Heart, Briefcase, Layers, ChevronRight, X, User, Users, Globe, Target
} from "lucide-react";

interface AboutProps {
  isDark: boolean;
  theme: any;
  setActiveTab: (tab: any) => void;
}

export default function About({ isDark, theme, setActiveTab }: AboutProps) {
  const skills = [
    { name: "Mobile App Development", level: 90, color: "bg-emerald-500" },
    { name: "Web Development", level: 88, color: "bg-cyan-500" },
    { name: "Software Engineering", level: 85, color: "bg-purple-500" },
    { name: "Backend Development", level: 82, color: "bg-amber-500" },
    { name: "UI/UX Design", level: 80, color: "bg-pink-500" },
    { name: "AI & Automation", level: 75, color: "bg-blue-500" }
  ];

  const milestones = [
    { date: "2020", title: "First exposure to computers during O-Level" },
    { date: "2022", title: "Began Android development after Form 4" },
    { date: "2022–2025", title: "Continued self-study and built personal projects" },
    { date: "2026", title: "Founded PanaDev Apps at university" },
    { date: "Future", title: "Expanding across Africa and building local platforms" }
  ];

  const values = [
    { name: "Innovation", desc: "We create modern and creative digital solutions.", icon: <Code2 className="w-4 h-4 text-purple-500"/> },
    { name: "Integrity", desc: "We work with honesty and transparency.", icon: <Heart className="w-4 h-4 text-rose-500"/> },
    { name: "Excellence", desc: "We deliver high-quality and reliable systems.", icon: <Award className="w-4 h-4 text-amber-500"/> },
    { name: "Client-First", desc: "We prioritize user needs and real results.", icon: <User className="w-4 h-4 text-cyan-500"/> },
    { name: "Transparency", desc: "We communicate openly at every stage.", icon: <Target className="w-4 h-4 text-emerald-500"/> }
  ];

  const teamRoles = [
    "Software Engineers",
    "Designers",
    "AI Specialists",
    "Project Managers",
    "Business Developers"
  ];

  return (
    <div className="space-y-16 py-4 animate-fade-in-up text-left">
      {/* Introduction Banner */}
      <div className="border-b border-slate-500/10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-555 bg-emerald-950/20 px-2.5 py-1 rounded inline-block uppercase border border-emerald-900/10 mb-2">
              EXECUTIVE SUMMARY
            </span>
            <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading} tracking-tight`}>
              About PanaDev Apps
            </h2>
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
        <div className="mt-6 space-y-4 max-w-3xl">
          <p className={`${theme.textMuted} text-sm leading-relaxed font-sans`}>
            PanaDev Apps is a growing Zimbabwean technology company focused on building modern, secure, and scalable digital solutions. We create software that helps businesses, organizations, and individuals work smarter through mobile apps, websites, AI systems, and custom software. Our goal is to develop high-quality digital products that close the technology gap between Africa and the rest of the world.
          </p>
          <p className={`${theme.textMuted} text-sm leading-relaxed font-sans`}>
            Founded in 2026 by Panashe Mudzimwa, PanaDev Apps represents a new generation of African innovators. We believe Africa has talented developers who deserve global recognition. Our mission is to build strong local technology solutions, uplift digital skills, and create opportunities for future engineers across Zimbabwe and Africa.
          </p>
        </div>
      </div>

      {/* About The Company & Founder Story */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* About Company */}
          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${theme.textHeading} flex items-center gap-2`}>
              <Globe className="w-5 h-5 text-[#0ea5e9]" />
              About The Company
            </h3>
            <p className={`${theme.textMuted} text-sm leading-relaxed font-sans`}>
              PanaDev Apps was created to solve real challenges faced by African developers and businesses. In Zimbabwe, developers often struggle with limited resources, platform restrictions, and access barriers to global APIs and hosting services. PanaDev Apps aims to change this by building home-grown digital solutions and creating tools that allow African developers to innovate freely.
            </p>
            <p className={`${theme.textMuted} text-sm leading-relaxed font-sans font-medium`}>
              We develop systems that are clean, fast, secure, and easy to use — designed for African needs but built to global standards.
            </p>
          </div>

          {/* Founder Story */}
          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${theme.textHeading} flex items-center gap-2`}>
              <Terminal className="w-5 h-5 text-emerald-500" />
              Founder Story
            </h3>
            <div className={`p-6 rounded-2xl border ${theme.cardInner} space-y-4 font-sans text-sm leading-relaxed ${theme.textMuted}`}>
              <p>
                My name is Panashe Mudzimwa, and I was born in Chipinge, Manicaland Province, Zimbabwe. My passion for technology started early. In 2020, while I was still in O-Level, I first interacted with computers and immediately became interested in how software works. After completing Form 4 in 2022, I began teaching myself Android development.
              </p>
              <p>
                My journey was not easy. I had limited resources, an unreliable computer, and no one to guide me. I learned through online lessons, practice, and rebuilding projects many times. Some projects failed six or seven times before working properly. But every failure taught me something. <strong className="text-emerald-500 font-semibold">I learned to never give up — you can change your methods, but never your goals.</strong>
              </p>
              <p>
                Between 2022 and 2025, I continued studying computer science, software engineering, and programming through school and self-learning. I built small projects and stored them locally and on GitHub while sharpening my skills.
              </p>
              <p>
                In 2026, while studying at university, I founded PanaDev Apps. My dream is to build one of Africa's biggest software development companies — a company that creates opportunities, builds local solutions, and competes globally.
              </p>
              <p>
                Zimbabwe faces challenges such as sanctions and limited access to international platforms. Many APIs, tools, and resources require registration in foreign regions. I want to build local platforms, local resources, and local technology that Africans can rely on. I want to bridge the technology gap and show that Zimbabwean developers are talented, skilled, and ready to lead.
              </p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'} italic border-l-2 border-emerald-500 pl-4 py-1`}>
                "My long-term vision is for Zimbabwe to create software that is recognized worldwide — systems that people can proudly say were 'built in Zimbabwe.' I want to create jobs for software engineers, help Africa stay updated with global technology, and prove that African innovation is powerful."
              </p>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 h-full space-y-8">
          
          {/* Profile Card */}
          <div className={`rounded-2xl border ${theme.cardInner} p-6 space-y-6 text-sm text-left`}>
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-emerald-500 block uppercase font-bold tracking-wider">Managing Director</span>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black font-mono flex items-center justify-center text-lg shadow-lg">
                  PM
                </div>
                <div>
                  <h4 className={`font-bold ${theme.textHeading} text-base leading-none mb-1`}>Panashe Mudzimwa</h4>
                  <p className="text-xs text-slate-500 font-sans">Founder & Software Engineer</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-sans text-xs pt-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Chipinge / Harare, Zimbabwe</span>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className={`rounded-2xl border ${theme.cardInner} p-6 space-y-5 text-sm text-left`}>
            <span className="text-[10px] font-mono text-cyan-500 block uppercase font-bold tracking-wider mb-2">Core Values</span>
            <div className="space-y-4">
              {values.map((v, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`p-1.5 rounded-lg bg-slate-900/40 border border-slate-700 mt-0.5`}>
                    {v.icon}
                  </div>
                  <div>
                    <h5 className={`${theme.textHeading} font-bold text-sm`}>{v.name}</h5>
                    <p className={`${theme.textMuted} text-xs mt-0.5`}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Skills progress Bars */}
      <div className="space-y-8 pt-8 border-t border-slate-500/10">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-500 bg-cyan-950/20 px-2.5 py-1 rounded inline-block uppercase border border-cyan-900/10">
            OUR EXPERTISE
          </span>
          <h3 className={`text-xl md:text-2xl font-extrabold ${theme.textHeading} mt-2 tracking-tight`}>
            Engineering Skills
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill, idx) => (
            <div key={idx} className="space-y-2 text-left font-sans">
              <div className="flex justify-between items-center text-sm">
                <span className={`${theme.textHeading} font-bold`}>{skill.name}</span>
                <span className="text-emerald-500 font-mono font-bold text-xs">{skill.level}%</span>
              </div>
              <div className={`h-2.5 rounded-full w-full ${isDark ? 'bg-slate-900' : 'bg-slate-200'} overflow-hidden relative shadow-inner`}>
                <div 
                  className={`h-full ${skill.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline & Team Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-slate-500/10">
        
        {/* Timeline */}
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-950/20 px-2.5 py-1 rounded inline-block uppercase border border-amber-900/10">
              OUR ROADMAP
            </span>
            <h3 className={`text-xl font-extrabold ${theme.textHeading} mt-2 tracking-tight`}>
              Journey Timeline
            </h3>
          </div>

          <div className="relative border-l-2 border-emerald-500/30 ml-3 space-y-8 text-left pl-6 pb-2">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute -left-8 top-1 w-4 h-4 rounded-full border-2 ${
                  isDark ? 'bg-[#090e1a] border-emerald-500' : 'bg-white border-emerald-500'
                } group-hover:bg-emerald-500 transition-colors z-10`} />
                
                <div className="space-y-1 transform transition group-hover:translate-x-1">
                  <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded shadow-sm">
                    {m.date}
                  </span>
                  <h4 className={`text-sm font-bold ${theme.textHeading} mt-2`}>
                    {m.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Placeholder */}
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-mono font-bold text-purple-500 bg-purple-950/20 px-2.5 py-1 rounded inline-block uppercase border border-purple-900/10">
              GROWTH PLAN
            </span>
            <h3 className={`text-xl font-extrabold ${theme.textHeading} mt-2 tracking-tight`}>
              Future Team Expansion
            </h3>
          </div>

          <div className={`p-8 rounded-3xl border ${isDark ? 'bg-gradient-to-br from-slate-900 to-[#0a101c] border-slate-800' : 'bg-gradient-to-br from-slate-50 to-indigo-50/50 border-slate-200'} shadow-lg`}>
            <p className={`${theme.textMuted} text-sm leading-relaxed mb-6 font-sans`}>
              Our team is growing. In the future, PanaDev Apps will expand to include talented professionals from across the continent. We are building a company that supports young African talent.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamRoles.map((role, i) => (
                <div key={i} className={`flex items-center gap-2 p-3 rounded-xl border ${theme.cardInner} hover:border-emerald-500/50 transition-colors`}>
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className={`text-sm font-semibold ${theme.textHeading}`}>{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
