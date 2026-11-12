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
  Layers,
  PieChart as PieIcon,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
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
const SEMESTERS = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

const CATEGORY_COLORS = [
  '#00F0FF', // ByteMonk Cyan
  '#8B5CF6', // Violet
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [selectedDomainId, setSelectedDomainId] = useState<DomainId>('software_web');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [students, setStudents] = useState<(StudentSubmission & { targetDomainRank?: number })[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Phone number unlocking state
  const [unlockedPhones, setUnlockedPhones] = useState<Record<string, boolean>>({});
  const [passwordModalStudentId, setPasswordModalStudentId] = useState<string | null>(null);
  const [enteredPassword, setEnteredPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch real submissions filtered by the selected category/filters
  useEffect(() => {
    async function fetchSubmissions() {
      try {
        setLoading(true);
        let url = `/api/submissions?domainId=${selectedDomainId}&isValid=true`;
        if (selectedDepartment !== 'All') url += `&department=${encodeURIComponent(selectedDepartment)}`;
        if (selectedYear !== 'All') url += `&year=${encodeURIComponent(selectedYear)}`;
        if (selectedSemester !== 'All') url += `&semester=${encodeURIComponent(selectedSemester)}`;
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
  }, [selectedDomainId, selectedDepartment, selectedYear, selectedSemester, searchQuery]);

  // Fetch full aggregate analytics for comparison charts
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const params = new URLSearchParams();
        if (selectedDepartment !== 'All') params.set('department', selectedDepartment);
        if (selectedYear !== 'All') params.set('year', selectedYear);
        if (selectedSemester !== 'All') params.set('semester', selectedSemester);
        const qs = params.toString();
        const res = await fetch(`/api/analytics${qs ? `?${qs}` : ''}`);
        const json = await res.json();
        if (json.success) {
          setAnalyticsData(json.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      }
    }
    fetchAnalytics();
  }, [students.length, selectedDepartment, selectedYear, selectedSemester]);

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

  // Chart data preparation
  const domainChartData = (analyticsData?.domainRankings || []).map((d: any) => ({
    name: d.name.length > 20 ? d.name.slice(0, 18) + '...' : d.name,
    fullName: d.name,
    total: d.count,
    topChoice: d.topRankedCount,
  }));

  const deptChartData = Object.entries(analyticsData?.departmentBreakdown || {}).map(([dept, count]) => ({
    department: dept.replace('Computer Science & Engineering', 'CSE').replace('Information Technology', 'IT').replace('Ceramic Technology', 'Ceramic'),
    fullName: dept,
    students: count as number,
  }));

  const yearChartData = Object.entries(analyticsData?.yearBreakdown || {}).map(([year, count]) => ({
    year,
    students: count as number,
  }));

  const semesterChartData = [1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
    semester: `Sem ${s}`,
    students: Number(analyticsData?.semesterBreakdown?.[s] || 0),
  }));

  // Category grouping
  const categoryCounts: Record<string, number> = {};
  (analyticsData?.domainRankings || []).forEach((d: any) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + d.count;
  });
  const categoryPieData = Object.entries(categoryCounts).map(([cat, val]) => ({
    name: cat,
    value: val,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Page Header */}
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan mb-3">
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Live GCECT Student Submissions & Interests</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Technology Interests & Student Rankings
        </h1>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          Select any of the 20 technology categories to view the real students who prioritized it. Students who ranked the category higher appear at the top. Comparative college-wide graphs are featured below.
        </p>
      </div>

      {/* 1. Category Selector: The 20 Categories Grid (LOADED AND VISIBLE FIRST) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Select Technology Category (20 Domains)</span>
          </span>
          <span className="text-[11px] text-text-muted">Active: <strong className="text-white">{selectedDomain?.name}</strong></span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-64 overflow-y-auto pr-1 p-2 rounded-2xl bg-[#0B1220]/70 border border-white/[0.08]">
          {DOMAINS.map((domain) => {
            const isSelected = selectedDomainId === domain.id;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => setSelectedDomainId(domain.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'bg-white/[0.02] border-white/[0.05] text-text-secondary hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${domain.color}25`, color: domain.color }}
                  >
                    <DomainIcon name={domain.iconName} className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold line-clamp-1">{domain.name}</span>
                </div>
                <span className="text-[10px] text-text-muted">{domain.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar (Department, Year, Semester, Search) */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="text-xs text-text-muted">Department:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-[#080D18] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-[#080D18] text-white">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-accent-violet" />
            <span className="text-xs text-text-muted">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#080D18] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              {YEARS.map((y) => (
                <option key={y} value={y} className="bg-[#080D18] text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="text-xs text-text-muted">Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-[#080D18] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem} className="bg-[#080D18] text-white">
                  {sem === 'All' ? 'All Semesters' : `Semester ${sem}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student or dept..."
            className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Selected Domain Banner & Ranking Header */}
      <div className="glass-panel p-6 rounded-3xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4" style={{ borderLeftColor: selectedDomain?.color || '#3B82F6' }}>
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${selectedDomain?.color}25`, color: selectedDomain?.color }}
          >
            {selectedDomain && <DomainIcon name={selectedDomain.iconName} className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">{selectedDomain?.name}</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-text-muted">
                {selectedDomain?.category}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1 line-clamp-1 max-w-xl">
              {selectedDomain?.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:border-l sm:border-white/[0.1] sm:pl-6">
          <div className="text-center">
            <span className="text-xs text-text-muted block">Interested</span>
            <span className="text-lg font-extrabold text-white">{totalInCategory}</span>
          </div>
          <div className="text-center">
            <span className="text-xs text-text-muted block">Rank 1 (Top)</span>
            <span className="text-lg font-extrabold text-accent-cyan">{rank1Count}</span>
          </div>
        </div>
      </div>

      {/* Student Submissions List (Ranked with Highest Priority at the Top) */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Students Interested in {selectedDomain?.name} ({students.length})</span>
          </h3>
          <span className="text-[11px] text-text-muted">
            Ranked by priority order (Rank 1 at top)
          </span>
        </div>

        {loading ? (
          <div className="glass-panel p-12 text-center rounded-3xl">
            <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading registered students...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="space-y-3">
            {students.map((student, idx) => {
              const isPhoneUnlocked = !!unlockedPhones[student.id];
              const targetRank = student.targetDomainRank ?? 99;
              const isTopRank = targetRank === 1;

              return (
                <div
                  key={student.id}
                  className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/[0.15] transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-mono text-xs font-bold text-text-muted flex-shrink-0">
                      #{idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">{student.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            isTopRank
                              ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                              : 'bg-primary/10 text-primary border border-primary/20'
                          }`}
                        >
                          {isTopRank ? '★ Rank 1 Priority' : `Rank ${targetRank}`}
                        </span>
                        <span className="text-[10px] text-text-muted bg-white/[0.04] px-1.5 py-0.5 rounded">
                          {student.pathChosen === 'questionnaire' ? 'Adaptive AI Survey' : 'Direct Selection'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-accent-cyan" />
                          <span>{student.department}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-accent-violet" />
                          <span>{student.year}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-accent-cyan">
                          <Layers className="w-3 h-3 text-accent-cyan" />
                          <span>Sem {student.semester || 1}</span>
                        </span>
                        {student.isVerified && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-accent-emerald font-semibold">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Protected Phone Number & Actions */}
                  <div className="flex items-center gap-3 justify-end w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                    <div className="flex items-center gap-2 bg-[#080D18] px-3 py-1.5 rounded-xl border border-white/[0.08]">
                      <Phone className="w-3 h-3 text-accent-emerald flex-shrink-0" />
                      <span className="text-xs font-mono text-white">
                        {isPhoneUnlocked
                          ? student.phoneNumber || 'N/A'
                          : '••••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEyeClick(student.id)}
                        title={isPhoneUnlocked ? 'Hide phone number' : 'Click to reveal phone number (Password required)'}
                        className="text-text-muted hover:text-white transition-colors ml-1 p-0.5"
                      >
                        {isPhoneUnlocked ? (
                          <EyeOff className="w-3.5 h-3.5 text-accent-amber" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-accent-cyan" />
                        )}
                      </button>
                    </div>
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

      {/* 2. COMPREHENSIVE COMPARISON ANALYTICS & GRAPHS SECTION */}
      <div className="pt-8 border-t border-white/[0.08]">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-violet/10 border border-accent-violet/20 text-xs text-accent-violet mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>College-Wide Comparative Insights</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            GCECT Technology Ecosystem Analytics
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Real-time visual distribution of interests across departments, academic years, and technology verticals.
          </p>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-[11px] text-text-muted block mb-1">Total Submissions</span>
            <div className="text-2xl font-extrabold text-white">
              {analyticsData?.totalSubmissions || 0}
            </div>
            <span className="text-[10px] text-accent-emerald mt-1 block">Live students registered</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-[11px] text-text-muted block mb-1">Top Most Popular Domain</span>
            <div className="text-base font-extrabold text-accent-cyan truncate">
              {analyticsData?.domainRankings?.[0]?.name || 'N/A'}
            </div>
            <span className="text-[10px] text-text-muted mt-1 block">
              {analyticsData?.domainRankings?.[0]?.count || 0} interested students
            </span>
          </div>

          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-[11px] text-text-muted block mb-1">Top #1 Choice</span>
            <div className="text-base font-extrabold text-accent-violet truncate">
              {analyticsData?.domainRankings?.slice().sort((a: any, b: any) => b.topRankedCount - a.topRankedCount)[0]?.name || 'N/A'}
            </div>
            <span className="text-[10px] text-text-muted mt-1 block">Highest primary priority</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-[11px] text-text-muted block mb-1">Most Active Dept</span>
            <div className="text-base font-extrabold text-accent-amber truncate">
              {Object.entries(analyticsData?.departmentBreakdown || {}).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
            </div>
            <span className="text-[10px] text-text-muted mt-1 block">Leading participation</span>
          </div>
        </div>

        {/* Chart 1: All 20 Domains Popularity & Rank 1 Distribution */}
        <div className="glass-panel p-6 rounded-3xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                <span>All 20 Technology Domains — Student Interest & Top Choice</span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Comparing total students interested vs students selecting the domain as their Rank 1 top priority.
              </p>
            </div>
          </div>

          {isMounted && domainChartData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={domainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    fontSize={10}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#ffffff20',
                      borderRadius: '0.75rem',
                      color: '#F8FAFC',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="total" name="Total Interested" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="topChoice" name="Rank 1 Priority" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-text-muted">
              Chart data will render with student submissions.
            </div>
          )}
        </div>

        {/* Grid of Three Charts: Department, Semester Progression, and Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Department Breakdown */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-accent-cyan" />
              <span>Department Participation</span>
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Student submissions across GCECT engineering departments.
            </p>

            {isMounted && deptChartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="department" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#ffffff20',
                        borderRadius: '0.75rem',
                        color: '#F8FAFC',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="students" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-text-muted">
                No department data available yet.
              </div>
            )}
          </div>

          {/* Semester Distribution */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00F0FF]" />
              <span>Semester Distribution (Sem 1–8)</span>
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Validated student representation across semesters.
            </p>

            {isMounted && semesterChartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={semesterChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="semester" stroke="#94A3B8" fontSize={10} />
                    <YAxis stroke="#94A3B8" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#00F0FF40',
                        borderRadius: '0.75rem',
                        color: '#F8FAFC',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="students" fill="#00F0FF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-text-muted">
                No semester distribution data available yet.
              </div>
            )}
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-accent-amber" />
              <span>Technology Domain Categories</span>
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Relative interest volume by core engineering category.
            </p>

            {isMounted && categoryPieData.length > 0 ? (
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#ffffff20',
                        borderRadius: '0.75rem',
                        color: '#F8FAFC',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-text-muted">
                No category data available yet.
              </div>
            )}
          </div>
        </div>
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
