'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import { checkChromeAIAvailability, ChromeAICapabilities } from '@/lib/ai/chrome-ai';

export const ChromeAiBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [capabilities, setCapabilities] = useState<ChromeAICapabilities | null>(null);

  useEffect(() => {
    checkChromeAIAvailability().then(setCapabilities);
  }, []);

  const isNanoActive = capabilities?.available ?? false;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-[11px] text-primary">
        <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
        <span>{isNanoActive ? 'Chrome AI (On-Device Nano)' : 'Local On-Device AI'}</span>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-2xl bg-[#080E1D]/90 border border-[#00F0FF]/25 backdrop-blur-md flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] flex items-center justify-center flex-shrink-0">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">
              {isNanoActive ? 'Chrome Built-in AI Active' : 'On-Device Client AI'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
          </div>
          <p className="text-[11px] text-text-muted">
            All text inputs and answers are evaluated on your local machine to protect student PII. Zero personal data is sent to cloud LLMs.
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20">
        <ShieldCheck className="w-3 h-3 text-[#00F0FF]" />
        <span>PII PROTECTED</span>
      </div>
    </div>
  );
};
