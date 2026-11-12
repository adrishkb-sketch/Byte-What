'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
  GripVertical,
  Mail,
  Upload,
  Camera,
  ShieldCheck,
  Loader2,
  AlertCircle,
  FileText,
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
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function OnboardingPage() {
  const router = useRouter();

  // Step 1: Student Details & Verification
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [year, setYear] = useState(YEARS[0]);
  const [semester, setSemester] = useState<number>(1);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Verification options: 'email' (College Email + OTP) vs 'id_card' (Upload ID card + AI Vision)
  const [verificationMethod, setVerificationMethod] = useState<'email_otp' | 'id_card_ai'>('email_otp');

  // Email OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');

  // College ID Card AI Vision state
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string>('');
  const [verifyingIdCard, setVerifyingIdCard] = useState(false);
  const [idCardVerified, setIdCardVerified] = useState(false);
  const [aiVerificationDetails, setAiVerificationDetails] = useState<any>(null);

  // Step state: 'details' -> 'choice' -> 'ranking' -> 'submitted'
  const [step, setStep] = useState<'details' | 'choice' | 'ranking' | 'submitted'>('details');

  // Chosen domains and their ranks
  const [domainRanks, setDomainRanks] = useState<Record<DomainId, number>>({} as any);
  const [orderedSelectedIds, setOrderedSelectedIds] = useState<DomainId[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function checkAuthAndProfile() {
      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();
        if (json.success && json.data) {
          const s = json.data;
          if (!s.isValid) {
            router.push('/account');
            return;
          }
          setName(s.name);
          setEmail(s.email || '');
          setDepartment(s.department);
          setYear(s.year);
          setSemester(s.semester || 1);
          setPhoneNumber(s.phoneNumber || '');
          setEmailVerified(true);

          if (s.rankings && s.rankings.length > 0) {
            const ranks: Record<DomainId, number> = {} as any;
            const ids: DomainId[] = [];
            const sorted = [...s.rankings].sort((a: any, b: any) => a.rank - b.rank);
            sorted.forEach((r: any) => {
              ids.push(r.domainId as DomainId);
              ranks[r.domainId as DomainId] = r.rank;
            });
            setOrderedSelectedIds(ids);
            setDomainRanks(ranks);
          }
          setStep('choice');
        } else {
          router.push('/login?redirect=/onboarding');
        }
      } catch {
        router.push('/login?redirect=/onboarding');
      }
    }
    checkAuthAndProfile();
  }, [router]);

  function handleYearChange(newYear: string) {
    setYear(newYear);
    if (newYear === '1st Year') setSemester(1);
    else if (newYear === '2nd Year') setSemester(3);
    else if (newYear === '3rd Year') setSemester(5);
    else if (newYear === '4th Year') setSemester(7);
  }

  async function handleSendOtp() {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid college email address.');
      return;
    }
    setErrorMsg('');
    setSendingOtp(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setOtpMessage(data.message);
        if (data.simulatedOtp) {
          setSimulatedOtp(data.simulatedOtp);
        }
      } else {
        setErrorMsg(data.error || 'Failed to send OTP.');
      }
    } catch {
      setErrorMsg('Failed to communicate with OTP server.');
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otpCode.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    setErrorMsg('');
    setVerifyingOtp(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailVerified(true);
        setOtpMessage('✓ College email verified successfully!');
      } else {
        setErrorMsg(data.error || 'Invalid OTP code.');
      }
    } catch {
      setErrorMsg('Failed to verify OTP.');
    } finally {
      setVerifyingOtp(false);
    }
  }

  function handleIdCardImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdCardFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdCardPreview(reader.result as string);
      setIdCardVerified(false);
      setAiVerificationDetails(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleVerifyIdCardWithAi() {
    if (!idCardPreview) {
      setErrorMsg('Please upload a photo of your GCECT college ID card first.');
      return;
    }
    setErrorMsg('');
    setVerifyingIdCard(true);
    try {
      const res = await fetch('/api/auth/verify-id-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: idCardPreview,
          mimeType: idCardFile?.type || 'image/jpeg',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiVerificationDetails(json.data);
        if (json.data.isGcectCard) {
          setIdCardVerified(true);
          if (json.data.detectedName && !name.trim()) {
            setName(json.data.detectedName);
          }
        } else {
          setErrorMsg(json.data.reasoning || 'Could not verify GCECT ID card. Will be reviewed by admin.');
        }
      } else {
        setErrorMsg('AI verification failed. Admin will review manually.');
      }
    } catch {
      setErrorMsg('Network error verifying ID card. Admin will review manually.');
    } finally {
      setVerifyingIdCard(false);
    }
  }

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) {
      setErrorMsg('Please enter your full name and phone number.');
      return;
    }

    setErrorMsg('');
    saveStudentInfo({
      name: name.trim(),
      email: email.trim() || undefined,
      department,
      year,
      semester,
      phoneNumber: phoneNumber.trim(),
      isVerified: verificationMethod === 'email_otp' ? emailVerified : idCardVerified,
      verificationMethod,
      idCardUrl: idCardPreview || undefined,
      idCardAiVerification: aiVerificationDetails || undefined,
    });

    setStep('choice');
  }

  function handleChooseQuestionnaire() {
    if (typeof window !== 'undefined') {
      const freshSessionId = `anon-${crypto.randomUUID()}`;
      localStorage.setItem('byte_what_anon_session_id', freshSessionId);
    }
    saveStudentInfo({
      name: name.trim(),
      email: email.trim() || undefined,
      department,
      year,
      semester,
      phoneNumber: phoneNumber.trim(),
      pathChosen: 'questionnaire',
      isVerified: verificationMethod === 'email_otp' ? emailVerified : idCardVerified,
      verificationMethod,
      idCardUrl: idCardPreview || undefined,
      idCardAiVerification: aiVerificationDetails || undefined,
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
        const existingValues = Object.values(copy);
        const nextRank = existingValues.length > 0 ? Math.max(...existingValues) + 1 : 1;
        copy[domainId] = nextRank;
      }
      return copy;
    });

    setOrderedSelectedIds((prevList) => {
      if (prevList.includes(domainId)) {
        return prevList.filter((id) => id !== domainId);
      }
      return [...prevList, domainId];
    });
  }

  function handleReorder(newOrder: DomainId[]) {
    const unique = Array.from(new Set(newOrder));
    setOrderedSelectedIds(unique);
    const updatedRanks: Record<DomainId, number> = { ...domainRanks };
    unique.forEach((id, idx) => {
      updatedRanks[id] = idx + 1;
    });
    setDomainRanks(updatedRanks);
  }

  function updateRank(domainId: DomainId, newRank: number) {
    const validRank = Math.max(1, Math.min(20, newRank));
    setDomainRanks((prev) => ({
      ...prev,
      [domainId]: validRank,
    }));
  }

  function tieWithPrevious(index: number) {
    if (index === 0) return;
    const prevDomainId = orderedSelectedIds[index - 1];
    const currentDomainId = orderedSelectedIds[index];
    const prevRank = domainRanks[prevDomainId];
    if (prevRank !== undefined) {
      updateRank(currentDomainId, prevRank);
    }
  }

  async function handleFinalSubmit() {
    if (orderedSelectedIds.length === 0) {
      setErrorMsg('Please select at least 1 technology domain.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const rankingsPayload: StudentDomainRank[] = orderedSelectedIds.map((domId) => ({
        domainId: domId,
        rank: domainRanks[domId] !== undefined ? domainRanks[domId] : 20,
      }));

      let res = await fetch('/api/student/rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rankings: rankingsPayload,
          pathChosen: 'self_selected',
        }),
      });

      if (!res.ok) {
        res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim() || undefined,
            department,
            year,
            semester,
            phoneNumber: phoneNumber.trim(),
            pathChosen: 'self_selected',
            rankings: rankingsPayload,
            isVerified: true,
            verificationMethod,
            idCardUrl: idCardPreview || undefined,
          }),
        });
      }

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
                  className="w-full bg-[#050811] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                    <span>Department / Stream *</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#050811] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-[#050811] text-white">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent-violet" />
                    <span>Academic Year *</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="w-full bg-[#050811] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y} className="bg-[#050811] text-white">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Semester *</span>
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full bg-[#050811] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s} className="bg-[#050811] text-white">
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-accent-emerald" />
                    <span>Phone Number *</span>
                  </span>
                  <span className="text-[10px] text-accent-cyan font-mono">For Session Alerts</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-[#050811] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] text-text-muted mt-1 block">
                  Your phone number will be stored for automated notifications when sessions matching your chosen domains are scheduled.
                </span>
              </div>

              {/* Student Verification Section */}
              <div className="pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>GCECT Student Verification</span>
                  </span>
                  {(emailVerified || idCardVerified) && (
                    <span className="text-[10px] font-bold text-accent-emerald px-2 py-0.5 rounded bg-accent-emerald/10 border border-accent-emerald/30 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                {/* Verification Method Tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
                  <button
                    type="button"
                    onClick={() => setVerificationMethod('email_otp')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      verificationMethod === 'email_otp'
                        ? 'bg-primary text-[#050811] shadow-md shadow-primary/20'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>College Email OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationMethod('id_card_ai')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      verificationMethod === 'id_card_ai'
                        ? 'bg-primary text-[#050811] shadow-md shadow-primary/20'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>AI College ID Scan</span>
                  </button>
                </div>

                {/* Option A: College Email + OTP */}
                {verificationMethod === 'email_otp' && (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. rahul.gcect@gcect.ac.in"
                        disabled={emailVerified}
                        className="flex-1 bg-[#050811] border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary disabled:opacity-60"
                      />
                      {!emailVerified && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={sendingOtp || !email.trim()}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.08] hover:bg-white/[0.15] disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
                        >
                          {sendingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send OTP'}
                        </button>
                      )}
                    </div>

                    {otpSent && !emailVerified && (
                      <div className="space-y-2 pt-1 border-t border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-36 bg-[#050811] border border-primary/30 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest text-center focus:outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || !otpCode.trim()}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-[#050811] bg-primary hover:bg-primary-hover disabled:opacity-40 transition-all flex items-center gap-1.5"
                          >
                            {verifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Code'}
                          </button>
                        </div>
                        {simulatedOtp && (
                          <p className="text-[10px] text-accent-cyan">
                            Test mode OTP code: <span className="font-mono font-bold bg-primary/20 px-1.5 py-0.5 rounded">{simulatedOtp}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {otpMessage && (
                      <p className={`text-xs ${emailVerified ? 'text-accent-emerald font-semibold' : 'text-text-secondary'}`}>
                        {otpMessage}
                      </p>
                    )}
                  </div>
                )}

                {/* Option B: Upload College ID Card + AI Vision */}
                {verificationMethod === 'id_card_ai' && (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Upload or photograph your GCECT College ID card. Our multimodal AI model will verify its authenticity.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.15] text-xs font-bold text-white transition-all flex items-center gap-2">
                        <Upload className="w-3.5 h-3.5 text-primary" />
                        <span>Choose ID Card Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIdCardImageChange}
                          className="hidden"
                        />
                      </label>

                      {idCardPreview && !idCardVerified && (
                        <button
                          type="button"
                          onClick={handleVerifyIdCardWithAi}
                          disabled={verifyingIdCard}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-[#050811] bg-primary hover:bg-primary-hover disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
                        >
                          {verifyingIdCard ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Analyzing with AI...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Verify GCECT Card with AI</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {idCardPreview && (
                      <div className="flex items-center gap-3 pt-2">
                        <img
                          src={idCardPreview}
                          alt="College ID Preview"
                          className="w-20 h-14 object-cover rounded-lg border border-primary/30"
                        />
                        <div className="text-xs">
                          {idCardVerified ? (
                            <span className="text-accent-emerald font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Original GCECT ID Card Verified! ({aiVerificationDetails?.confidence || 90}% confidence)</span>
                            </span>
                          ) : (
                            <span className="text-text-muted">
                              Card ready for AI verification. Click the button above.
                            </span>
                          )}
                          {aiVerificationDetails?.detectedName && (
                            <p className="text-[10px] text-text-secondary mt-0.5">
                              Detected Name: <strong className="text-white">{aiVerificationDetails.detectedName}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {errorMsg && (
                <p className="text-xs text-accent-rose bg-accent-rose/10 p-2.5 rounded-lg border border-accent-rose/20">
                  {errorMsg}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-[#050811] bg-primary hover:bg-primary-hover transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                >
                  <span>Continue to Interests</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 2: Choose Path (Self Selection vs Adaptive Questionnaire) */}
        {step === 'choice' && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel p-6 sm:p-10 rounded-3xl"
          >
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-accent-cyan uppercase tracking-wider">Step 2 of 2</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                How would you like to define your interests?
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Welcome, <span className="text-white font-semibold">{name}</span> ({department}, {year}).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Option A: I Know My Interests */}
              <button
                type="button"
                onClick={handleChooseSelfSelection}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-primary/50 hover:bg-primary/[0.04] transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-primary transition-colors">
                    I Already Know My Interests
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Pick your top areas from the 20 technology categories, drag & drop to reorder priority, and tie domains as needed.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <span>Direct Selection & Ranking</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option B: Not sure, take questionnaire */}
              <button
                type="button"
                onClick={handleChooseQuestionnaire}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-accent-violet/50 hover:bg-accent-violet/[0.04] transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-accent-violet/10 text-accent-violet flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-accent-violet transition-colors">
                    I&apos;m Not Sure Where to Start
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Take our smart adaptive questionnaire (12–25 questions powered by Gemini). You can re-order and tie domains before final submission.
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

        {/* STEP 3: Select from the 20 Domains, Drag & Drop Reorder, Rank Priority, and Tie */}
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
                Choose any domains from the 20 categories below. You can <strong className="text-white">drag & drop to reorder</strong>, edit rank numbers, or tie domains for equal priority!
              </p>
            </div>

            {/* 20 Domains Selection Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Choose from the 20 Domains ({orderedSelectedIds.length} selected):</span>
                <span className="text-[11px] text-text-muted">Click to select/unselect</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 border border-white/[0.06] p-2 rounded-2xl bg-[#080D18]/50">
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

            {/* Drag & Drop Reorderable List */}
            {orderedSelectedIds.length > 0 && (
              <div className="mb-6 bg-[#0B1220] p-4 rounded-2xl border border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Selected Priorities (Drag to Reorder or Tie)</span>
                  </h3>
                  <span className="text-[10px] text-text-muted">Rank 1 is highest priority</span>
                </div>

                <Reorder.Group
                  axis="y"
                  values={orderedSelectedIds}
                  onReorder={handleReorder}
                  className="space-y-2.5 max-h-72 overflow-y-auto pr-1"
                >
                  {orderedSelectedIds.map((domId, index) => {
                    const domain = DOMAIN_MAP.get(domId);
                    const currentRank = domainRanks[domId];
                    const isTied = orderedSelectedIds.some(
                      (otherId) => otherId !== domId && domainRanks[otherId] === currentRank
                    );

                    return (
                      <Reorder.Item
                        key={domId}
                        value={domId}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-grab active:cursor-grabbing hover:bg-white/[0.05] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <GripVertical className="w-4 h-4 text-text-muted flex-shrink-0" />
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

                        <div className="flex items-center gap-2.5 justify-end flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          {isTied && (
                            <span className="text-[10px] font-semibold text-accent-amber px-2 py-0.5 rounded bg-accent-amber/10 border border-accent-amber/30 flex items-center gap-1">
                              <Equal className="w-3 h-3" />
                              <span>Tied</span>
                            </span>
                          )}

                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => tieWithPrevious(index)}
                              title="Tie with category above"
                              className="text-[10px] font-medium text-text-muted hover:text-accent-cyan px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] transition-colors"
                            >
                              = Tie Above
                            </button>
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
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
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
                disabled={submitting || orderedSelectedIds.length === 0}
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
            <h2 className="text-2xl font-extrabold text-white mb-2">Registration Recorded!</h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto mb-4 leading-relaxed">
              Your details and domain priorities have been submitted. For collegiate data integrity, your profile is marked for <strong className="text-white">Admin Validation</strong> before being included in the public analytics charts.
            </p>
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/25 max-w-md mx-auto mb-6 text-left flex items-start gap-3">
              <Phone className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs text-white/90">
                <span className="font-bold text-primary block mb-0.5">Session Automation Registered</span>
                Your phone number is saved for automated notifications whenever workshops or peer sessions in your selected domains are scheduled.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push('/account')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] transition-all text-xs flex items-center justify-center gap-2"
              >
                <span>Go to My Account</span>
              </button>
              <button
                onClick={() => router.push('/analytics')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-[#050811] bg-primary hover:bg-primary-hover transition-all text-xs shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
              >
                <span>View Public Analytics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
