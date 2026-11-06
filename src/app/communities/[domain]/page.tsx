import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Layers,
  ArrowLeft,
  BookOpen,
  MessageCircle,
  Lightbulb,
  Users,
  FolderGit2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { DOMAIN_MAP, DOMAINS } from '@/data/domains';
import { DomainId } from '@/types';
import { DomainIcon } from '@/components/ui/DomainIcon';

interface PageProps {
  params: {
    domain: string;
  };
}

export function generateStaticParams() {
  return DOMAINS.map((d) => ({ domain: d.id }));
}

export default function CommunityDetailPage({ params }: PageProps) {
  const domainId = params.domain as DomainId;
  const domain = DOMAIN_MAP.get(domainId);

  if (!domain) {
    notFound();
  }

  const discussionPrompts = [
    `How does ${domain.name} address performance bottlenecks under scale?`,
    `What are the most effective open-source libraries in ${domain.name} for collegiate projects?`,
    `How can GCECT students bridge theoretical coursework with industry implementations in ${domain.name}?`,
    `What are key security and ethical considerations specific to ${domain.name}?`,
  ];

  const learningResources = [
    { title: 'Official Documentation & Standards', type: 'Reference', desc: 'Authoritative specification and API guidelines.' },
    { title: 'Interactive Code Playground', type: 'Interactive', desc: 'Hands-on sandboxed exercises and tutorials.' },
    { title: 'Peer-Reviewed Research Repositories (arXiv)', type: 'Academic', desc: 'Pre-print research papers and benchmark datasets.' },
    { title: 'Open-Source Project Reference Architecture', type: 'Codebase', desc: 'Production-ready GitHub repositories illustrating best practices.' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Back button */}
      <Link
        href="/communities"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Communities</span>
      </Link>

      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl mb-10 relative overflow-hidden">
        <div
          className="absolute -top-10 -right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: domain.color }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${domain.color}25`, color: domain.color }}
            >
              <DomainIcon name={domain.iconName} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Community Study Hub
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {domain.name} Guild
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary max-w-xl">
                Collaborative resources, academic prompts, and technical roadmaps for students exploring {domain.name}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/bytemates?domain=${domain.id}`}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Domain ByteMates</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Static Discussion Prompts */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-10">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-accent-cyan" />
          <h2 className="text-base font-bold text-white">Technical Inquiry & Discussion Prompts</h2>
        </div>
        <p className="text-xs text-text-muted mb-6">
          Use these prompts during departmental study circles, lab seminars, and capstone brainstorming:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {discussionPrompts.map((prompt, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[10px] font-mono text-primary font-bold block mb-1">PROMPT 0{i + 1}</span>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">{prompt}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Resources */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-10">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-white">Curated Learning Resources</h2>
        </div>
        <p className="text-xs text-text-muted mb-6">
          High-yield technical documentation and open-source materials recommended for GCECT engineers:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {learningResources.map((res, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-accent-violet block mb-1">{res.type}</span>
                <h4 className="text-xs font-bold text-white mb-1">{res.title}</h4>
                <p className="text-[11px] text-text-secondary leading-normal">{res.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Projects */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl text-center">
        <Lightbulb className="w-8 h-8 text-accent-cyan mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Build Projects in {domain.name}</h3>
        <p className="text-xs text-text-secondary max-w-md mx-auto mb-6">
          Check out the GCECT project board to join an active team or publish your own repository.
        </p>
        <Link
          href={`/projects?domain=${domain.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover"
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Browse Domain Projects</span>
        </Link>
      </div>
    </div>
  );
}
