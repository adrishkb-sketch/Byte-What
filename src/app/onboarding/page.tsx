'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Calendar,
  Phone,
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  ArrowUpDown,
  Equal,
  Check,
} from 'lucide-react';
import { DOMAINS, DOMAIN_MAP } from '@/data/domains';
import { DomainId, StudentDomainRank } from '@/types';
import { DomainIcon } from '@/components/ui/DomainIcon';
import {
  getOrCreateAnonymousSessionId,
  saveStudentInfo,
  getStudentInfo,
} from '@/lib/session';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Ceramic Technology',
  'Other / Interdisciplinary',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function OnboardingPage() {
  const router = useRouter();

  // Step 1: Student Details
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [year, setYear] = useState(YEARS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Step state: 'details' -> 'choice' -> 'ranking' -> 'submitted'
  const [step, setStep] = useState<'details' | 'choice' | 'ranking' | 'submitted'>('details');

  // Chosen domains and their ranks
  // Map domainId to rank number (1-based, ties allowed)
  const [domainRanks, setDomainRanks] = useState<Record<DomainId, number>>({} as any);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const existing = getStudentInfo();
    if (existing) {
      setName(existing.name || '');
      if (existing.department) setDepartment(existing.department);
      if (existing.year) setYear(existing.year);
      setPhoneNumber(existing.phoneNumber || '');
    }
  }, []);

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) {
      setErrorMsg('Please enter your full name and phone number.');
      return;
    }

    setErrorMsg('');
    saveStudentInfo({
      name: name.trim(),
      department,
      year,
      phoneNumber: phoneNumber.trim(),
    });

    setStep('choice');
  }

  function handleChooseQuestionnaire() {
    saveStudentInfo({
      name: name.trim(),
      department,
      year,
      phoneNumber: phoneNumber.trim(),
      pathChosen: 'questionnaire',
    });
    router.push('/discover/questionnaire');
  }

  function handleChooseSelfSelection() {
    setStep('ranking');
  }

  function toggleDomainSelection(domainId: DomainId) {
    setDomainRanks((prev) => {
      const copy = { ...prev };
      if (copy[domainId] !== undefined) {
        delete copy[domainId];
      } else {
        // Find current max rank
        const existingValues = Object.values(copy);
        const nextRank = existingValues.length > 0 ? Math.max(...existingValues) + 1 : 1;
        copy[domainId] = nextRank;
      }
      return copy;
    });
  }

  function updateRank(domainId: DomainId, newRank: number) {
    const validRank = Math.max(1, Math.min(20, newRank));
    setDomainRanks((prev) => ({
      ...prev,
      [domainId]: validRank,
    }));
  }

  function tieWithDomain(domainId: DomainId, targetDomainId: DomainId) {
    const targetRank = domainRanks[targetDomainId];
    if (targetRank !== undefined) {
      updateRank(domainId, targetRank);
    }
  }

  const selectedDomainIds = Object.keys(domainRanks) as DomainId[];

  // Sort selected domains for preview by rank ascending
  const sortedSelected = [...selectedDomainIds].sort((a, b) => {
    return (domainRanks[a] || 99) - (domainRanks[b] || 99);
  });

  async function handleFinalSubmit() {
    if (selectedDomainIds.length === 0) {
      setErrorMsg('Please select at least 1 technology domain.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const rankingsPayload: StudentDomainRank[] = selectedDomainIds.map((domId) => ({
        domainId: domId,
        rank: domainRanks[domId],
      }));

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          department,
          year,
          phoneNumber: phoneNumber.trim(),
          pathChosen: 'self_selected',
          rankings: rankingsPayload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStep('submitted');
      } else {
        setErrorMsg(json.error || 'Failed to submit rankings.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error saving your submission. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 flex-1 flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {/* STEP 1: Student Details */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel p-6 sm:p-10 rounded-3xl"
          >
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent-violet flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
                <Sparkles className="w-6 h-6 text-cyan-300" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Registration</h1>
              <p className="text-xs text-text-secondary mt-1">
                Government College of Engineering and Ceramic Technology (GCECT)
              </p>
            </div>

            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Department *</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent-violet" />
                  <span>Year of Study *</span>
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                >
                  {YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-accent-emerald" />
                  <span>Phone Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] text-text-muted mt-1 block">
                  Protected by password encryption in the community directory.
                </span>
              </div>

              {errorMsg && (
                <p className="text-xs text-accent-rose bg-accent-rose/10 p-2.5 rounded-lg border border-accent-rose/20">
                  {errorMsg}
                </p>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/25"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 2: Choice between Direct Selection & Questionnaire */}
        {step === 'choice' && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel p-6 sm:p-10 rounded-3xl text-center"
          >
            <div className="mb-8">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 2 of 2</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                How would you like to set your interests, {name.split(' ')[0]}?
              </h2>
              <p className="text-xs text-text-secondary mt-2 max-w-md mx-auto">
                You can directly choose and prioritize your domains from the 20 categories, or take our adaptive questionnaire.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Option 1: Direct Selection with Ranking & Ties */}
              <button
                onClick={handleChooseSelfSelection}
                className="glass-card p-6 rounded-2xl text-left border border-white/[0.08] hover:border-primary/50 transition-all group flex flex-col justify-between hover:bg-white/[0.04]"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-accent-cyan/15 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary-light transition-colors">
                    I Already Know My Interests
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Choose from the 20 technology domains, rank them in priority order, and tie domains for the same rank if you like.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-accent-cyan">
                  <span>Select & Rank Domains</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 2: Adaptive Questionnaire */}
              <button
                onClick={handleChooseQuestionnaire}
                className="glass-card p-6 rounded-2xl text-left border border-white/[0.08] hover:border-accent-violet/50 transition-all group flex flex-col justify-between hover:bg-white/[0.04]"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-accent-violet/15 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Compass className="w-5 h-5 text-accent-violet" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-accent-violet transition-colors">
                    I&apos;m Not Sure Where to Start
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Take our smart adaptive questionnaire (12–20 questions). You will review and re-order the ranked domains before final submission.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-accent-violet">
                  <span>Launch Questionnaire</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep('details')}
              className="text-xs text-text-muted hover:text-white transition-colors"
            >
              ← Edit personal details
            </button>
          </motion.div>
        )}

        {/* STEP 3: Select from the 20 Domains, Rank Priority, and Tie */}
        {step === 'ranking' && (
          <motion.div
            key="ranking"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel p-6 sm:p-10 rounded-3xl"
          >
            <div className="mb-6">
              <span className="text-xs font-bold text-accent-cyan uppercase tracking-wider">Priority Ranking</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">Select & Rank Your Technology Domains</h2>
              <p className="text-xs text-text-secondary mt-1">
                Choose any domains from the 20 categories. Set their priority rank (Rank 1 is highest). You can tie multiple domains for the same rank!
              </p>
            </div>

            {/* 20 Domains Selection Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Choose from the 20 Domains ({selectedDomainIds.length} selected):</span>
                <span className="text-[11px] text-text-muted">Click to select/unselect</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 border border-white/[0.06] p-2 rounded-2xl bg-[#080D18]/50">
                {DOMAINS.map((domain) => {
                  const isSelected = domainRanks[domain.id] !== undefined;
                  const rank = domainRanks[domain.id];
                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => toggleDomainSelection(domain.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-primary/20 border-primary text-white'
                          : 'bg-white/[0.02] border-white/[0.05] text-text-secondary hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${domain.color}25`, color: domain.color }}
                        >
                          <DomainIcon name={domain.iconName} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-medium truncate">{domain.name}</span>
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-md bg-primary text-white font-mono text-[10px] font-bold flex-shrink-0 ml-2">
                          Rank {rank}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Configured Rankings & Priority Ordering */}
            {selectedDomainIds.length > 0 && (
              <div className="mb-6 bg-[#0B1220] p-4 rounded-2xl border border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Your Configured Priorities & Ties</span>
                  </h3>
                  <span className="text-[10px] text-text-muted">Change rank number to reorder or tie</span>
                </div>

                <div className="space-y-2.5">
                  {sortedSelected.map((domId) => {
                    const domain = DOMAIN_MAP.get(domId);
                    const currentRank = domainRanks[domId];
                    // Check if tied with any other domain
                    const isTied = selectedDomainIds.some((otherId) => otherId !== domId && domainRanks[otherId] === currentRank);

                    return (
                      <div
                        key={domId}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${domain?.color}20`, color: domain?.color }}
                          >
                            {domain && <DomainIcon name={domain.iconName} className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{domain?.name}</h4>
                            <span className="text-[10px] text-text-muted">{domain?.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 justify-end flex-shrink-0">
                          {isTied && (
                            <span className="text-[10px] font-semibold text-accent-amber px-2 py-0.5 rounded bg-accent-amber/10 border border-accent-amber/30 flex items-center gap-1">
                              <Equal className="w-3 h-3" />
                              <span>Tied Rank</span>
                            </span>
                          )}

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-text-muted font-medium">Rank:</span>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={currentRank}
                              onChange={(e) => updateRank(domId, parseInt(e.target.value) || 1)}
                              className="w-14 bg-[#080D18] border border-white/[0.15] rounded-lg px-2 py-1 text-xs text-center text-white font-mono font-bold focus:outline-none focus:border-primary"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleDomainSelection(domId)}
                            className="text-[11px] text-accent-rose hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-accent-rose bg-accent-rose/10 p-2.5 rounded-lg border border-accent-rose/20 mb-4">
                {errorMsg}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="text-xs text-text-muted hover:text-white"
              >
                ← Back
              </button>

              <button
                type="button"
                disabled={submitting || selectedDomainIds.length === 0}
                onClick={handleFinalSubmit}
                className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 transition-all text-xs disabled:opacity-40 shadow-lg shadow-primary/25"
              >
                {submitting ? 'Submitting...' : 'Submit & View Analytics'}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Submitted Successfully */}
        {step === 'submitted' && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 sm:p-12 rounded-3xl text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent-emerald/20 border border-accent-emerald/30 flex items-center justify-center mx-auto mb-4 text-accent-emerald">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Interests Successfully Registered!</h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto mb-6 leading-relaxed">
              Your details and prioritized domains have been recorded. You can now view where you and your peers stand on the college interest map.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/analytics')}
                className="px-8 py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover transition-all text-sm shadow-lg shadow-primary/25 flex items-center gap-2"
              >
                <span>View Analytics & Student Submissions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
