'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(redirectPath);
      } else {
        setErrorMsg(data.error || 'Invalid email or password.');
        setLoading(false);
      }
    } catch {
      setErrorMsg('Network error logging in.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
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
          Student Login
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Sign in to your GCECT account to manage your profile and technology interest rankings.
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

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gcect.ac.in"
                className="w-full bg-[#050811] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#050811] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-[#050811] bg-[#00F0FF] hover:bg-[#00D2DF] transition-all shadow-lg shadow-[#00F0FF]/30 disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/[0.08] text-center space-y-2">
          <p className="text-xs text-text-muted">
            Don&apos;t have a student account yet?{' '}
            <Link href="/signup" className="text-[#00F0FF] hover:underline font-semibold">
              Sign Up here
            </Link>
          </p>
          <div>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-[11px] text-text-muted hover:text-white transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-accent-violet" />
              <span>Are you a Faculty/Admin? Login to Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin mx-auto mb-3" />
          <p className="text-xs text-text-muted">Loading login form...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
