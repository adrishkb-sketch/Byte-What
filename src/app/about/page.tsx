import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ShieldCheck,
  Cpu,
  GraduationCap,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary-light mb-4">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>GCECT Technology Initiative</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          About BYTE WHAT
        </h1>
        <p className="mt-4 text-sm text-text-secondary leading-relaxed">
          The technology-interest discovery, student collaboration, and project-matching platform for Government College of Engineering and Ceramic Technology.
        </p>
      </div>

      {/* Origin & Core Philosophy */}
      <div className="glass-panel p-8 rounded-3xl mb-10">
        <h2 className="text-lg font-bold text-white mb-3">Origin & Purpose</h2>
        <div className="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
          <p>
            Government College of Engineering and Ceramic Technology (GCECT) has a distinguished history of engineering excellence across Computer Science, Information Technology, and Ceramic Technology. However, modern engineering has evolved into complex cross-disciplinary domains—where materials science converges with machine learning, where web systems interact with IoT telemetry, and where cybersecurity underpins financial ledgers.
          </p>
          <p>
            <strong className="text-white">BYTE WHAT</strong> was created not as another generic college portal, but as a dedicated instrument for genuine discovery. It helps students identify what areas of technology genuinely excite them, understand their conceptual strengths, explore adjacent domains, and team up with peers on tangible open projects.
          </p>
        </div>
      </div>

      {/* Fundamental Product Guarantees */}
      <div className="glass-panel p-8 rounded-3xl mb-10 border border-accent-emerald/20">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent-emerald" />
          <span>Mandatory Product & Privacy Guarantees</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-text-secondary">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Zero Authentication</span>
            </h4>
            <p className="leading-normal">
              No signups, passwords, or accounts. Anyone visiting can explore all pages and submit questionnaires freely.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Strictly Anonymous Data</span>
            </h4>
            <p className="leading-normal">
              We never ask for your real name, email address, roll number, or phone number. Sessions use browser-generated UUIDs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>Deterministic Scoring</span>
            </h4>
            <p className="leading-normal">
              Scores are calculated via reproducible mathematical weights. Gemini AI never overrides deterministic scores.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-accent-violet" />
              <span>Fixed 200 Questions</span>
            </h4>
            <p className="leading-normal">
              The engine selects strictly from a curated 200-question taxonomy. Questions are never hallucinated by AI.
            </p>
          </div>
        </div>
      </div>

      {/* The 5 Key Questions */}
      <div className="glass-panel p-8 rounded-3xl mb-12">
        <h2 className="text-lg font-bold text-white mb-4">The Five Questions BYTE WHAT Answers</h2>
        <ul className="space-y-3 text-xs sm:text-sm text-text-secondary">
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </span>
            <span><strong className="text-white">What areas of technology genuinely interest you?</strong> Unveiled through 12–20 adaptive questions.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </span>
            <span><strong className="text-white">Which related domains should you explore?</strong> Grounded in our manually defined complementarity matrix.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </span>
            <span><strong className="text-white">What are the most popular interests across GCECT?</strong> Real-time public analytics map.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              4
            </span>
            <span><strong className="text-white">Which students have complementary interests?</strong> Opt-in ByteMates discovery.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              5
            </span>
            <span><strong className="text-white">What projects can you build right now?</strong> Cross-domain collegiate project showcase.</span>
          </li>
        </ul>
      </div>

      {/* Action CTA */}
      <div className="text-center">
        <Link
          href="/discover/questionnaire"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 shadow-lg shadow-primary/25 transition-all text-sm"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>Start Your Discovery Questionnaire</span>
        </Link>
      </div>
    </div>
  );
}

