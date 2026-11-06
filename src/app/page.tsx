'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Compass,
  Users,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  FolderGit2,
  CheckCircle2,
} from 'lucide-react';
import { DOMAINS } from '@/data/domains';
import { DomainIcon } from '@/components/ui/DomainIcon';

export default function HomePage() {
  const featuredDomains = DOMAINS.slice(0, 6);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-white/[0.06]">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[350px] h-[250px] bg-accent-violet/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[200px] bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Institutional Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs text-text-secondary mb-8 shadow-inner"
          >
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            <span className="font-medium text-text-primary">Government College of Engineering and Ceramic Technology</span>
            <span className="text-text-muted">• GCECT Tech Discovery</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]"
          >
            Discover what areas of technology{' '}
            <span className="bg-gradient-to-r from-primary via-accent-violet to-accent-cyan bg-clip-text text-transparent">
              genuinely interest you.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            An adaptive questionnaire platform for GCECT students to discover technical passions, explore 20 modern disciplines, identify complementary teammates, and build real projects.
          </motion.p>

          {/* Core CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <Link
              href="/discover/questionnaire"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2.5 text-base group"
            >
              <Sparkles className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform" />
              <span>Tell What Interests You</span>
            </Link>

            <Link
              href="/interests"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-text-primary bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-all flex items-center justify-center gap-2 text-base"
            >
              <Compass className="w-5 h-5 text-text-muted" />
              <span>Explore Technology Interests</span>
            </Link>
          </motion.div>

          {/* Key Assurance Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-emerald" />
              <span>Zero Registration or Login Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-primary" />
              <span>Deterministic Scoring Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-accent-violet" />
              <span>Adaptive 12–20 Question Selection</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How Discovery Works */}
      <section className="py-20 bg-[#0B1220]/60 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-primary mb-2">Scientific Methodology</h2>
            <p className="text-3xl font-extrabold text-white">How BYTE WHAT Discovers Your Path</p>
            <p className="mt-3 text-sm text-text-secondary">
              Unlike generic quizzes, BYTE WHAT pairs a fixed 200-question taxonomy with an adaptive selection algorithm and transparent deterministic scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Universal Profiling',
                desc: 'Universal questions probe your foundational problem-solving instincts, mathematical appetite, and work style.',
                icon: Compass,
              },
              {
                step: '02',
                title: 'Adaptive Branching',
                desc: 'The engine dynamically selects 12–20 targeted domain questions based on real-time information entropy.',
                icon: Layers,
              },
              {
                step: '03',
                title: 'Deterministic Scoring',
                desc: 'Normalized transparent mathematical weights calculate primary, secondary, and emerging domains. Never overridden by AI.',
                icon: Cpu,
              },
              {
                step: '04',
                title: 'AI Insights & ByteMates',
                desc: 'Google Gemini analyzes cross-domain synergies and suggests practical student projects and complementary peers.',
                icon: Sparkles,
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={card.step} className="glass-card p-6 rounded-2xl relative group">
                  <div className="text-3xl font-black text-white/[0.08] absolute top-4 right-4 font-mono group-hover:text-primary/20 transition-colors">
                    {card.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary-light" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Technology Domains */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-widest text-accent-cyan mb-2">Curriculum Breadth</h2>
              <p className="text-3xl font-extrabold text-white">20 Technology Domains</p>
              <p className="mt-2 text-sm text-text-secondary">
                From Core Systems and Ceramic Materials Analytics to Autonomous Robotics and Extended Reality.
              </p>
            </div>
            <Link
              href="/interests"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-light transition-colors"
            >
              <span>View all 20 domains</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDomains.map((domain) => (
              <Link
                key={domain.id}
                href={`/interests/${domain.id}`}
                className="glass-card p-6 rounded-2xl transition-all duration-300 group block relative"
              >
                <div className="flex items-center gap-3.5 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
                  >
                    <DomainIcon name={domain.iconName} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-primary-light transition-colors line-clamp-1">
                      {domain.name}
                    </h3>
                    <span className="text-[11px] text-text-muted">{domain.category}</span>
                  </div>
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                  {domain.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/[0.05]">
                  {domain.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-text-muted border border-white/[0.04]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ByteMates & Project Collaboration Spotlight */}
      <section className="py-20 bg-[#0B1220]/80 border-t border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-violet/10 border border-accent-violet/30 text-xs text-accent-violet mb-4">
                <Users className="w-3.5 h-3.5" />
                <span>Peer Discovery Without Authentication</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Connect with students who share or{' '}
                <span className="bg-gradient-to-r from-accent-cyan to-primary bg-clip-text text-transparent">
                  complement your skills.
                </span>
              </h2>
              <p className="mt-4 text-sm text-text-secondary leading-relaxed">
                Found your primary passion in Full-Stack Web, but need an IoT/Embedded programmer or a UI/UX designer for your next college hackathon or final year project?
              </p>
              <ul className="mt-6 space-y-3 text-xs text-text-secondary">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                  <span>Opt-in pseudonymous discovery — no emails or personal phone numbers disclosed.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                  <span>Complementarity score based on engineering synergy matrices.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                  <span>Public project board for recruiting student collaborators.</span>
                </li>
              </ul>
              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/bytemates"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Explore ByteMates</span>
                </Link>
                <Link
                  href="/projects"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-primary bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-colors flex items-center gap-2"
                >
                  <FolderGit2 className="w-4 h-4 text-text-muted" />
                  <span>View Projects</span>
                </Link>
              </div>
            </div>

            {/* Visual Preview Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-cyan to-primary flex items-center justify-center font-bold text-white text-sm">
                    CC
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">CeramicCoder</h4>
                    <span className="text-[11px] text-text-muted">GCECT CSE • Opted-in ByteMate</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">
                  92% Synergy Match
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block mb-1.5">
                    Primary Interests
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/20 text-primary-light border border-primary/30">
                      Software Engineering & Web
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-accent-violet/20 text-accent-violet border border-accent-violet/30">
                      Robotics & IoT
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block mb-1.5">
                    Seeking Complementary Skills
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed bg-[#080D18]/80 p-3 rounded-xl border border-white/[0.04]">
                    &ldquo;Building a solar-powered environmental telemetry rover for the college campus. Seeking a UI/UX designer and a WebXR frontend developer.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready CTA */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to discover what truly drives you in tech?
          </h2>
          <p className="text-sm text-text-secondary mb-8 max-w-xl mx-auto">
            Take approximately 5–7 minutes to answer our 12–20 adaptive questions. No signup, completely anonymous, grounded in engineering taxonomy.
          </p>
          <Link
            href="/discover/questionnaire"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 shadow-xl shadow-primary/25 transition-all"
          >
            <Sparkles className="w-5 h-5 text-cyan-300" />
            <span>Start Adaptive Questionnaire Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
