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
} from 'lucide-react';
import { getOrCreateAnonymousSessionId, clearAnonymousSessionId, getStudentInfo } from '@/lib/session';
import { Question, QuestionType } from '@/types';
import { LIKERT_OPTIONS } from '@/data/questions';

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

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [calculatingResults, setCalculatingResults] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 1. Initial Load: Initialize or resume anonymous session
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
            finishAndCalculate(id);
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

  // 2. Submit Answer to Current Question
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

        // Reset inputs
        setSelectedOptionId('');
        setSelectedLikertValue(null);

        if (json.data.isReadyToComplete || !json.data.nextQuestion) {
          // Automatic completion threshold reached
          finishAndCalculate(sessionId);
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

  // 3. Finalize and calculate deterministic results + AI explanation
  async function finishAndCalculate(targetSessionId: string) {
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
        // Auto-create/upsert ByteMates profile if student info is present
        const studentInfo = getStudentInfo();
        if (studentInfo && studentInfo.name) {
          const topDomains = json.data.primaryInterests.map((p: any) => p.domainId);
          await fetch('/api/bytemates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              anonymousSessionId: targetSessionId,
              displayName: studentInfo.name,
              bio: `${studentInfo.year} • ${studentInfo.department}`,
              discoverable: true,
              primaryDomains: topDomains,
              secondaryDomains: json.data.secondaryInterests.map((s: any) => s.domainId),
              skills: [],
            }),
          }).catch(() => {});
        }

        router.push(`/discover/results?sessionId=${targetSessionId}`);
      } else {
        setErrorMsg(json.error || 'Failed to calculate results');
        setCalculatingResults(false);
      }
    } catch (err) {
      setErrorMsg('Error finalizing results. Please try again.');
      setCalculatingResults(false);
    }
  }

  // Restart questionnaire
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
        <p className="text-xs text-text-muted mt-1">Retrieving question bank and local anonymous session</p>
      </div>
    );
  }

  if (calculatingResults) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent-violet flex items-center justify-center mb-6 shadow-xl shadow-primary/30">
          <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Synthesizing Your Interests</h2>
        <p className="text-xs text-text-secondary mt-2 leading-relaxed">
          Running deterministic scoring across all 20 domains, computing confidence indices, and querying Gemini for personalized cross-domain project ideas...
        </p>
        <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden mt-6">
          <div className="h-full bg-gradient-to-r from-primary to-accent-cyan animate-pulse rounded-full w-3/4" />
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
                onClick={() => finishAndCalculate(sessionId)}
                className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1"
              >
                <span>Calculate Results Now</span>
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

        {/* Progress bar */}
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
            {/* Domain Hint or Universal Label */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/[0.04] text-text-muted border border-white/[0.06]">
                {currentQuestion.isUniversal ? 'Universal Preference' : 'Domain Deep-Dive'}
              </span>
              <span className="text-xs font-mono text-text-muted">{currentQuestion.code}</span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-snug">
              {currentQuestion.text}
            </h2>

            {/* Options */}
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
              /* 5-Point Likert Scale for Domain Questions */
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

            {/* Error Message */}
            {errorMsg && (
              <p className="text-xs text-accent-rose mb-4 bg-accent-rose/10 p-2.5 rounded-lg border border-accent-rose/20">
                {errorMsg}
              </p>
            )}

            {/* Actions */}
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

      {/* Optional Free-Form Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-lg w-full">
            <h3 className="text-base font-bold text-white mb-2">Optional: Describe in Your Own Words</h3>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Have unique interests not captured by fixed questions? e.g., &ldquo;I love building robots, but I care more about the AI algorithms than mechanical framing.&rdquo; Gemini will interpret your note alongside your scores.
            </p>
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

