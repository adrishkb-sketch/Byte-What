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
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { DOMAINS } from '@/data/domains';
import { DomainId } from '@/types';
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

  // Step 1: Details
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [year, setYear] = useState(YEARS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Step 2: Path Selection ('details' -> 'choice' -> 'self_pick')
  const [step, setStep] = useState<'details' | 'choice' | 'self_pick'>('details');

  // If user chooses 'I already know my interests'
  const [selectedDomains, setSelectedDomains] = useState<DomainId[]>([]);
  const [skillsText, setSkillsText] = useState('');
  const [submittingDirect, setSubmittingDirect] = useState(false);
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

  // Handle Step 1 form submission
  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) {
      setErrorMsg('Please provide your name and phone number.');
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

  // Handle Choice: Questionnaire path
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

  // Handle Choice: Self Selection path
  function handleChooseSelfSelection() {
    setStep('self_pick');
  }

  // Toggle domain in self-pick
  function toggleDomain(id: DomainId) {
    if (selectedDomains.includes(id)) {
      setSelectedDomains(selectedDomains.filter((d) => d !== id));
    } else {
      if (selectedDomains.length < 5) {
        setSelectedDomains([...selectedDomains, id]);
      }
    }
  }

  // Submit self-selected interests
  async function handleDirectSubmit() {
    if (selectedDomains.length === 0) {
      setErrorMsg('Please select at least 1 technology domain that interests you.');
      return;
    }

    setSubmittingDirect(true);
    setErrorMsg('');

    try {
      const sessionId = getOrCreateAnonymousSessionId();
      const skillsArray = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Save student profile
      await fetch('/api/bytemates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymousSessionId: sessionId,
          displayName: name.trim(),
          bio: `${year} • ${department}`,
          discoverable: true,
          primaryDomains: selectedDomains,
          secondaryDomains: [],
          skills: skillsArray,
        }),
      });

      // Save dummy questionnaire result representation for results page
      const domainScoresList = DOMAINS.map((d) => ({
        domainId: d.id,
        domainName: d.name,
        interestScore: selectedDomains.includes(d.id) ? 95 : 30,
        confidenceScore: selectedDomains.includes(d.id) ? 90 : 20,
        evidenceCount: selectedDomains.includes(d.id) ? 3 : 0,
        classification: selectedDomains.includes(d.id) ? ('primary' as const) : ('low_evidence' as const),
      }));

      const top3 = selectedDomains.slice(0, 3).map((domId) => ({
        domainId: domId,
        domainName: DOMAINS.find((d) => d.id === domId)?.name || domId,
        interestScore: 95,
        confidenceScore: 90,
        evidenceCount: 3,
        classification: 'primary' as const,
      }));

      // Direct results summary
      const summaryPayload = {
        sessionId,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        questionsAnswered: selectedDomains.length,
        primaryInterests: top3,
        secondaryInterests: [],
        emergingInterests: [],
        lowEvidenceInterests: [],
        allDomainScores: domainScoresList,
        writtenExplanation: `You self-identified strong interests in ${top3.map((t) => t.domainName).join(', ')}. Your profile has been created and matched with fellow GCECT students in these fields.`,
      };

      // Call API to complete/save results
      await fetch('/api/questionnaire/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          optionalStudentNotes: `Self-selected: ${selectedDomains.join(', ')}`,
        }),
      });

      router.push(`/discover/results?sessionId=${sessionId}`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save interests. Please try again.');
      setSubmittingDirect(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20 flex-1 flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {/* STEP 1: Capture Student Details */}
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
              <p className="text-xs text-text-secondary mt-1.5">
                Government College of Engineering and Ceramic Technology (GCECT)
              </p>
            </div>

            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              {/* Name */}
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

              {/* Department */}
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

              {/* Year */}
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

              {/* Phone Number */}
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

        {/* STEP 2: Branch Option (Already Know vs Not Sure) */}
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
                How would you like to proceed, {name.split(' ')[0]}?
              </h2>
              <p className="text-xs text-text-secondary mt-2 max-w-md mx-auto">
                Choose whether you want to directly select your known interests or take our adaptive questionnaire to discover them.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Option 1: Already Know */}
              <button
                onClick={handleChooseSelfSelection}
                className="glass-card p-6 rounded-2xl text-left border border-white/[0.08] hover:border-primary/50 transition-all group flex flex-col justify-between hover:bg-white/[0.04]"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-accent-cyan/15 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary-light transition-colors">
                    I Already Know What Interests Me
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Select your favorite domains and skills directly from our catalog to build your profile immediately.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-accent-cyan">
                  <span>Pick Domains</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 2: Not Sure (Adaptive Questionnaire) */}
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
                    Take our smart adaptive questionnaire (12–20 questions) to discover your genuine technical interests and strengths.
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
              ← Edit your personal details
            </button>
          </motion.div>
        )}

        {/* STEP 3: Self-Pick Domains */}
        {step === 'self_pick' && (
          <motion.div
            key="self_pick"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel p-6 sm:p-10 rounded-3xl"
          >
            <div className="mb-6">
              <span className="text-xs font-bold text-accent-cyan uppercase tracking-wider">Select Interests</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">Pick Up to 5 Domains</h2>
              <p className="text-xs text-text-secondary mt-1">
                Select the areas of engineering and computing that best reflect your technical passions:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1 mb-6">
              {DOMAINS.map((domain) => {
                const isSelected = selectedDomains.includes(domain.id);
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => toggleDomain(domain.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-text-secondary hover:bg-white/[0.05]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${domain.color}25`, color: domain.color }}
                    >
                      <DomainIcon name={domain.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{domain.name}</h4>
                      <span className="text-[10px] text-text-muted">{domain.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional Skills */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-text-primary block mb-1">
                Optional: Specific Skills or Technologies
              </label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="e.g. React, C++, Python, Arduino, ROS"
                className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
              />
            </div>

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
                disabled={submittingDirect || selectedDomains.length === 0}
                onClick={handleDirectSubmit}
                className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 transition-all text-xs disabled:opacity-40 shadow-lg shadow-primary/25"
              >
                {submittingDirect ? 'Saving Interests...' : 'Complete & View Results'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
