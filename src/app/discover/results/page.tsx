'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  FolderGit2,
  Share2,
  RotateCcw,
  Loader2,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { QuestionnaireResultSummary, DomainScoreResult } from '@/types';
import { DOMAIN_MAP } from '@/data/domains';
import { DomainIcon } from '@/components/ui/DomainIcon';
import { getOrCreateAnonymousSessionId, clearAnonymousSessionId } from '@/lib/session';

function ResultsContent() {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get('sessionId');

  const [results, setResults] = useState<QuestionnaireResultSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const id = urlSessionId || getOrCreateAnonymousSessionId();
    async function fetchResults() {
      try {
        setLoading(true);
        const res = await fetch(`/api/questionnaire/results?sessionId=${id}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        }
      } catch (err) {
        console.error('Failed to load questionnaire results:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [urlSessionId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <h2 className="text-lg font-bold text-white">Rendering Interest Profile...</h2>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">No Active Results Found</h2>
        <p className="text-xs text-text-secondary mb-6">
          You haven&apos;t completed an interest questionnaire in this browser session yet.
        </p>
        <Link
          href="/discover/questionnaire"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover"
        >
          Take Questionnaire Now
        </Link>
      </div>
    );
  }

  // Prepare chart data for top 8 domains
  const radarData = results.allDomainScores.slice(0, 8).map((item) => ({
    domain: DOMAIN_MAP.get(item.domainId)?.name.split(' ')[0] || item.domainId,
    fullName: DOMAIN_MAP.get(item.domainId)?.name || item.domainId,
    interest: item.interestScore,
    confidence: item.confidenceScore,
  }));

  const barData = results.allDomainScores.slice(0, 6).map((item) => ({
    name: DOMAIN_MAP.get(item.domainId)?.name || item.domainId,
    score: item.interestScore,
    confidence: item.confidenceScore,
  }));

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-xs text-accent-emerald mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Deterministic Evaluation Complete</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Your Technology Interest Profile
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Grounded in {results.questionsAnswered} answered questions across GCECT engineering disciplines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-text-primary bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied!' : 'Share Results'}</span>
            </button>
            <Link
              href="/bytemates"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Find ByteMates</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Interests (Top 3) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Primary Technical Interests (Top 3)</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              The engineering disciplines where your curiosity and motivation are most concentrated.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.primaryInterests.map((item, idx) => {
            const domain = DOMAIN_MAP.get(item.domainId);
            if (!domain) return null;

            return (
              <div key={item.domainId} className="glass-card p-6 rounded-2xl relative flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
                  >
                    <DomainIcon name={domain.iconName} className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">{item.interestScore}%</span>
                    <span className="text-[10px] text-text-muted block font-mono">Interest Score</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-base font-bold text-white mb-1">{domain.name}</h3>
                  <span className="text-[11px] text-text-muted">{domain.category}</span>
                  <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-text-muted">Evidence Confidence:</span>
                    <span className="font-semibold text-accent-cyan">{item.confidenceScore}%</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-text-muted">Questions Answered:</span>
                    <span className="text-text-secondary">{item.evidenceCount} probes</span>
                  </div>
                  <Link
                    href={`/interests/${domain.id}`}
                    className="mt-3 text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1"
                  >
                    <span>Domain Roadmap & Skills</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Radar Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-2">Cross-Domain Interest Radar</h3>
          <p className="text-xs text-text-muted mb-4">
            Visualizing interest intensity across your top evaluated technology vectors.
          </p>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="domain" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748B" />
                <Radar name="Interest Score" dataKey="interest" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-2">Top Ranked Domain Scores</h3>
          <p className="text-xs text-text-muted mb-4">
            Deterministic percentage breakdown compared against evidence confidence.
          </p>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#64748B" />
                <YAxis dataKey="name" type="category" width={110} stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="score" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Interest %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Explanation & Cross-Domain Synergies */}
      {results.writtenExplanation && (
        <div className="glass-panel p-8 rounded-3xl mb-12 border border-primary/20 relative">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent-violet flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Academic & Synergy Insights</h3>
              <span className="text-[11px] text-text-muted">Interpreted with Google Gemini AI layer</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
            {results.writtenExplanation}
          </p>

          {results.crossDomainInsights && results.crossDomainInsights.length > 0 && (
            <div className="bg-[#080D18]/70 p-4 rounded-xl border border-white/[0.04] mb-6">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                Cross-Domain Synergies
              </h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                {results.crossDomainInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Projects */}
          {results.suggestedProjects && results.suggestedProjects.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
                Recommended Student Projects
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.suggestedProjects.map((proj, i) => (
                  <div key={i} className="bg-[#111827]/70 p-4 rounded-xl border border-white/[0.06]">
                    <h5 className="text-sm font-bold text-white mb-1">{proj.title}</h5>
                    <p className="text-xs text-text-secondary leading-relaxed mb-3">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies?.map((tech) => (
                        <span key={tech} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-text-muted">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Secondary & Emerging Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Secondary */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-1">Secondary Interests</h3>
          <p className="text-xs text-text-muted mb-4">
            Next high-scoring domains that provide natural project crossover.
          </p>
          <div className="space-y-3">
            {results.secondaryInterests.map((item) => {
              const dom = DOMAIN_MAP.get(item.domainId);
              return (
                <div key={item.domainId} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    {dom && <DomainIcon name={dom.iconName} className="w-4 h-4 text-primary" />}
                    <span className="text-xs font-medium text-white">{dom?.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary">{item.interestScore}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emerging or Low Evidence */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-1">Emerging Domains</h3>
          <p className="text-xs text-text-muted mb-4">
            Domains where you indicated strong interest but answered fewer specific questions.
          </p>
          <div className="space-y-3">
            {results.emergingInterests.length > 0 ? (
              results.emergingInterests.map((item) => {
                const dom = DOMAIN_MAP.get(item.domainId);
                return (
                  <div key={item.domainId} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      {dom && <DomainIcon name={dom.iconName} className="w-4 h-4 text-accent-cyan" />}
                      <span className="text-xs font-medium text-white">{dom?.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-accent-cyan">{item.interestScore}%</span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-text-muted italic py-4 text-center">
                All high-interest domains received sufficient evidence during your adaptive session.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Next Steps */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl text-center">
        <h3 className="text-xl font-bold text-white mb-2">What Would You Like to Do Next?</h3>
        <p className="text-xs text-text-secondary max-w-lg mx-auto mb-6">
          Connect anonymously with peers who have complementary interests, or post a new project on the GCECT student board.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/bytemates"
            className="px-6 py-3 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Discover ByteMates</span>
          </Link>
          <Link
            href="/projects"
            className="px-6 py-3 rounded-xl text-xs font-semibold text-text-primary bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-colors flex items-center gap-2"
          >
            <FolderGit2 className="w-4 h-4 text-text-muted" />
            <span>Browse Student Projects</span>
          </Link>
          <Link
            href="/communities"
            className="px-6 py-3 rounded-xl text-xs font-semibold text-text-primary bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-colors"
          >
            Join Domain Communities
          </Link>
        </div>
      </div>

      {/* Academic Disclaimer */}
      <div className="mt-8 text-center text-[11px] text-text-muted">
        <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-accent-emerald" />
        <span>
          BYTE WHAT is an exploratory technology interest discovery platform for GCECT students, not an aptitude test.
        </span>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <h2 className="text-lg font-bold text-white">Loading Results...</h2>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
