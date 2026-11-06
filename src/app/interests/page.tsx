'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Compass, ArrowRight, Filter } from 'lucide-react';
import { DOMAINS } from '@/data/domains';
import { DomainCategory, DomainId } from '@/types';
import { DomainIcon } from '@/components/ui/DomainIcon';

const CATEGORIES: ('All' | DomainCategory)[] = [
  'All',
  'Core Software & Systems',
  'Data & Intelligence',
  'Hardware & Physical Computing',
  'Design & Creative',
  'Applied & Interdisciplinary',
];

export default function InterestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | DomainCategory>('All');
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name');

  const filteredDomains = useMemo(() => {
    return DOMAINS.filter((domain) => {
      const matchesSearch =
        domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        domain.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        domain.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        domain.exampleTechnologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || domain.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.category.localeCompare(b.category);
    });
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>Curriculum Taxonomy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore 20 Technology Domains
        </h1>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          Comprehensive roadmaps, technologies, example projects, and skills for modern engineering and GCECT interdisciplinary paths.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search domain, skill, or technology..."
            className="w-full bg-[#080D18] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end text-xs text-text-muted">
          <span>Sort by:</span>
          <button
            onClick={() => setSortBy('name')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'name' ? 'bg-primary/20 text-primary-light border border-primary/30' : 'hover:text-white'
            }`}
          >
            Alphabetical
          </button>
          <button
            onClick={() => setSortBy('category')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'category' ? 'bg-primary/20 text-primary-light border border-primary/30' : 'hover:text-white'
            }`}
          >
            Category
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white/[0.04] border border-white/[0.06] text-text-secondary hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Domains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDomains.map((domain) => (
          <div
            key={domain.id}
            className="glass-card p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
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

              <p className="text-xs text-text-secondary line-clamp-3 mb-4 leading-relaxed">
                {domain.description}
              </p>

              {/* Technologies */}
              <div className="mb-4">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-1.5">
                  Core Technologies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {domain.exampleTechnologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-text-muted border border-white/[0.04]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-text-muted">
                {domain.exampleProjects.length} Sample Projects
              </span>
              <Link
                href={`/interests/${domain.id}`}
                className="text-xs font-semibold text-primary hover:text-primary-light transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-200"
              >
                <span>Explore Domain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredDomains.length === 0 && (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Compass className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Matching Domains Found</h3>
          <p className="text-xs text-text-secondary mb-4">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
