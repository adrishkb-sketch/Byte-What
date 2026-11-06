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
}

const CATEGORY_COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        <p className="text-xs text-text-muted">Loading Student Interest Map...</p>
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

  const top10Rankings = data.domainRankings.slice(0, 10).map((d) => ({
    name: d.name.length > 22 ? d.name.slice(0, 20) + '...' : d.name,
    count: d.count,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-xs text-accent-cyan mb-3">
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Real-Time College Analytics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          GCECT Student Interest Map
        </h1>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          Aggregated, privacy-preserving technology interest patterns across the student body. Data updates dynamically with every anonymous questionnaire completion.
        </p>
      </div>

      {/* High-Level Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted font-medium">Total Evaluations</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white">{data.totalSubmissions}</span>
          <span className="text-[11px] text-accent-emerald block mt-1 font-medium">
            Anonymous Submissions
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
          <span className="text-[11px] text-text-muted block mt-1">Open Collaboration Teams</span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted font-medium">Opted-In ByteMates</span>
            <div className="w-8 h-8 rounded-lg bg-accent-violet/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-accent-violet" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white">{data.discoverableMates}</span>
          <span className="text-[11px] text-accent-cyan block mt-1">Discoverable Pseudonyms</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Popularity Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Top 10 Technology Domains</h3>
              <p className="text-xs text-text-muted">Ranked by frequency of student interest</p>
            </div>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10Rankings} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" stroke="#64748B" />
                <YAxis dataKey="name" type="category" width={130} stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Interest Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Interest by Engineering Category</h3>
            <p className="text-xs text-text-muted">Distribution across departmental clusters</p>
          </div>
          <div className="w-full h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
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
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completion Trends & Top Combinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Trend Line Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Monthly Completion Trajectory</h3>
            <p className="text-xs text-text-muted">Anonymous questionnaire submissions over time</p>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.completionTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="completions"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#06B6D4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cross-Domain Combinations */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Most Common Cross-Domain Crossovers</h3>
            <p className="text-xs text-text-muted">Frequent dual-interest patterns discovered among peers</p>
          </div>
          <div className="space-y-3">
            {data.topCombinations.map((combo) => (
              <div
                key={combo.label}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{combo.label}</h4>
                  <span className="text-[10px] text-text-muted font-mono">
                    {combo.domains.join(' + ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-primary">{combo.count}</span>
                  <span className="text-[10px] text-text-muted block">Students</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
