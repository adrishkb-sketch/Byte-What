import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, BookOpen, Users, FolderGit2 } from 'lucide-react';
import { DOMAINS } from '@/data/domains';
import { DomainIcon } from '@/components/ui/DomainIcon';

export default function CommunitiesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-violet/10 border border-accent-violet/20 text-xs text-accent-violet mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>Departmental & Cross-Discipline Guilds</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Domain Communities & Study Hubs
        </h1>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          Static informational hubs for each of our 20 engineering domains. Find curated learning roadmaps, discussion prompts, student project repositories, and technical resources.
        </p>
      </div>

      {/* Grid of 20 Communities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {DOMAINS.map((domain) => (
          <Link
            key={domain.id}
            href={`/communities/${domain.id}`}
            className="glass-card p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
          >
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
              >
                <DomainIcon name={domain.iconName} className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-primary-light transition-colors line-clamp-1 mb-1">
                {domain.name}
              </h3>
              <span className="text-[10px] text-text-muted block mb-2">{domain.category}</span>
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {domain.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.05] mt-4 flex items-center justify-between text-xs font-semibold text-primary">
              <span>View Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

