'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, BarChart2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative overflow-hidden px-4 sm:px-6">
      {/* Dark Themed Atmosphere Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[380px] h-[260px] bg-accent-violet/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 right-1/3 w-[340px] h-[220px] bg-accent-cyan/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Subtle Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
        {/* Institutional Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-text-secondary mb-6 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
          <span className="font-medium text-text-primary">Government College of Engineering and Ceramic Technology</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-7xl font-black tracking-tight text-white mb-4"
        >
          BYTE{' '}
          <span className="bg-gradient-to-r from-primary via-accent-violet to-accent-cyan bg-clip-text text-transparent">
            WHAT
          </span>
        </motion.h1>

        {/* Minimal Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-text-secondary mb-10 max-w-md mx-auto leading-relaxed"
        >
          Discover your technical direction, find like-minded collaborators, and explore live college-wide analytics.
        </motion.p>

        {/* The Two Mandatory Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
        >
          <Link
            href="/onboarding"
            className="w-full sm:w-auto flex-1 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base group"
          >
            <Sparkles className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform" />
            <span>Tell What Interests You</span>
          </Link>

          <Link
            href="/analytics"
            className="w-full sm:w-auto flex-1 px-8 py-4 rounded-xl font-bold text-text-primary bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base backdrop-blur-sm"
          >
            <BarChart2 className="w-5 h-5 text-accent-cyan" />
            <span>View Analytics</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
