import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#080D18] text-text-secondary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-primary to-accent-violet flex items-center justify-center text-white font-bold font-mono text-xs">
            BW
          </div>
          <span className="text-white font-semibold">BYTE WHAT</span>
          <span>• Government College of Engineering and Ceramic Technology</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/analytics" className="hover:text-white transition-colors">
            Analytics
          </Link>
          <Link href="/onboarding" className="text-primary-light hover:underline font-medium">
            Tell What Interests You
          </Link>
        </div>
      </div>
    </footer>
  );
};
