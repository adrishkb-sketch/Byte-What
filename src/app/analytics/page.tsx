'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart2,
  TrendingUp,
  Users,
  FolderGit2,
  CheckCircle2,
  Layers,
  Sparkles,
  Loader2,
  Compass,
  ArrowUpRight,
  Filter,
  GraduationCap,
  Cpu,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DOMAINS } from '@/data/domains';

interface AnalyticsData {
  totalSubmissions: number;
  activeProjects: number;
  discoverableMates: number;
  domainRankings: {
    id: string;
    name: string;
    category: string;
    count: number;
    percentage: number;
  }[];
  topCombinations: {
    domains: string[];
    label: string;
    count: number;
  }[];
  completionTrend: {
    month: string;
    completions: number;
  }[];
  departmentComparison: {
    domain: string;
    CSE: number;
    IT: number;
    Ceramics: number;
  }[];
  yearProgression: {
    year: string;
    web: number;
    ai: number;
    systems: number;
    research: number;
  }[];
  scoreDistribution: {
    range: string;
    students: number;
    color: string;
  }[];
}

const CATEGORY_COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

type ActiveTab = 'department' | 'year' | 'all_domains' | 'synergies' | 'distribution';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('department');

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await fetch('/api/analytics');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-xs text-text-muted">Loading GCECT Comprehensive Analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-xs text-text-muted">No analytics data available yet.</p>
      </div>
    );
  }

  // Aggregate category counts for pie chart
  const categoryCounts: Record<string, number> = {};
  data.domainRankings.forEach((d) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + d.count;
  });

  const pieData = Object.entries(categoryCounts).map(([cat, val]) => ({
    name: cat,
    value: val,
  }));

  const all20DomainsData = data.domainRankings.map((d) => ({
    name: d.name.length > 24 ? d.name.slice(0, 22) + '...' : d.name,
    fullName: d.name,
    count: d.count,
    category: d.category,
    percentage: d.percentage,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan mb-3">
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Institutional Analytics & Comparative Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          GCECT Student Technology Interest Map
        </h1>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          Comprehensive cross-departmental analytics comparing student interests across Computer Science, Information Technology, and Ceramic Technology.
        </p>
      </div>

      {/* High-Level Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted font-medium">Total Evaluations</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white">{data.totalSubmissions}</span>
          <span className="text-[11px] text-accent-emerald block mt-1 font-medium">
            Active Submissions across GCECT
          </span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted font-medium">Active Student Projects</span>
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4 text-accent-cyan" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white">{data.activeProjects}</span>
          <span className="text-[11px] text-text-muted block mt-1">Collegiate Innovation Teams</span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted font-medium">Opted-In ByteMates</span>
            <div className="w-8 h-8 rounded-lg bg-accent-violet/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-accent-violet" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white">{data.discoverableMates}</span>
          <span className="text-[11px] text-accent-cyan block mt-1">Discoverable Peer Collaborators</span>
        </div>
      </div>

      {/* Comparison Analytics Navigation Tabs */}
      <div className="glass-panel p-2 rounded-2xl mb-8 flex flex-wrap gap-2">
        {[
          { id: 'department', label: 'Departmental Comparison (CSE vs IT vs Ceramics)' },
          { id: 'year', label: 'Academic Year Trajectory (1st → 4th Year)' },
          { id: 'all_domains', label: 'All 20 Domains Full Ranking' },
          { id: 'synergies', label: 'Cross-Domain Synergies' },
          { id: 'distribution', label: 'Score & Category Distribution' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: Departmental Comparison */}
      {activeTab === 'department' && (
        <div className="space-y-8 mb-12">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>Departmental Affinity Comparison (% Interest)</span>
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Comparing student interest concentration across CSE, IT, and Ceramic Technology.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="w-3 h-3 rounded bg-primary" />
                  <span>CSE</span>
                </span>
                <span className="flex items-center gap-1.5 text-accent-violet">
                  <span className="w-3 h-3 rounded bg-accent-violet" />
                  <span>IT</span>
                </span>
                <span className="flex items-center gap-1.5 text-accent-cyan">
                  <span className="w-3 h-3 rounded bg-accent-cyan" />
                  <span>Ceramic Tech</span>
                </span>
              </div>
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.departmentComparison} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="domain" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748B" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="CSE" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Computer Science" />
                  <Bar dataKey="IT" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Information Tech" />
                  <Bar dataKey="Ceramics" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Ceramic Tech" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Departmental Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-primary font-bold text-sm">
                <span>Computer Science & Engineering</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Strongest concentrations in <strong className="text-white">Software Engineering (82%)</strong> and <strong className="text-white">Artificial Intelligence (79%)</strong>, followed closely by competitive programming and algorithmic systems.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-accent-violet font-bold text-sm">
                <span>Information Technology</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Exhibits peak interest in <strong className="text-white">Cloud Computing / DevOps (76%)</strong>, <strong className="text-white">Cybersecurity (68%)</strong>, and full-stack web architectures.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-accent-cyan font-bold text-sm">
                <span>Ceramic Technology</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Distinct crossover into <strong className="text-white">Robotics & IoT (78%)</strong> and <strong className="text-white">Electronics / VLSI (72%)</strong> for kiln telemetry, alongside materials-science machine learning.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Year Progression Trajectory */}
      {activeTab === 'year' && (
        <div className="space-y-8 mb-12">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-cyan" />
                  <span>Interest Shift Across Academic Years (1st → 4th Year)</span>
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  How student interest migrates from initial web exploration toward systems engineering and scientific research.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span>Web / App Dev</span>
                </span>
                <span className="flex items-center gap-1.5 text-accent-violet">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-violet" />
                  <span>AI & ML</span>
                </span>
                <span className="flex items-center gap-1.5 text-accent-cyan">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan" />
                  <span>Systems & DevOps</span>
                </span>
                <span className="flex items-center gap-1.5 text-accent-emerald">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald" />
                  <span>Research & Quant</span>
                </span>
              </div>
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.yearProgression} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis stroke="#64748B" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="web" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, fill: '#3B82F6' }} name="Web & App Dev" />
                  <Line type="monotone" dataKey="ai" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5, fill: '#8B5CF6' }} name="AI & Machine Learning" />
                  <Line type="monotone" dataKey="systems" stroke="#06B6D4" strokeWidth={3} dot={{ r: 5, fill: '#06B6D4' }} name="Systems & Infrastructure" />
                  <Line type="monotone" dataKey="research" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: '#10B981' }} name="CS Research & Quant" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-2">Key Cohort Takeaway:</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Freshman students arrive with massive initial interest in Web Development (84%). By Year 3 and Year 4, interests shift decisively toward <strong className="text-white">Systems Programming & Infrastructure (76%)</strong> and <strong className="text-white">Computer Science Research & Quant (66%)</strong>, driven by capstone projects and placement preparation.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: All 20 Domains Full Ranking */}
      {activeTab === 'all_domains' && (
        <div className="space-y-8 mb-12">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl">
            <div className="mb-6">
              <h3 className="text-base font-bold text-white">All 20 Technology Domains — Full Popularity Ranking</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Complete spectrum of collegiate interest frequency across the entire student dataset.
              </p>
            </div>

            <div className="w-full h-[650px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={all20DomainsData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 10 }}>
                  <XAxis type="number" stroke="#64748B" />
                  <YAxis dataKey="name" type="category" width={170} stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any, name: any, item: any) => [`${val} Submissions (${item.payload.percentage}% of cohort)`, item.payload.fullName]}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Student Submissions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: Cross-Domain Synergies */}
      {activeTab === 'synergies' && (
        <div className="space-y-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-2">Most Common Dual-Domain Crossovers</h3>
              <p className="text-xs text-text-muted mb-6">
                Combinations that frequently co-occur in individual student profiles:
              </p>
              <div className="space-y-3.5">
                {data.topCombinations.map((combo, idx) => (
                  <div key={combo.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light font-mono text-[11px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white">{combo.label}</h4>
                      </div>
                      <span className="text-[10px] text-text-muted font-mono">{combo.domains.join(' • ')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-accent-cyan">{combo.count}</span>
                      <span className="text-[10px] text-text-muted block">Co-occurrences</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-2">Multi-Disciplinary Impact at GCECT</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  The data demonstrates that modern engineering students at GCECT rarely confine themselves to a single silo.
                </p>
                <div className="space-y-3 text-xs text-text-secondary">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <strong className="text-white block mb-0.5">Full-Stack AI Systems (68 students)</strong>
                    <span>Frontend and backend architectures integrating Retrieval-Augmented Generation (RAG) and intelligent agents.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20">
                    <strong className="text-white block mb-0.5">Physical Computing & Hardware (47 students)</strong>
                    <span>Bridging microcontrollers (ESP32/Arduino) with real-world sensor telemetry and mechanical actuators.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-accent-violet/10 border border-accent-violet/20">
                    <strong className="text-white block mb-0.5">Systems & Security (29 students)</strong>
                    <span>Linux kernel internals, socket protocols, and proactive vulnerability exploitation defense.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] mt-4">
                <Link
                  href="/bytemates"
                  className="w-full block text-center py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors"
                >
                  Find Multi-Disciplinary Collaborators on ByteMates
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: Score & Category Distribution */}
      {activeTab === 'distribution' && (
        <div className="space-y-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Score Intensity Histogram */}
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-1">Score Intensity Distribution</h3>
              <p className="text-xs text-text-muted mb-4">
                How strongly students score across their top identified disciplines:
              </p>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="range" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                    <YAxis stroke="#64748B" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="students" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Donut */}
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-1">Broad Engineering Category Share</h3>
              <p className="text-xs text-text-muted mb-4">
                Relative proportion of student interest across high-level engineering clusters:
              </p>
              <div className="w-full h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {pieData.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trajectory Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Collegiate Questionnaire Growth Trend</h3>
            <p className="text-xs text-text-muted">Cumulative anonymous questionnaire submissions per month</p>
          </div>
        </div>
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.completionTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="completions" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 4, fill: '#06B6D4' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
