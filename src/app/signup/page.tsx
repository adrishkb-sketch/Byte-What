'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Calendar,
  Phone,
  Upload,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { ChromeAiBadge } from '@/components/ui/ChromeAiBadge';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Ceramic Technology',
  'Other / Interdisciplinary',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [year, setYear] = useState(YEARS[0]);
  const [semester, setSemester] = useState<number>(1);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Verification options
  const [verificationMethod, setVerificationMethod] = useState<'email_otp' | 'manual_id_card'>('manual_id_card');

  // Email OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  // Manual College ID Card Scan state
  const [idCardPreview, setIdCardPreview] = useState<string>('');
  const [idCardFileName, setIdCardFileName] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        setOtpMessage('6-digit OTP code sent. Valid for 10 minutes.');
      } else {
        setErrorMsg(data.error || 'Failed to send OTP.');
      }
    } catch {
      setErrorMsg('Network error while requesting OTP.');
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    setErrorMsg('');
    setVerifyingOtp(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otpCode: otpCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailVerified(true);
      } else {
        setErrorMsg(data.error || 'Invalid OTP code.');
      }
    } catch {
      setErrorMsg('Verification failed.');
    } finally {
      setVerifyingOtp(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('ID card image must be smaller than 5MB.');
      return;
    }

    setIdCardFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = () => {
      setIdCardPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) return setErrorMsg('Please enter your full name.');
    if (!email.trim() || !email.includes('@')) return setErrorMsg('Please enter a valid email.');
    if (!password || password.length < 6) return setErrorMsg('Password must be at least 6 characters.');
    if (!phoneNumber.trim()) return setErrorMsg('Please enter your contact phone number.');

    if (verificationMethod === 'manual_id_card' && !idCardPreview) {
      return setErrorMsg('Please upload an image of your physical GCECT College ID card for manual review.');
    }

    if (verificationMethod === 'email_otp' && !emailVerified) {
      return setErrorMsg('Please verify your college email address with the 6-digit OTP.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          department,
          year,
          semester: Number(semester),
          phoneNumber: phoneNumber.trim(),
          verificationMethod,
          idCardUrl: idCardPreview || undefined,
          isVerified: emailVerified,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/account');
      } else {
        setErrorMsg(data.error || 'Registration failed.');
        setLoading(false);
      }
    } catch {
      setErrorMsg('Network error creating student account.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
      {/* Brand header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <img
            src="/bytemonk-logo.png"
            alt="ByteMonk Official Logo"
            className="w-10 h-10 rounded-xl object-cover border border-[#00F0FF]/40 shadow-lg shadow-[#00F0FF]/20 group-hover:scale-105 transition-all"
          />
          <div className="text-left">
            <span className="text-lg font-extrabold text-white tracking-wider block">BYTE WHAT</span>
            <span className="text-[10px] text-[#00F0FF] font-mono">An initiative under ByteMonk</span>
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Student Account
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Register with GCECT credentials. Once verified by admin, you will unlock technology domain interest selection.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] bg-[#080E1D]/90 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-accent-rose/15 border border-accent-rose/30 text-accent-rose text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adrish Sarkar"
                className="w-full bg-[#050811] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Institutional / College Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@gcect.ac.in"
                className="w-full bg-[#050811] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[#050811] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Department</label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#050811] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-[#050811] text-white">
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Year & Semester Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Academic Year</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full bg-[#050811] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y} className="bg-[#050811] text-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Semester (1–8)</label>
              <div className="relative">
                <Layers className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full bg-[#050811] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F0FF]"
                >
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s} className="bg-[#050811] text-white">
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-secondary">Phone Number</label>
              <span className="text-[10px] text-[#00F0FF] font-medium">For interest session alerts</span>
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-[#050811] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          {/* Student Verification Method Selection */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
              <span>GCECT Identity Verification</span>
            </label>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setVerificationMethod('manual_id_card')}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                  verificationMethod === 'manual_id_card'
                    ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-md shadow-[#00F0FF]/20'
                    : 'bg-white/[0.02] border-white/[0.08] text-text-muted hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4 text-[#00F0FF]" />
                <span>Upload ID Card (Manual Scan)</span>
              </button>

              <button
                type="button"
                onClick={() => setVerificationMethod('email_otp')}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                  verificationMethod === 'email_otp'
                    ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-md shadow-[#00F0FF]/20'
                    : 'bg-white/[0.02] border-white/[0.08] text-text-muted hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4 text-accent-violet" />
                <span>College Email OTP</span>
              </button>
            </div>

            {/* TAB A: Manual ID Card Scan */}
            {verificationMethod === 'manual_id_card' && (
              <div className="p-4 rounded-2xl bg-[#050811] border border-white/[0.08] space-y-3">
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Upload a photo or scan of your physical GCECT student ID card. GCECT Admin will manually inspect this scan to approve your profile.
                </p>

                {idCardPreview ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-[#00F0FF]/30 max-h-48 flex items-center justify-center bg-black/60">
                      <img src={idCardPreview} alt="ID Card Scan" className="max-h-48 object-contain" />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-text-muted truncate max-w-xs font-mono">{idCardFileName}</span>
                      <label className="text-[#00F0FF] hover:underline cursor-pointer font-semibold">
                        Change Photo
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-white/[0.15] hover:border-[#00F0FF]/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.02]">
                    <Upload className="w-6 h-6 text-[#00F0FF] mb-2" />
                    <span className="text-xs font-bold text-white">Click to upload College ID Scan</span>
                    <span className="text-[10px] text-text-muted mt-0.5">JPG, PNG, or WebP up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            )}

            {/* TAB B: College Email OTP */}
            {verificationMethod === 'email_otp' && (
              <div className="p-4 rounded-2xl bg-[#050811] border border-white/[0.08] space-y-3">
                <p className="text-[11px] text-text-secondary">
                  We will send a 6-digit confirmation code to your institutional email.
                </p>

                {!emailVerified ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || !email.trim()}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-[#050811] bg-[#00F0FF] hover:bg-[#00D2DF] disabled:opacity-50"
                      >
                        {sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send 6-Digit OTP'}
                      </button>
                    </div>

                    {otpSent && (
                      <div className="space-y-2 pt-2">
                        {otpMessage && <p className="text-[11px] text-[#00F0FF]">{otpMessage}</p>}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            className="bg-[#080E1D] border border-white/[0.15] rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest text-center focus:border-[#00F0FF]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || otpCode.length < 6}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-accent-violet hover:bg-accent-violet/90 disabled:opacity-50"
                          >
                            {verifyingOtp ? 'Verifying...' : 'Verify Code'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">Email Verified Successfully</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Privacy Badge */}
          <ChromeAiBadge />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-[#050811] bg-[#00F0FF] hover:bg-[#00D2DF] transition-all shadow-lg shadow-[#00F0FF]/30 disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text-muted">
          Already have a student account?{' '}
          <Link href="/login" className="text-[#00F0FF] hover:underline font-semibold">
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
}
