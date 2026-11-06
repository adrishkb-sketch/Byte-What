'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  Plus,
  Loader2,
  CheckCircle2,
  Filter,
  UserPlus,
} from 'lucide-react';
import { StudentProfile, DomainId } from '@/types';
import { DOMAINS, DOMAIN_MAP } from '@/data/domains';
import { DomainIcon } from '@/components/ui/DomainIcon';
import { getOrCreateAnonymousSessionId } from '@/lib/session';

function ByteMatesContent() {
  const searchParams = useSearchParams();
  const domainQuery = searchParams.get('domain');

  const [profiles, setProfiles] = useState<(StudentProfile & { matchScore?: number })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDomain, setSelectedDomain] = useState<string>(domainQuery || 'All');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Opt-in modal state
  const [showOptInModal, setShowOptInModal] = useState<boolean>(false);
  const [pseudonym, setPseudonym] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [optInPrimaryDomains, setOptInPrimaryDomains] = useState<DomainId[]>(['software_web']);
  const [optInSkills, setOptInSkills] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadProfiles() {
      try {
        setLoading(true);
        const sessionId = getOrCreateAnonymousSessionId();
        const url = `/api/bytemates?sessionId=${sessionId}${
          selectedDomain !== 'All' ? `&domain=${selectedDomain}` : ''
        }`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          setProfiles(json.data);
        }
      } catch (err) {
        console.error('Failed to load ByteMates:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfiles();
  }, [selectedDomain]);

  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!pseudonym.trim() || optInPrimaryDomains.length === 0) return;

    setSavingProfile(true);
    try {
      const sessionId = getOrCreateAnonymousSessionId();
      const skillsArray = optInSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/bytemates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymousSessionId: sessionId,
          displayName: pseudonym.trim(),
          bio: bio.trim() || undefined,
          discoverable: true,
          primaryDomains: optInPrimaryDomains,
          secondaryDomains: [],
          skills: skillsArray,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          setShowOptInModal(false);
          setSaveSuccess(false);
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSavingProfile(false);
    }
  }

  const filtered = profiles.filter((p) => {
    const matchesKeyword =
      p.displayName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (p.bio && p.bio.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      p.skills.some((s) => s.toLowerCase().includes(searchKeyword.toLowerCase()));
    return matchesKeyword;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-violet/10 border border-accent-violet/20 text-xs text-accent-violet mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Opt-In Student Collaboration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ByteMates Peer Discovery
          </h1>
          <p className="mt-2 text-sm text-text-secondary max-w-2xl leading-relaxed">
            Discover fellow GCECT students with shared passions or complementary skills for hackathons, labs, and side projects. Zero logins or personal contact sharing.
          </p>
        </div>

        <button
          onClick={() => setShowOptInModal(true)}
          className="px-5 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Opt-In with Pseudonym</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search by pseudonym, skill, or bio..."
            className="w-full bg-[#080D18] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
          />
        </div>

        {/* Domain Filter Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto text-xs">
          <span className="text-text-muted flex-shrink-0">Filter Domain:</span>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-[#080D18] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
          >
            <option value="All">All Domains</option>
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-xs text-text-muted">Loading discoverable student profiles...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((mate) => (
            <div key={mate.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-accent-cyan/20 to-primary/20 border border-white/[0.08] flex items-center justify-center font-bold text-white text-sm">
                      {mate.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{mate.displayName}</h3>
                      <span className="text-[10px] text-text-muted font-mono">GCECT Peer</span>
                    </div>
                  </div>

                  {mate.matchScore && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">
                      {mate.matchScore}% Synergy
                    </span>
                  )}
                </div>

                {mate.bio && (
                  <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-3">
                    &ldquo;{mate.bio}&rdquo;
                  </p>
                )}

                {/* Primary Domains */}
                <div className="mb-4">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-1.5">
                    Primary Interests
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {mate.primaryDomains.map((domId) => {
                      const d = DOMAIN_MAP.get(domId);
                      return (
                        <span
                          key={domId}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-primary/15 text-primary-light border border-primary/25"
                        >
                          {d?.name || domId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Skills */}
                {mate.skills && mate.skills.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-1.5">
                      Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {mate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-text-muted border border-white/[0.04]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-text-muted">
                <span>Collaborator Match</span>
                <span className="text-accent-cyan font-medium">Public Pseudonym</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto">
          <Users className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-2">No Opted-In Profiles Yet</h3>
          <p className="text-xs text-text-secondary mb-6 leading-relaxed">
            Be the first GCECT student in this domain to opt into pseudonymous discovery.
          </p>
          <button
            onClick={() => setShowOptInModal(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover"
          >
            Create Your Pseudonymous Profile
          </button>
        </div>
      )}

      {/* Opt-In Profile Modal */}
      {showOptInModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full">
            <h3 className="text-lg font-bold text-white mb-1">Create Opt-In Discovery Profile</h3>
            <p className="text-xs text-text-secondary mb-6">
              Participate pseudonymously. Never provide personal emails, real names, or phone numbers.
            </p>

            {saveSuccess ? (
              <div className="py-8 text-center text-accent-emerald text-sm font-semibold flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                <span>Profile published to ByteMates!</span>
              </div>
            ) : (
              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Student Pseudonym (Nickname / Handle) *
                  </label>
                  <input
                    type="text"
                    required
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                    placeholder="e.g. CeramicHacker, AlgoWizard"
                    className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Primary Domain of Interest *
                  </label>
                  <select
                    value={optInPrimaryDomains[0]}
                    onChange={(e) => setOptInPrimaryDomains([e.target.value as DomainId])}
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
                    Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={optInSkills}
                    onChange={(e) => setOptInSkills(e.target.value)}
                    placeholder="e.g. TypeScript, React, Arduino, PyTorch"
                    className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">
                    Short Collaboration Bio / Goal
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. 2nd year IT student looking for an IoT teammate to enter the upcoming inter-college hackathon."
                    className="w-full h-20 bg-[#080D18] border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary resize-none"
                    maxLength={180}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
                    <span>Consent-based discovery</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOptInModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-40"
                    >
                      {savingProfile ? 'Publishing...' : 'Publish Profile'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ByteMatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-xs text-text-muted">Loading ByteMates...</p>
        </div>
      }
    >
      <ByteMatesContent />
    </Suspense>
  );
}
