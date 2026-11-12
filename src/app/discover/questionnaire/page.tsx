'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
  GripVertical,
  Bot,
  Plus,
  X,
} from 'lucide-react';
import { getOrCreateAnonymousSessionId, clearAnonymousSessionId, getStudentInfo } from '@/lib/session';
import { Question, DomainId, StudentDomainRank, UserResponse } from '@/types';
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

  // Client-side record of answers to eliminate any session loss
  const [clientResponses, setClientResponses] = useState<UserResponse[]>([]);

  // Pre-submission review state
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [orderedDomainIds, setOrderedDomainIds] = useState<DomainId[]>([]);
  const [reviewRanks, setReviewRanks] = useState<Record<DomainId, number>>({} as any);
  const [aiRationale, setAiRationale] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [selectedAddDomain, setSelectedAddDomain] = useState<DomainId | ''>('');

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
          const count = json.data.responsesCount || 0;
          setQuestionsAnswered(count);
          if (json.data.nextQuestion) {
            setCurrentQuestion(json.data.nextQuestion);
            if (count >= 20) {
              setCanFinishEarly(true);
            }
          } else if (count >= 20) {
            // Already answered 20+ questions in this session
            initiateReviewStep(id, []);
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

    const newResponse: UserResponse = {
      questionId: currentQuestion.id,
      selectedOptionId: currentQuestion.isUniversal ? selectedOptionId : undefined,
      numericValue: !currentQuestion.isUniversal ? selectedLikertValue! : undefined,
      timestamp: new Date().toISOString(),
    };

    const updatedResponses = [...clientResponses, newResponse];
    setClientResponses(updatedResponses);

    try {
      const res = await fetch('/api/questionnaire/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          selectedOptionId: currentQuestion.isUniversal ? selectedOptionId : undefined,
          numericValue: !currentQuestion.isUniversal ? selectedLikertValue : undefined,
          clientHistory: updatedResponses,
        }),
      });

      const json = await res.json();
      if (json.success) {
        const count = json.data.questionsAnswered;
        setQuestionsAnswered(count);
        setCanFinishEarly(json.data.canFinishEarly);

        setSelectedOptionId('');
        setSelectedLikertValue(null);

        const isComplete = count >= 25 || (count >= 20 && (json.data.isReadyToComplete || !json.data.nextQuestion));

        if (isComplete) {
          initiateReviewStep(sessionId, updatedResponses);
        } else if (json.data.nextQuestion) {
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

  // Pre-submission review step: calculate provisional rankings for genuine interests only
  async function initiateReviewStep(targetSessionId: string, historyResponses?: UserResponse[]) {
    setCalculatingResults(true);
    try {
      const res = await fetch('/api/questionnaire/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: targetSessionId,
          responses: historyResponses || clientResponses,
          optionalStudentNotes: freeTextNotes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        const initialRanks: Record<DomainId, number> = {} as any;
        const uniqueSet = new Set<DomainId>();
        const uniqueOrderedList: DomainId[] = [];

        const registerDomain = (domId: DomainId, rank: number) => {
          if (DOMAIN_MAP.has(domId) && !uniqueSet.has(domId)) {
            uniqueSet.add(domId);
            uniqueOrderedList.push(domId);
            initialRanks[domId] = rank;
          }
        };

        // 1. If Gemini rankings or fallback ranks are returned (ranked genuine interests only)
        if (json.data.geminiRankings && Array.isArray(json.data.geminiRankings) && json.data.geminiRankings.length > 0) {
          const sortedGemini = [...json.data.geminiRankings].sort((a: any, b: any) => (a.rank ?? 99) - (b.rank ?? 99));
          sortedGemini.forEach((item: any) => {
            registerDomain(item.domainId as DomainId, item.rank ?? (uniqueOrderedList.length + 1));
          });
        } else if (json.data.allDomainScores && Array.isArray(json.data.allDomainScores)) {
          // 2. Fall back to deterministic scores: only include domains with genuine positive interest
          const genuine = json.data.allDomainScores.filter((s: any) => s.interestScore >= 20 && s.evidenceCount > 0);
          const listToUse = genuine.length >= 2
            ? genuine
            : json.data.allDomainScores.filter((s: any) => s.interestScore > 0).slice(0, 3);

          listToUse.forEach((item: any, idx: number) => {
            registerDomain(item.domainId as DomainId, idx + 1);
          });
        }

        // If no domains qualified, take top 3 as fallback
        if (uniqueOrderedList.length === 0 && json.data.allDomainScores) {
          json.data.allDomainScores.slice(0, 3).forEach((item: any, idx: number) => {
            registerDomain(item.domainId as DomainId, idx + 1);
          });
        }

        if (json.data.writtenExplanation) {
          setAiRationale(json.data.writtenExplanation);
        }

        setReviewRanks(initialRanks);
        setOrderedDomainIds(uniqueOrderedList);
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

  function handleRemoveDomain(domainId: DomainId) {
    if (orderedDomainIds.length <= 1) {
      setErrorMsg('You must have at least 1 interest category.');
      return;
    }
    const updated = orderedDomainIds.filter((id) => id !== domainId);
    setOrderedDomainIds(updated);
    setReviewRanks((prev) => {
      const copy = { ...prev };
      delete copy[domainId];
      return copy;
    });
  }

  function handleAddDomain(domainId: DomainId) {
    if (!domainId || orderedDomainIds.includes(domainId)) return;
    const updated = [...orderedDomainIds, domainId];
    setOrderedDomainIds(updated);
    const existingValues = Object.values(reviewRanks);
    const nextRank = existingValues.length > 0 ? Math.max(...existingValues) + 1 : 1;
    setReviewRanks((prev) => ({
      ...prev,
      [domainId]: nextRank,
    }));
  }

  // Handle Drag-and-Drop reorder
  function handleReorder(newOrder: DomainId[]) {
    const deduplicated = Array.from(new Set(newOrder));
    setOrderedDomainIds(deduplicated);
    const updatedRanks: Record<DomainId, number> = { ...reviewRanks };
    deduplicated.forEach((domId, idx) => {
      updatedRanks[domId] = idx + 1;
    });
    setReviewRanks(updatedRanks);
  }

  // Update specific rank number (allowing ties)
  function updateRank(domainId: DomainId, newRank: number) {
    const valid = Math.max(1, Math.min(20, newRank));
    setReviewRanks((prev) => ({
      ...prev,
      [domainId]: valid,
    }));
  }

  // Tie with the domain directly above it in the list
  function tieWithPrevious(index: number) {
    if (index === 0) return;
    const prevDomainId = orderedDomainIds[index - 1];
    const currentDomainId = orderedDomainIds[index];
    const prevRank = reviewRanks[prevDomainId];
    if (prevRank !== undefined) {
      updateRank(currentDomainId, prevRank);
    }
  }

  // Final confirmation and submission to Supabase/repository
  async function handleFinalReviewSubmit() {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const studentInfo = getStudentInfo();
      const rankingsPayload: StudentDomainRank[] = orderedDomainIds.map((domId) => ({
        domainId: domId,
        rank: reviewRanks[domId] !== undefined ? reviewRanks[domId] : 20,
      }));

      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentInfo?.name || 'Anonymous Student',
          email: studentInfo?.email || undefined,
          department: studentInfo?.department || 'Engineering',
          year: studentInfo?.year || '1st Year',
          semester: studentInfo?.semester || 1,
          phoneNumber: studentInfo?.phoneNumber || 'N/A',
          pathChosen: 'questionnaire',
          rankings: rankingsPayload,
          isVerified: studentInfo?.isVerified || false,
          verificationMethod: studentInfo?.verificationMethod || 'email_otp',
          idCardUrl: studentInfo?.idCardUrl || undefined,
          idCardAiVerification: studentInfo?.idCardAiVerification || undefined,
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
          Gemini is analyzing your responses and identifying your genuine technological interests...
        </p>
      </div>
    );
  }

  // Pre-submission review screen: user can drag & drop, re-rank, or tie categories
  if (isReviewing) {
    if (isSubmitted) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 flex-1 flex flex-col justify-center text-center">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-accent-emerald/20 border border-accent-emerald/30 flex items-center justify-center mx-auto mb-4 text-accent-emerald">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Submission Recorded!</h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto mb-6 leading-relaxed">
              Your questionnaire results and finalized category priorities have been recorded to the GCECT student database.
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
              Your Genuine Technology Interests
            </h1>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              Here is your prioritized list of technology domains where you demonstrated genuine interest based on your questionnaire responses. You can <strong className="text-white">drag & drop to reorder</strong>, edit rank numbers directly, tie domains together for equal priority, or add/remove categories.
            </p>
          </div>

          {aiRationale && (
            <div className="mb-6 p-4 rounded-2xl bg-accent-violet/10 border border-accent-violet/20 flex items-start gap-3">
              <Bot className="w-5 h-5 text-accent-violet flex-shrink-0 mt-0.5" />
              <div className="text-xs text-white/90 leading-relaxed">
                <span className="font-bold text-accent-violet block mb-0.5">Gemini AI Synthesis:</span>
                {aiRationale}
              </div>
            </div>
          )}

          {/* Drag and Drop Reorder Group */}
          <div className="mb-3 flex items-center justify-between text-xs text-text-muted px-1">
            <span className="flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5 text-text-muted" />
              <span>Drag handles to re-order priority</span>
            </span>
            <span>Rank 1 is Highest ({orderedDomainIds.length} interested categories)</span>
          </div>

          <Reorder.Group
            axis="y"
            values={orderedDomainIds}
            onReorder={handleReorder}
            className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 mb-4"
          >
            {orderedDomainIds.map((domainId, index) => {
              const domain = DOMAIN_MAP.get(domainId);
              if (!domain) return null;
              const currentRank = reviewRanks[domainId];
              const isTied = orderedDomainIds.some(
                (otherId) => otherId !== domainId && reviewRanks[otherId] === currentRank
              );

              return (
                <Reorder.Item
                  key={domainId}
                  value={domainId}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-grab active:cursor-grabbing hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GripVertical className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
                    >
                      <DomainIcon name={domain.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{domain.name}</h4>
                      <span className="text-[10px] text-text-muted">{domain.category}</span>
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
                        title="Tie with the category above"
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
                        onChange={(e) => updateRank(domainId, parseInt(e.target.value) || 1)}
                        className="w-14 bg-[#080D18] border border-white/[0.15] rounded-lg px-2 py-1 text-xs text-center text-white font-mono font-bold focus:outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDomain(domainId)}
                      title="Remove from my interests"
                      className="text-text-muted hover:text-accent-rose p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          {/* Add Another Category Dropdown */}
          {orderedDomainIds.length < 20 && (
            <div className="mb-6 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
              <select
                value={selectedAddDomain}
                onChange={(e) => setSelectedAddDomain(e.target.value as DomainId)}
                className="flex-1 bg-[#080D18] border border-white/[0.12] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="">+ Add another interested domain...</option>
                {DOMAINS.filter((d) => !orderedDomainIds.includes(d.id)).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.category})
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedAddDomain}
                onClick={() => {
                  if (selectedAddDomain) {
                    handleAddDomain(selectedAddDomain as DomainId);
                    setSelectedAddDomain('');
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Domain</span>
              </button>
            </div>
          )}

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
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-accent-violet/90 transition-all text-xs disabled:opacity-40 shadow-lg shadow-primary/25 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Submit Rankings & View Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Questionnaire View
  if (!currentQuestion) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-xs text-text-secondary">No question loaded.</p>
        <button onClick={handleReset} className="mt-4 text-xs text-primary underline">
          Reset Session
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-14 w-full flex-1 flex flex-col justify-center">
      {/* Questionnaire Top Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
          <span className="font-semibold text-white">
            Question {questionsAnswered + 1}
          </span>
          <span className="text-[11px] text-text-muted">
            {questionsAnswered < 10
              ? 'Phase 1: Establishing Core Affinity'
              : questionsAnswered < 20
              ? 'Phase 2: Deep Adaptive Probing'
              : 'Phase 3: Finalizing Technology Horizon'}
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-accent-cyan to-accent-violet"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (questionsAnswered / 25) * 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {currentQuestion.isUniversal ? 'Foundational Question' : `${DOMAIN_MAP.get(currentQuestion.primaryDomainId!)?.name || 'Domain'} Focus`}
          </span>

          <div className="flex items-center gap-2">
            {canFinishEarly && (
              <button
                type="button"
                onClick={() => initiateReviewStep(sessionId, clientResponses)}
                className="text-[11px] text-accent-cyan hover:underline font-semibold flex items-center gap-1"
              >
                <span>Finish & Review Now</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleReset}
              title="Reset questionnaire"
              className="text-text-muted hover:text-accent-rose transition-colors p-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug mb-6">
          {currentQuestion.text}
        </h2>

        {/* Universal Multiple Choice Options */}
        {currentQuestion.isUniversal && currentQuestion.options && (
          <div className="space-y-2.5 mb-6">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/10'
                      : 'bg-white/[0.02] border-white/[0.06] text-text-secondary hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span>{opt.text}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-white/20'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Domain-Specific Likert 5-point Scale */}
        {!currentQuestion.isUniversal && (
          <div className="space-y-2 mb-6">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
              Select Your Level of Interest:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {LIKERT_OPTIONS.map((opt) => {
                const isSelected = selectedLikertValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedLikertValue(opt.value)}
                    className={`p-3 sm:py-4 rounded-xl border text-center transition-all flex sm:flex-col items-center justify-between sm:justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-primary/25 border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                        : 'bg-white/[0.02] border-white/[0.06] text-text-secondary hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] text-text-muted font-mono sm:hidden">
                      {opt.value}/4
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-accent-rose bg-accent-rose/10 p-2.5 rounded-lg border border-accent-rose/20 mb-4">
            {errorMsg}
          </p>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowNotesModal(true)}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{freeTextNotes ? 'Edit Notes' : 'Add Notes'}</span>
          </button>

          <button
            type="button"
            onClick={handleAnswerSubmit}
            disabled={
              submitting ||
              (currentQuestion.isUniversal ? !selectedOptionId : selectedLikertValue === null)
            }
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover transition-all text-xs disabled:opacity-40 flex items-center gap-2 shadow-md shadow-primary/20"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Free Text Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full">
            <h3 className="text-base font-bold text-white mb-2">Optional Notes</h3>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Add any specific technologies, ideas, or projects you are curious about to help refine your results:
            </p>
            <textarea
              rows={4}
              value={freeTextNotes}
              onChange={(e) => setFreeTextNotes(e.target.value)}
              placeholder="e.g., I loved working on a C++ embedded Arduino project in school..."
              className="w-full bg-[#080D18] border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
