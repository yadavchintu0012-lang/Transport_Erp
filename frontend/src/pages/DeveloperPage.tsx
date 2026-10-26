import React, { useState } from 'react';
import { 
  Code2, 
  Cpu, 
  ShieldCheck, 
  Award, 
  GraduationCap, 
  Terminal, 
  Mail, 
  GitBranch, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  FileCode2, 
  Layers, 
  Database, 
  Workflow, 
  Truck, 
  FileText, 
  WifiOff, 
  Lock, 
  Globe2, 
  BrainCircuit, 
  Binary 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DeveloperPage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 p-4 md:p-8 space-y-8">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/80 border border-blue-500/30 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Developer Photo */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
            <div className="relative w-44 h-56 md:w-56 md:h-72 rounded-2xl overflow-hidden bg-slate-950 border-2 border-white/20 shadow-2xl">
              <img 
                src="/developer-photo.jpg" 
                alt="Chintu Kumar - Developer & System Architect" 
                className="w-full h-full object-cover object-top filter brightness-105 contrast-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'developer-photo.jpg';
                }}
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-2 text-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Lead Architect
                </span>
              </div>
            </div>
          </div>

          {/* Core Info & Title */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <BrainCircuit size={14} className="text-blue-400" />
              Creator & Principal System Architect
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Chintu Kumar
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-300 text-sm font-medium">
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80 text-amber-300 font-semibold">
                <GraduationCap size={16} className="text-amber-400" />
                B.Tech in Artificial Intelligence & Data Science (AI & DS)
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80 text-slate-300">
                <Award size={16} className="text-indigo-400" />
                IIMT Group of Colleges (1994)
              </span>
            </div>

            <p className="text-slate-300/90 text-sm md:text-base leading-relaxed max-w-2xl pt-2">
              Full-Stack AI Software Engineer specializing in modern reactive web architectures, autonomous cloud microservices, and offline-first enterprise ERP solutions. Architected the complete <strong>TransportPro ERP</strong> ecosystem from database telemetry to intelligent logistics billing and real-time fleet operations.
            </p>

            {/* Quick Actions / Contact Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              <a 
                href="https://github.com/yadavchintu0012-lang" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all shadow-lg hover:shadow-blue-500/10"
              >
                <GitBranch size={15} />
                <span>GitHub Profile</span>
                <ExternalLink size={12} className="text-slate-400" />
              </a>

              <button 
                onClick={() => handleCopy('yadavchintu0012@gmail.com', 'email')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/40 transition-all cursor-pointer"
              >
                <Mail size={15} />
                <span>yadavchintu0012@gmail.com</span>
                {copied === 'email' ? <Check size={14} className="text-emerald-400" /> : <Copy size={13} className="text-blue-400" />}
              </button>

              <button 
                onClick={() => handleCopy('Chintu Kumar - B.Tech in AI & DS, Lead Architect TransportPro ERP', 'bio')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                <Terminal size={14} />
                <span>Copy Bio</span>
                {copied === 'bio' ? <Check size={14} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Legal Rights / Intellectual Property & Academic Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comprehensive All Rights Reserved Card */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  All Rights Reserved & Intellectual Property
                </h3>
                <p className="text-xs text-slate-400">Legal Ownership, Software Copyright & Commercial Rights</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              © 2024 - 2026
            </span>
          </div>

          <div className="space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Lock size={15} className="text-amber-400" />
                <span>Proprietary Rights & Authorship Declaration</span>
              </div>
              <p className="text-slate-400 text-xs leading-normal">
                All rights, title, and interest in and to the <strong>TransportPro ERP</strong> software, including its source code, relational schemas, algorithmic models, 3D Canvas visual simulators, offline-first sync engine, UI/UX designs, and documentation, are the sole and exclusive intellectual property of <strong>Chintu Kumar</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check size={14} className="text-blue-400" />
                  Copyright Protection
                </h4>
                <p className="text-[12px] text-slate-400">
                  Protected under the Copyright Act, 1957 (India) and international intellectual property treaties. Unauthorized copying, reverse engineering, decompilation, or redistribution is strictly prohibited.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-400" />
                  Commercial & Enterprise Use
                </h4>
                <p className="text-[12px] text-slate-400">
                  Commercial deployment is granted strictly to registered tenant organizations under valid SaaS subscriptions and explicit license agreements issued by the author.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/50 flex items-start gap-3">
              <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-200">
                <strong>Moral Rights of the Author:</strong> The author asserts the moral right to be identified as the creator and original developer of the TransportPro ERP system across all distributions, cloud instances, and mobile builds.
              </p>
            </div>
          </div>
        </div>

        {/* Education, Department & Credentials Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <GraduationCap size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Academic Credentials</h3>
                <p className="text-xs text-slate-400">Technical Foundation</p>
              </div>
            </div>

            <div className="space-y-4 pt-5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Degree Program</span>
                <p className="text-sm font-bold text-white">
                  Bachelor of Technology (B.Tech)
                </p>
                <p className="text-xs font-semibold text-blue-400">
                  Artificial Intelligence & Data Science (AI & DS)
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Institution & Legacy</span>
                <p className="text-sm font-semibold text-slate-200">
                  IIMT Group of Colleges
                </p>
                <p className="text-xs text-slate-400">
                  Estd. 1994 • Premier Engineering Institute
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Specialization Focus</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Neural Networks', 'Predictive Modeling', 'Data Pipelines', 'Deep Learning', 'Computer Vision'].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">System Status</span>
              <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Development & Continuous Updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Competencies & Architectural Innovations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: AI & Data Science */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 hover:border-blue-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BrainCircuit size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Artificial Intelligence & Data Science</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Integrating intelligent reasoning into operational software: telemetry parsing, predictive vehicle maintenance schedules, dynamic route distance estimations, and automated invoice charge calculations.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Python 3.11', 'Pandas & NumPy', 'Anomaly Detection', 'LLM Agentic Systems', 'Scikit-Learn'].map((tech) => (
              <span key={tech} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-950/60 text-blue-300 border border-blue-800/40">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Card 2: Full-Stack Enterprise Stack */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 hover:border-indigo-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Layers size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Full-Stack Cloud Architecture</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-concurrency cloud platform built on React 19, TypeScript, and FastAPI. Engineered with automated Docker containerization, RESTful microservices, and multi-tenant PostgreSQL partitioning.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['React 19', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Tailwind CSS', 'Vite'].map((tech) => (
              <span key={tech} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Card 3: Mobile & Offline Hybrid */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 hover:border-amber-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <WifiOff size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Offline-First & Mobile Engineering</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Engineered dual-layer synchronization engine allowing transport dispatchers to create trips, record fuel vouchers, and generate invoices in zero-connectivity areas with automatic cloud sync.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Capacitor Android', 'IndexedDB / SQLite', 'Conflict Resolution', 'PWA ServiceWorker', 'Background Sync'].map((tech) => (
              <span key={tech} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/40">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Signature Milestones in TransportPro ERP */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Workflow size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Architectural Milestones in TransportPro ERP</h3>
              <p className="text-xs text-slate-400">Custom systems engineered by Chintu Kumar</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-blue-400 font-bold text-xs flex items-center gap-1.5">
              <FileText size={15} />
              <span>Standard GTA Tax Invoice</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Strict 1-page A4 print layout, SAC 996511 compliant, RCM declarations, and automatic Indian Rupee words conversion.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
              <Truck size={15} />
              <span>Trip-Linked Operations</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Bi-directional dispatch linking: vehicles, drivers, expense vouchers, customers, and financial ledger consolidation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-indigo-400 font-bold text-xs flex items-center gap-1.5">
              <Cpu size={15} />
              <span>3D Interactive Graphics</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Custom Canvas 3D highway simulation and radar-dish offline screen providing dynamic visual feedback on state changes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
              <ShieldCheck size={15} />
              <span>Over-The-Air Update Engine</span>
            </div>
            <p className="text-[11px] text-slate-400">
              In-app notification system with version manifests, unread badge counters, and 1-click zero-downtime updates.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Rights & Verification Stamp */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-200">
            TransportPro Enterprise Cloud ERP Platform
          </p>
          <p className="text-[11px] text-slate-400">
            Conceived, Architected & Programmed by <strong>Chintu Kumar</strong> (B.Tech AI & DS). All Rights Reserved.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
            Build v2.4.6
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
            Verified Author
          </span>
        </div>
      </div>
    </div>
  );
};
