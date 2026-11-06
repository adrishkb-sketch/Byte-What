'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Loader2,
  ChevronRight,
  MessageSquare,
  ArrowUpDown,
  Equal,
  Check,
} from 'lucide-react';
import { getOrCreateAnonymousSessionId, clearAnonymousSessionId, getStudentInfo } from '@/lib/session';
import { Question, DomainId, StudentDomainRank } from '@/types';
import { LIKERT_OPTIONS } from '@/data/questions';
import { DOMAINS, DOMAIN_MAP } from '@/data/domains';
import { DomainIcon } from '@/components/ui/DomainIcon';

export default function QuestionnairePage() {
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [selectedLikertValue, setSelectedLikertValue] = useState<number | null>(null);
  const [freeTextNotes, setFreeTextNotes] = useState<string>('');
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [canFinishEarly, setCanFinishEarly] = useState<boolean>(false);

  // Pre-submission review state
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [reviewRanks, setReviewRanks] = useState<Record<DomainId, number>>({} as any);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [calculatingResults, setCalculatingResults] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Initial Load
  useEffect(() => {
    const id = getOrCreateAnonymousSessionId();
    setSessionId(id);

    async function initSession() {
      try {
        setLoading(true);
        const res = await fetch('/api/questionnaire/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: id }),
        });

        const json = await res.json();
        if (json.success) {
          setQuestionsAnswered(json.data.responsesCount || 0);
          if (json.data.nextQuestion) {
            setCurrentQuestion(json.data.nextQuestion);
            if (json.data.responsesCount >= 10) {
              setCanFinishEarly(true);
            }
          } else {
            // Already ready to complete
            initiateReviewStep(id);
          }
        } else {
          setErrorMsg(json.error || 'Failed to start session');
        }
      } catch (err: any) {
        setErrorMsg('Network error communicating with BYTE WHAT server.');
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  async function handleAnswerSubmit() {
    if (!currentQuestion) return;

    if (currentQuestion.isUniversal && !selectedOptionId) return;
    if (!currentQuestion.isUniversal && selectedLikertValue === null) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/questionnaire/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          selectedOptionId: currentQuestion.isUniversal ? selectedOptionId : undefined,
          numericValue: !currentQuestion.isUniversal ? selectedLikertValue : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        const count = json.data.questionsAnswered;
        setQuestionsAnswered(count);
        setCanFinishEarly(json.data.canFinishEarly);

        setSelectedOptionId('');
        setSelectedLikertValue(null);

        if (json.data.isReadyToComplete || !json.data.nextQuestion) {
          initiateReviewStep(sessionId);
        } else {
          setCurrentQuestion(json.data.nextQuestion);
        }
      } else {
        setErrorMsg(json.error || 'Failed to record answer.');
      }
    } catch (err) {
      setErrorMsg('Failed to record answer. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  // Pre-submission review step: calculate provisional rankings across all 20 domains
  async function initiateReviewStep(targetSessionId: string) {
    setCalculatingResults(true);
    try {
      const res = await fetch('/api/questionnaire/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: targetSessionId,
          optionalStudentNotes: freeTextNotes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        const calculatedScores = json.data.allDomainScores || [];
        // Map calculated domain order to initial ranks 1 to 20
        const initialRanks: Record<DomainId, number> = {} as any;
        calculatedScores.forEach((item: any, idx: number) => {
          initialRanks[item.domainId as DomainId] = idx + 1;
        });

        // Ensure all 20 domains are present
        DOMAINS.forEach((d, idx) => {
          if (initialRanks[d.id] === undefined) {
            initialRanks[d.id] = idx + 1;
          }
        });

        setReviewRanks(initialRanks);
        setIsReviewing(true);
      } else {
        setErrorMsg(json.error || 'Failed to calculate results');
      }
    } catch (err) {
      setErrorMsg('Error calculating initial results. Please try again.');
    } finally {
      setCalculatingResults(false);
    }
  }

  function updateRank(domainId: DomainId, newRank: number) {
    const valid = Math.max(1, Math.min(20, newRank));
    setReviewRanks((prev) => ({
      ...prev,
      [domainId]: valid,
    }));
  }

  // Final confirmation and submission to Supabase/repository
  async function handleFinalReviewSubmit() {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const studentInfo = getStudentInfo();
      const rankingsPayload: StudentDomainRank[] = (Object.keys(reviewRanks) as DomainId[]).map((domId) => ({
        domainId: domId,
        rank: reviewRanks[domId],
      }));

      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentInfo?.name || 'Anonymous Student',
          department: studentInfo?.department || 'Engineering',
          year: studentInfo?.year || '1st Year',
          phoneNumber: studentInfo?.phoneNumber || 'N/A',
          pathChosen: 'questionnaire',
          rankings: rankingsPayload,
        }),
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save submission.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    if (confirm('Start afresh with a new anonymous questionnaire session?')) {
      clearAnonymousSessionId();
      window.location.reload();
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <h2 className="text-lg font-bold text-white">Preparing Adaptive Engine...</h2>
      </div>
    );
  }

  if (calculatingResults) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent-violet flex items-center justify-center mb-6 shadow-xl shadow-primary/30">
          <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Analyzing Your Preferences</h2>
        <p className="text-xs text-text-secondary mt-2 leading-relaxed">
          Evaluating your responses to curate an initial priority order across all 20 technology categories...
        </p>
      </div>
    );
  }

  // Pre-submission review screen: user can re-rank or tie categories
  if (isReviewing) {
    const sortedDomains = DOMAINS.slice().sort((a, b) => {
      return (reviewRanks[a.id] || 99) - (reviewRanks[b.id] || 99);
    });

    if (isSubmitted) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 flex-1 flex flex-col justify-center text-center">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-accent-emerald/20 border border-accent-emerald/30 flex items-center justify-center mx-auto mb-4 text-accent-emerald">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Submission Recorded!</h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto mb-6 leading-relaxed">
              Your questionnaire results and finalized category priorities have been recorded to the community database.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/analytics')}
                className="px-8 py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover transition-all text-sm shadow-lg shadow-primary/25 flex items-center gap-2"
              >
                <span>View Submissions & Analytics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 w-full">
        <div className="glass-panel p-6 sm:p-10 rounded-3xl mb-8">
          <div className="mb-6">
            <span className="text-xs font-bold text-accent-cyan uppercase tracking-wider">Review & Prioritize</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Your 20 Technology Categories — Order & Tie
            </h1>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              Here is your calculated category ranking based on your questionnaire answers. You can manually adjust any rank number, re-order priority, or set the same rank to tie categories!
            </p>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 mb-6">
            {sortedDomains.map((domain) => {
              const currentRank = reviewRanks[domain.id];
              const isTied = DOMAINS.some((other) => other.id !== domain.id && reviewRanks[other.id] === currentRank);

              return (
                <div
                  key={domain.id}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
                    >
                      <DomainIcon name={domain.iconName} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{domain.name}</h4>
                      <span className="text-[10px] text-text-muted">{domain.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end flex-shrink-0">
                    {isTied && (
                      <span className="text-[10px] font-semibold text-accent-amber px-2 py-0.5 rounded bg-accent-amber/10 border border-accent-amber/30 flex items-center gap-1">
                        <Equal className="w-3 h-3" />
                        <span>Tied Rank</span>
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-text-muted font-medium">Rank:</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={currentRank}
                        onChange={(e) => updateRank(domain.id, parseInt(e.target.value) || 1)}
                        className="w-14 bg-[#080D18] border border-white/[0.15] rounded-lg px-2 py-1 text-xs text-center text-white font-mono font-bold focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <p className="text-xs text-accent-rose bg-accent-rose/10 p-2.5 rounded-lg border border-accent-rose/20 mb-4">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
            <span className="text-xs text-text-muted">
              Confirm your rankings to proceed to live analytics.
            </span>
            <button
              onClick={handleFinalReviewSubmit}
              disabled={submitting}
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 transition-all text-xs disabled:opacity-40 shadow-lg shadow-primary/25"
            >
              {submitting ? 'Submitting...' : 'Confirm & View Analytics'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const estimatedTotal = questionsAnswered < 12 ? 'approximately 12–18' : questionsAnswered < 20 ? 'approximately 20' : 'up to 30';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-16 w-full flex-1 flex flex-col justify-center">
      {/* Top Header & Adaptive Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">Question {questionsAnswered + 1}</span>
            <span className="text-text-muted">of {estimatedTotal}</span>
          </div>
          <div className="flex items-center gap-3">
            {canFinishEarly && (
              <button
                onClick={() => initiateReviewStep(sessionId)}
                className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1"
              >
                <span>Review & Rank Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleReset}
              className="text-text-muted hover:text-white transition-colors p-1"
              title="Reset questionnaire"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-accent-violet h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, Math.max(5, (questionsAnswered / 20) * 100))}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="glass-panel p-6 sm:p-8 rounded-3xl relative"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/[0.04] text-text-muted border border-white/[0.06]">
                {currentQuestion.isUniversal ? 'Universal Preference' : 'Domain Deep-Dive'}
              </span>
              <span className="text-xs font-mono text-text-muted">{currentQuestion.code}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-snug">
              {currentQuestion.text}
            </h2>

            {/* Universal Question Options */}
            {currentQuestion.isUniversal && currentQuestion.options ? (
              <div className="space-y-2.5 mb-8">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOptionId(option.id)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/10'
                          : 'bg-white/[0.03] border-white/[0.06] text-text-secondary hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <span>{option.text}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary' : 'border-white/20'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Likert Scale for Domain Questions */
              <div className="mb-8">
                <p className="text-xs text-text-muted mb-3 font-medium">Rate how strongly you agree with this statement:</p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {LIKERT_OPTIONS.map((opt) => {
                    const isSelected = selectedLikertValue === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedLikertValue(opt.value)}
                        className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-primary/25 border-primary text-white shadow-md shadow-primary/15 scale-[1.02]'
                            : 'bg-white/[0.03] border-white/[0.06] text-text-secondary hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <span className="text-base font-bold mb-1">{opt.value}</span>
                        <span className="text-[11px] leading-tight font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-accent-rose mb-4 bg-accent-rose/10 p-2.5 rounded-lg border border-accent-rose/20">
                {errorMsg}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => setShowNotesModal(true)}
                className="text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Add Optional Custom Interests Note</span>
              </button>

              <button
                onClick={handleAnswerSubmit}
                disabled={
                  submitting ||
                  (currentQuestion.isUniversal ? !selectedOptionId : selectedLikertValue === null)
                }
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-primary/20"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Free-form notes modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-lg w-full">
            <h3 className="text-base font-bold text-white mb-2">Optional: Describe in Your Own Words</h3>
            <textarea
              value={freeTextNotes}
              onChange={(e) => setFreeTextNotes(e.target.value)}
              placeholder="e.g., I'm really curious about combining Web3 cryptography with ceramic material supply chain tracking..."
              className="w-full h-28 bg-[#080D18] border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary resize-none mb-4"
              maxLength={1000}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
