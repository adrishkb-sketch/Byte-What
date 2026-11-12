'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Please enter the admin security password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin');
      } else {
        setErrorMsg(data.error || 'Access denied. Incorrect password.');
      }
    } catch {
      setErrorMsg('Network error communicating with authentication service.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="glass-panel p-8 sm:p-10 rounded-3xl max-w-md w-full relative z-10 border border-primary/20 shadow-2xl shadow-black/60">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <img
              src="/bytemonk-logo.png"
              alt="ByteMonk Official Logo"
              className="w-16 h-16 rounded-2xl object-cover mx-auto border border-primary/40 shadow-xl shadow-primary/25"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#050811] border border-primary/40 flex items-center justify-center text-primary">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">BYTEMONK ADMIN</h1>
          <p className="text-xs text-text-secondary mt-1">
            GCECT Collegiate Data & Student Profile Control Center
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>Admin Master Password</span>
              </span>
              <span className="text-[10px] text-text-muted font-mono">GCECT Staff / Admin</span>
            </label>
            <input
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter master password..."
              className="w-full bg-[#050811] border border-white/[0.12] rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/25 text-accent-rose text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-3.5 rounded-xl font-bold text-[#050811] bg-primary hover:bg-primary-hover disabled:opacity-40 transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

