'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart2,
  Users,
  Search,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Loader2,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Phone,
  Equal,
  ShieldCheck,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { DOMAINS, DOMAIN_MAP } from '@/data/domains';
import { DomainId, StudentSubmission } from '@/types';
import { DomainIcon } from '@/components/ui/DomainIcon';

const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Information Technology',
  'Ceramic Technology',
  'Other / Interdisciplinary',
];

const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function AnalyticsPage() {
  const [selectedDomainId, setSelectedDomainId] = useState<DomainId>('software_web');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [students, setStudents] = useState<(StudentSubmission & { targetDomainRank?: number })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Phone number unlocking state
  const [unlockedPhones, setUnlockedPhones] = useState<Record<string, boolean>>({});
  const [passwordModalStudentId, setPasswordModalStudentId] = useState<string | null>(null);
  const [enteredPassword, setEnteredPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // Fetch real submissions filtered by the selected category/filters
  useEffect(() => {
    async function fetchSubmissions() {
      try {
        setLoading(true);
        let url = `/api/submissions?domainId=${selectedDomainId}`;
        if (selectedDepartment !== 'All') url += `&department=${encodeURIComponent(selectedDepartment)}`;
        if (selectedYear !== 'All') url += `&year=${encodeURIComponent(selectedYear)}`;
        if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          setStudents(json.data || []);
        }
      } catch (err) {
        console.error('Failed to load submissions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, [selectedDomainId, selectedDepartment, selectedYear, searchQuery]);

  function handleEyeClick(studentId: string) {
    if (unlockedPhones[studentId]) {
      // Toggle off if already revealed
      setUnlockedPhones((prev) => ({ ...prev, [studentId]: false }));
    } else {
      setPasswordModalStudentId(studentId);
      setEnteredPassword('');
      setPasswordError('');
    }
  }

  function handleVerifyPassword(e: React.FormEvent) {
    e.preventDefault();
    if (enteredPassword === 'Double_faced_Adrish') {
      if (passwordModalStudentId) {
        setUnlockedPhones((prev) => ({ ...prev, [passwordModalStudentId]: true }));
      }
      setPasswordModalStudentId(null);
      setEnteredPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Access denied.');
    }
  }

  const selectedDomain = DOMAIN_MAP.get(selectedDomainId);

  // Stats calculation
  const totalInCategory = students.length;
  const rank1Count = students.filter((s) => s.targetDomainRank === 1).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Page Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan mb-3">
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Live GCECT Student Submissions & Interests</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Technology Interests & Student Rankings
        </h1>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          Select any of the 20 technology categories to view the real students who prioritized it. Students who ranked the category higher appear at the top.
        </p>
      </div>

      {/* 1. Category Selector: The 20 Categories Grid */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Select Technology Category (20 Domains)</span>
          </span>
          <span className="text-[11px] text-text-muted">Currently active: {selectedDomain?.name}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-60 overflow-y-auto pr-1 p-2 rounded-2xl bg-[#0B1220]/70 border border-white/[0.08]">
          {DOMAINS.map((domain) => {
            const isSelected = selectedDomainId === domain.id;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => setSelectedDomainId(domain.id)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-primary/25 border-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                    : 'bg-white/[0.02] border-white/[0.05] text-text-secondary hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${domain.color}25`, color: domain.color }}
                >
                  <DomainIcon name={domain.iconName} className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium truncate">{domain.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Secondary Filter Bar (Department, Year, Search) */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name..."
            className="w-full bg-[#080D18] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Department:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-[#080D18] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#080D18] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              {YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Category Summary Stats */}
      <div className="glass-card p-6 rounded-2xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${selectedDomain?.color}25`, color: selectedDomain?.color }}
          >
            {selectedDomain && <DomainIcon name={selectedDomain.iconName} className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{selectedDomain?.name}</h2>
            <span className="text-xs text-text-muted">{selectedDomain?.category}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-text-muted block text-[11px]">Total Interested</span>
            <span className="text-xl font-bold text-white">{totalInCategory} students</span>
          </div>
          <div>
            <span className="text-text-muted block text-[11px]">Rank 1 (Top Priority)</span>
            <span className="text-xl font-bold text-accent-cyan">{rank1Count} students</span>
          </div>
        </div>
      </div>

      {/* 4. Ranked Students List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Students Interested in {selectedDomain?.name} (Ordered by Priority)</span>
          </h3>
          <span className="text-[11px] text-text-muted">
            Highest preference (Rank 1) shown first
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center glass-panel rounded-3xl">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-xs text-text-muted">Loading live student rankings...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="space-y-3">
            {students.map((student, idx) => {
              const rank = student.targetDomainRank ?? 1;
              const isUnlocked = unlockedPhones[student.id];

              // Check if any other student shares this rank
              const isTied = students.some((other) => other.id !== student.id && other.targetDomainRank === rank);

              return (
                <div
                  key={student.id}
                  className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white/[0.04]"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold flex-shrink-0 ${
                        rank === 1
                          ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 shadow-md shadow-cyan-500/10'
                          : rank === 2
                          ? 'bg-primary/20 text-primary-light border border-primary/30'
                          : 'bg-white/[0.05] text-text-secondary border border-white/[0.08]'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-tighter">Rank</span>
                      <span className="text-lg leading-none">{rank}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white">{student.name}</h4>
                        {isTied && (
                          <span className="text-[10px] font-semibold text-accent-amber px-2 py-0.5 rounded bg-accent-amber/10 border border-accent-amber/30 flex items-center gap-1">
                            <Equal className="w-2.5 h-2.5" />
                            <span>Tied Priority</span>
                          </span>
                        )}
                        <span className="text-[10px] text-text-muted font-mono">
                          • {student.pathChosen === 'questionnaire' ? 'Adaptive Test' : 'Direct Selection'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-text-muted" />
                          <span>{student.department}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          <span>{student.year}</span>
                        </span>
                      </div>

                      {/* Other ranked domains */}
                      {student.rankings && student.rankings.length > 1 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-[10px] text-text-muted mr-1">Also prioritized:</span>
                          {student.rankings
                            .filter((r) => r.domainId !== selectedDomainId)
                            .slice(0, 4)
                            .map((r) => {
                              const dom = DOMAIN_MAP.get(r.domainId);
                              return (
                                <span
                                  key={r.domainId}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03] text-text-muted border border-white/[0.04]"
                                >
                                  {dom?.name.split(' ')[0] || r.domainId} (R{r.rank})
                                </span>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phone Number Protected Eye Action */}
                  <div className="flex items-center gap-3 justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.05]">
                    <div className="text-right">
                      <span className="text-[10px] text-text-muted block font-mono">Contact Phone:</span>
                      <span className="text-xs font-mono font-semibold text-white">
                        {isUnlocked ? student.phoneNumber : '+91 ••••• •••••'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleEyeClick(student.id)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isUnlocked
                          ? 'bg-accent-emerald/20 text-accent-emerald border-accent-emerald/40'
                          : 'bg-white/[0.05] border-white/[0.1] text-text-secondary hover:text-white hover:bg-white/[0.08]'
                      }`}
                      title={isUnlocked ? 'Hide phone number' : 'Enter password to reveal phone number'}
                    >
                      {isUnlocked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center rounded-3xl max-w-lg mx-auto">
            <Users className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No Student Submissions Found</h4>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              No students have registered their interest in <strong className="text-white">{selectedDomain?.name}</strong> under this department or year filter yet.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover text-xs shadow-md shadow-primary/20"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Be the First to Register Interests</span>
            </Link>
          </div>
        )}
      </div>

      {/* Password Modal to reveal phone number */}
      {passwordModalStudentId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full">
            <div className="w-12 h-12 rounded-2xl bg-accent-violet/15 text-accent-violet flex items-center justify-center mb-4 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white text-center mb-1">
              Protected Student Information
            </h3>
            <p className="text-xs text-text-secondary text-center mb-6 leading-relaxed">
              Enter the authorized GCECT verification password to reveal this student&apos;s phone number.
            </p>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  autoFocus
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  placeholder="Enter access password"
                  className="w-full bg-[#080D18] border border-white/[0.15] rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary text-center font-mono"
                />
              </div>

              {passwordError && (
                <p className="text-xs text-accent-rose bg-accent-rose/10 p-2.5 rounded-lg border border-accent-rose/20 text-center font-medium">
                  {passwordError}
                </p>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalStudentId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover"
                >
                  Verify & Reveal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
