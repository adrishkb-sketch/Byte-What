import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  BookOpen,
  Code2,
  FolderGit2,
  Layers,
  Users,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { DOMAIN_MAP, DOMAINS } from '@/data/domains';
import { DomainId } from '@/types';
import { DomainIcon } from '@/components/ui/DomainIcon';
import { COMPLEMENTARITY_MATRIX } from '@/data/complementarity-matrix';

interface PageProps {
  params: {
    domain: string;
  };
}

export function generateStaticParams() {
  return DOMAINS.map((d) => ({ domain: d.id }));
}

export default function DomainDetailPage({ params }: PageProps) {
  const domainId = params.domain as DomainId;
  const domain = DOMAIN_MAP.get(domainId);

  if (!domain) {
    notFound();
  }

  // Related domains with complementarity
  const relatedComplementarity = domain.relatedDomains.map((relId) => {
    const relDomain = DOMAIN_MAP.get(relId);
    const synergy = Math.round(
      ((COMPLEMENTARITY_MATRIX[domain.id]?.[relId] || COMPLEMENTARITY_MATRIX[relId]?.[domain.id] || 0.7) * 100)
    );
    return {
      domain: relDomain,
      synergy,
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Back button */}
      <Link
        href="/interests"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Domains</span>
      </Link>

      {/* Hero Header */}
      <div className="glass-panel p-8 rounded-3xl mb-12 relative overflow-hidden">
        <div
          className="absolute -top-10 -right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: domain.color }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ backgroundColor: `${domain.color}25`, color: domain.color }}
            >
              <DomainIcon name={domain.iconName} className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  {domain.category}
                </span>
                <span className="text-text-muted">•</span>
                <span className="text-[11px] font-mono text-primary-light">{domain.id}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {domain.name}
              </h1>
              <p className="mt-2 text-sm text-text-secondary max-w-2xl leading-relaxed">
                {domain.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/communities/${domain.id}`}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              <Layers className="w-4 h-4" />
              <span>Domain Community</span>
            </Link>
            <Link
              href={`/bytemates?domain=${domain.id}`}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-text-primary bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-text-muted" />
              <span>Find ByteMates</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Deep-Dive Overview & Technologies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-2xl">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Comprehensive Overview</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
            {domain.longDescription}
          </p>

          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
            Key Competencies & Skills
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {domain.skills.map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-text-secondary"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Box */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-accent-violet" />
              <span>Tools & Technologies</span>
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Standard industry toolchains and libraries associated with this domain:
            </p>
            <div className="flex flex-wrap gap-2">
              {domain.exampleTechnologies.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06] mt-6">
            <Link
              href="/discover/questionnaire"
              className="w-full block text-center py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-accent-violet shadow-md"
            >
              Test Your Affinity in this Domain
            </Link>
          </div>
        </div>
      </div>

      {/* Learning Roadmap */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-12">
        <div className="mb-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" />
            <span>Structured Learning Roadmap</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Recommended progression from freshman fundamentals to advanced production architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {domain.learningRoadmap.map((stage, idx) => (
            <div key={stage.stage} className="bg-[#080D18]/60 p-5 rounded-2xl border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-md bg-primary/20 text-primary-light font-mono text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <h3 className="text-sm font-bold text-white">{stage.stage}</h3>
              </div>
              <ul className="space-y-2 text-xs text-text-secondary">
                {stage.topics.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-primary-light mt-0.5">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Example Projects */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-accent-cyan" />
            <span>Example Engineering Projects</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Practical projects tailored to collegiate portfolios, hackathons, and research capstones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {domain.exampleProjects.map((proj) => (
            <div key={proj.title} className="glass-card p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-3 ${
                    proj.difficulty === 'Beginner'
                      ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30'
                      : proj.difficulty === 'Intermediate'
                      ? 'bg-primary/10 text-primary-light border border-primary/30'
                      : 'bg-accent-violet/10 text-accent-violet border border-accent-violet/30'
                  }`}
                >
                  {proj.difficulty}
                </span>
                <h3 className="text-sm font-bold text-white mb-2">{proj.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {proj.description}
                </p>
              </div>

              <Link
                href="/projects"
                className="text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1 pt-3 border-t border-white/[0.06]"
              >
                <span>Find Student Collaborators</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Related Domains with Complementarity */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-violet" />
          <span>Cross-Domain Synergies & Complementarity</span>
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Domains that naturally intersect with {domain.name} to form powerful multidisciplinary projects.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedComplementarity.map((rel) => {
            if (!rel.domain) return null;
            return (
              <Link
                key={rel.domain.id}
                href={`/interests/${rel.domain.id}`}
                className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${rel.domain.color}20`, color: rel.domain.color }}
                  >
                    <DomainIcon name={rel.domain.iconName} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-primary-light transition-colors line-clamp-1">
                      {rel.domain.name}
                    </h4>
                    <span className="text-[10px] text-text-muted">{rel.domain.category}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-xs font-mono font-bold text-accent-cyan">{rel.synergy}%</span>
                  <span className="text-[9px] text-text-muted block">Synergy</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

