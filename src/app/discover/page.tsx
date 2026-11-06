import React from 'react';
import Link from 'next/link';
import { Sparkles, Layers, Cpu, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';

export default function DiscoverOverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary-light mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Interest Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Find Your True Calling in Technology
        </h1>
        <p className="mt-4 text-base text-text-secondary leading-relaxed">
          Engineered specifically for GCECT engineering students to navigate computer science, ceramic technology data workflows, information technology, electronics, and creative disciplines.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/discover/questionnaire"
            className="px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 shadow-lg shadow-primary/25 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-cyan-300" />
            <span>Start Questionnaire</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="glass-card p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mb-4">
            <Layers className="w-5 h-5 text-accent-cyan" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">200 Question Taxonomy</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            20 universal exploratory questions plus 180 domain-specific probes covering every facet of modern engineering.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5 text-primary-light" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Adaptive 12–20 Selection</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            You don&apos;t have to answer 200 questions. The adaptive engine zeroes in on your strengths within 12 to 20 targeted questions.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5 text-accent-emerald" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Private & Anonymous</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            No student roll numbers, emails, passwords, or phone numbers. Saved securely to your browser session.
          </p>
        </div>
      </div>

      {/* Rules & Transparency */}
      <div className="glass-panel p-8 rounded-3xl border border-white/[0.08]">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <span>Understanding the Discovery Results</span>
        </h2>
        <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
          <p>
            <strong className="text-white">Interest Score vs. Confidence:</strong> The percentage you receive (0–100%) reflects the intensity of positive interest expressed in answered questions. Your Confidence score reflects how much evidence the engine gathered for that specific domain.
          </p>
          <p>
            <strong className="text-white">Exploratory Not Aptitude:</strong> This is a technology interest discovery platform, not an exam or career sentence. It maps where your intrinsic curiosity lies today so you can focus on projects you actually enjoy building.
          </p>
          <p>
            <strong className="text-white">Deterministic Scoring Integrity:</strong> AI never decides your score. Scores are calculated deterministically via transparent mathematical weights. Gemini only interprets your results to formulate project ideas and cross-domain advice.
          </p>
        </div>
      </div>
    </div>
  );
}
