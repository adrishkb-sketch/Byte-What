'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Phone,
  Layers,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { StudentSubmission } from '@/types';
import { DOMAIN_MAP } from '@/data/domains';
import { DomainIcon } from '@/components/ui/DomainIcon';
import { ChromeAiBadge } from '@/components/ui/ChromeAiBadge';

export default function AccountPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadStudent() {
      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();
        if (json.success && json.data) {
          setStudent(json.data);
        } else {
          router.push('/login?redirect=/account');
        }
      } catch {
        router.push('/login?redirect=/account');
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch {
      router.push('/');
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin mx-auto mb-3" />
        <p className="text-xs text-text-muted">Loading your student account...</p>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const hasRankings = student.rankings && student.rankings.length > 0;
  const sortedRankings = hasRankings ? [...student.rankings].sort((a, b) => a.rank - b.rank) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/25 text-xs text-[#00F0FF] mb-2 font-mono">
            <span>BYTE WHAT • Student Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {student.name}
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            GCECT Technology Platform & Academic Interest Center
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{loggingOut ? 'Logging out...' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Account Verification & Approval Status Banner */}
      <div className="mb-8">
        {student.isValid ? (
          <div className="p-6 rounded-3xl bg-accent-emerald/10 border border-accent-emerald/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-emerald/20 text-accent-emerald flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Account Verified & Approved</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/40 font-bold">
                    VALIDATED
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Your student credentials have been confirmed by GCECT Admin. You are fully authorized to select and prioritize your engineering interests.
                </p>
              </div>
            </div>

            <Link
              href="/onboarding"
              className="px-5 py-2.5 rounded-xl font-bold text-[#050811] bg-[#00F0FF] hover:bg-[#00D2DF] shadow-md shadow-[#00F0FF]/30 transition-all text-xs flex items-center gap-2 flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{hasRankings ? 'Update My Interests' : 'Tell What Interests You'}</span>
            </Link>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-accent-amber/10 border border-accent-amber/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-amber/20 text-accent-amber flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Pending Admin Verification</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-amber/20 text-accent-amber border border-accent-amber/40 font-bold">
                    UNDER MANUAL REVIEW
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Your student registration and physical College ID scan have been received. The administrator will manually verify your documents. Once approved, the interest ranking form will automatically unlock.
                </p>
              </div>
            </div>

            <div className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 flex-shrink-0 cursor-not-allowed">
              <Clock className="w-3.5 h-3.5 text-accent-amber" />
              <span>Awaiting Admin Approval</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Student Details Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/[0.1] bg-[#080E1D]/90 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <User className="w-4 h-4 text-[#00F0FF]" />
            <span>Academic Profile</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Full Name</span>
              <span className="font-semibold text-white">{student.name}</span>
            </div>

            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">College Email</span>
              <span className="font-mono text-white break-all">{student.email || 'N/A'}</span>
            </div>

            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Department</span>
              <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>{student.department}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block">Academic Year</span>
                <span className="font-semibold text-white">{student.year}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block">Semester</span>
                <span className="font-bold text-[#00F0FF]">Semester {student.semester || 1}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Phone Number</span>
              <span className="font-mono text-white flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-accent-emerald" />
                <span>{student.phoneNumber || 'N/A'}</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Verification Method</span>
              <span className="text-text-secondary">
                {student.verificationMethod === 'email_otp' ? 'Institutional Email OTP' : 'Physical ID Card Scan (Manual)'}
              </span>
            </div>

            {student.idCardUrl && (
              <div className="pt-2">
                <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1.5">
                  Uploaded ID Card Scan
                </span>
                <div className="rounded-xl overflow-hidden border border-white/[0.1] max-h-32 bg-black/40 flex items-center justify-center">
                  <img src={student.idCardUrl} alt="Student ID Scan" className="max-h-32 object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Submitted Interests / Rankings */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/[0.1] bg-[#080E1D]/90">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                  <span>My Technology Interests & Priority Rankings</span>
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Domains you have prioritized for college-wide collaboration and technical sessions.
                </p>
              </div>

              {student.isValid && (
                <Link
                  href="/onboarding"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#00F0FF] hover:bg-[#00F0FF]/10 border border-[#00F0FF]/30 transition-all flex items-center gap-1.5"
                >
                  <Edit className="w-3 h-3" />
                  <span>{hasRankings ? 'Edit Rankings' : 'Select Interests'}</span>
                </Link>
              )}
            </div>

            {hasRankings ? (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {sortedRankings.map((item, idx) => {
                  const domain = DOMAIN_MAP.get(item.domainId as any);
                  const isTopRank = item.rank === 1;

                  return (
                    <div
                      key={item.domainId}
                      className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
                          style={{ backgroundColor: `${domain?.color || '#00F0FF'}20`, color: domain?.color || '#00F0FF' }}
                        >
                          #{item.rank}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{domain?.name || item.domainId}</span>
                            {isTopRank && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30">
                                Top Priority
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-text-muted">{domain?.category}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-text-muted font-mono">
                        Priority #{item.rank}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/[0.08]">
                <Sparkles className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">No Interests Ranked Yet</h4>
                <p className="text-[11px] text-text-secondary max-w-sm mx-auto mb-4">
                  {student.isValid
                    ? 'You are verified! Click below to select your technical interests from the 20 domains or take the adaptive questionnaire.'
                    : 'Once your profile is validated by GCECT Admin, you will be able to submit and prioritize your technology domains.'}
                </p>

                {student.isValid ? (
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[#050811] bg-[#00F0FF] hover:bg-[#00D2DF] text-xs shadow-md shadow-[#00F0FF]/25"
                  >
                    <span>Tell What Interests You</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs text-accent-amber bg-accent-amber/10 px-3 py-1.5 rounded-xl border border-accent-amber/25">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Unlocked automatically after Admin approval</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chrome AI Built-in Privacy Badge */}
          <ChromeAiBadge />
        </div>
      </div>
    </div>
  );
}
