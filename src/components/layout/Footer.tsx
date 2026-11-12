import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-primary/10 bg-[#050811] text-text-secondary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/bytemonk-logo.png"
            alt="ByteMonk Logo"
            className="w-6 h-6 rounded object-cover border border-primary/30"
          />
          <span className="text-white font-bold tracking-wider">BYTE WHAT</span>
          <span className="text-primary/75 font-mono text-[11px]">(An initiative under ByteMonk)</span>
          <span>• Government College of Engineering and Ceramic Technology (GCECT)</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/analytics" className="hover:text-primary transition-colors">
            Live Analytics
          </Link>
          <Link href="/account" className="hover:text-primary transition-colors">
            My Account
          </Link>
          <Link href="/admin" className="hover:text-primary transition-colors">
            Admin Portal
          </Link>
          <Link href="/onboarding" className="text-primary hover:underline font-semibold">
            Tell What Interests You
          </Link>
        </div>
      </div>
    </footer>
  );
};
