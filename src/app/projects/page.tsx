'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Project, DomainId } from '@/types';
import { DOMAINS, DOMAIN_MAP } from '@/data/domains';
import { DomainIcon } from '@/components/ui/DomainIcon';
import { getOrCreateAnonymousSessionId } from '@/lib/session';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [domainFilter, setDomainFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // New project modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [creatorPseudonym, setCreatorPseudonym] = useState<string>('');
  const [selectedDomains, setSelectedDomains] = useState<DomainId[]>(['software_web']);
  const [skills, setSkills] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [teamRequirements, setTeamRequirements] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        let url = '/api/projects?';
        if (domainFilter !== 'All') url += `domain=${domainFilter}&`;
        if (difficultyFilter !== 'All') url += `difficulty=${difficultyFilter}&`;
        if (statusFilter !== 'All') url += `status=${statusFilter}&`;

        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          setProjects(json.data);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [domainFilter, difficultyFilter, statusFilter]);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !creatorPseudonym.trim()) return;

    setCreating(true);
    try {
      const sessionId = getOrCreateAnonymousSessionId();
      const skillsList = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          creatorPseudonym: creatorPseudonym.trim(),
          creatorSessionId: sessionId,
          domains: selectedDomains,
          skillRequirements: skillsList,
          difficulty,
          status: 'Open',
          teamRequirements: teamRequirements.trim() || 'Seeking enthusiastic student collaborators',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to post project:', err);
    } finally {
      setCreating(false);
    }
  }

  const filteredProjects = projects.filter((p) => {
    return (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skillRequirements.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan mb-3">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Collegiate Innovation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            GCECT Project Showcase & Collaboration Board
          </h1>
          <p className="mt-2 text-sm text-text-secondary max-w-2xl leading-relaxed">
            Discover active engineering projects initiated by students across departments. Find teams looking for your specific skills, or publish your own project idea.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-accent-cyan hover:from-primary-hover hover:to-accent-cyan/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Project</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or skills..."
            className="w-full bg-[#080D18] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs">
          {/* Domain */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Domain:</span>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="bg-[#080D18] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="All">All Domains</option>
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-[#080D18] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="All">All</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#080D18] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-xs text-text-muted">Fetching student projects...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div key={proj.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      proj.difficulty === 'Beginner'
                        ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30'
                        : proj.difficulty === 'Intermediate'
                        ? 'bg-primary/10 text-primary-light border border-primary/30'
                        : 'bg-accent-violet/10 text-accent-violet border border-accent-violet/30'
                    }`}
                  >
                    {proj.difficulty}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      proj.status === 'Open'
                        ? 'bg-accent-cyan/10 text-accent-cyan'
                        : proj.status === 'In Progress'
                        ? 'bg-accent-amber/10 text-accent-amber'
                        : 'bg-text-muted/10 text-text-muted'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{proj.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-3">
                  {proj.description}
                </p>

                {/* Domains */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {proj.domains.map((domId) => {
                      const d = DOMAIN_MAP.get(domId);
                      return (
                        <span
                          key={domId}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-primary/15 text-primary-light border border-primary/20"
                        >
                          {d?.name || domId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Team Needs */}
                <div className="mb-4 bg-[#080D18]/70 p-3 rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">
                    Team Requirements:
                  </span>
                  <p className="text-[11px] text-text-secondary leading-normal">{proj.teamRequirements}</p>
                </div>

                {/* Skills */}
                {proj.skillRequirements.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {proj.skillRequirements.map((sk) => (
                      <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-text-muted">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-text-muted">
                <span>By {proj.creatorPseudonym}</span>
                <span className="text-primary-light font-medium">Public Showcase</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto">
          <FolderGit2 className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-2">No Projects Match Criteria</h3>
          <p className="text-xs text-text-secondary mb-6 leading-relaxed">
            Try adjusting your search query or post a new collaborative project.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover"
          >
            Post a Project
          </button>
        </div>
      )}

      {/* Post Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">Post a Student Project</h3>
            <p className="text-xs text-text-secondary mb-6">
              Recruit peers for GCECT hackathons, capstones, or open-source campus initiatives.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Campus Resource Tracker"
                  className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                  maxLength={90}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">
                  Project Description *
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem, goals, and architecture of the project..."
                  className="w-full h-24 bg-[#080D18] border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary resize-none"
                  maxLength={900}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Creator Pseudonym *
                  </label>
                  <input
                    type="text"
                    required
                    value={creatorPseudonym}
                    onChange={(e) => setCreatorPseudonym(e.target.value)}
                    placeholder="e.g. AlgoKnight, TechRaven"
                    className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">
                  Primary Domain *
                </label>
                <select
                  value={selectedDomains[0]}
                  onChange={(e) => setSelectedDomains([e.target.value as DomainId])}
                  className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  {DOMAINS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">
                  Skill Requirements (Comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Next.js, PostgreSQL, Docker, Figma"
                  className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">
                  Team Requirements & Roles
                </label>
                <input
                  type="text"
                  value={teamRequirements}
                  onChange={(e) => setTeamRequirements(e.target.value)}
                  placeholder="e.g. Looking for 1 frontend developer and 1 ML researcher."
                  className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
                  <span>Public listing without contact leakage</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-40"
                  >
                    {creating ? 'Publishing...' : 'Publish Project'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
