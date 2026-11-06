import { DomainId, Question, UserResponse } from '@/types';
import { ALL_QUESTIONS, DOMAIN_QUESTIONS, QUESTION_MAP, UNIVERSAL_QUESTIONS } from '@/data/questions';
import { calculateDomainScores, calculateConfidence } from './scoring';
import { COMPLEMENTARITY_MATRIX } from '@/data/complementarity-matrix';

// Curated initial universal questions that maximize early information entropy
const INITIAL_UNIVERSAL_ORDER = ['Q001', 'Q002', 'Q004', 'Q010', 'Q011', 'Q016'];

export interface AdaptiveState {
  answeredIds: Set<string>;
  responses: UserResponse[];
  questionsAnswered: number;
  isComplete: boolean;
  canFinishEarly: boolean;
  estimatedRemaining: number;
}

/**
 * Determines whether the questionnaire should stop adaptively.
 */
export function shouldStopQuestionnaire(responses: UserResponse[]): boolean {
  if (responses.length < 10) return false;
  if (responses.length >= 30) return true;

  const accumulators = calculateDomainScores(responses);

  // Check confidence of top 3 scoring domains
  const sorted = Array.from(accumulators.entries())
    .map(([domId, acc]) => ({
      domId,
      score: acc.maxPossibleWeightedSum > 0 ? (acc.weightedSum / acc.maxPossibleWeightedSum) * 100 : 0,
      confidence: calculateConfidence(acc),
      evidence: acc.evidenceCount,
    }))
    .sort((a, b) => b.score - a.score);

  const top3 = sorted.slice(0, 3);
  const avgConfidence = top3.reduce((sum, item) => sum + item.confidence, 0) / (top3.length || 1);

  // If top 3 domains have high confidence (> 65%) and at least 14 questions answered
  if (responses.length >= 14 && avgConfidence >= 65) {
    return true;
  }

  // If 20 questions answered and top 3 have moderate confidence (> 55%)
  if (responses.length >= 20 && avgConfidence >= 55) {
    return true;
  }

  return false;
}

/**
 * Selects the next most informative question adaptively.
 */
export function getNextAdaptiveQuestion(responses: UserResponse[]): Question | null {
  const answeredSet = new Set(responses.map((r) => r.questionId));

  if (responses.length >= 30) {
    return null; // hard limit reached
  }

  // Phase 1: Universal questions (first 4-6 questions)
  if (responses.length < 5) {
    for (const qId of INITIAL_UNIVERSAL_ORDER) {
      if (!answeredSet.has(qId)) {
        return QUESTION_MAP.get(qId) || null;
      }
    }
  }

  // Phase 2: Domain Exploration based on provisional scores
  const accumulators = calculateDomainScores(responses);

  // Rank domains by provisional interest score and information need
  const domainRankings = Array.from(accumulators.entries()).map(([domainId, acc]) => {
    const score = acc.maxPossibleWeightedSum > 0 ? (acc.weightedSum / acc.maxPossibleWeightedSum) * 100 : 0;
    const confidence = calculateConfidence(acc);
    return {
      domainId,
      score,
      confidence,
      evidence: acc.evidenceCount,
      likertCount: acc.likertCount,
    };
  });

  // Sort domains: Prioritize high score + low confidence (high potential, needs evidence)
  domainRankings.sort((a, b) => {
    // Priority metric: score * (100 - confidence)
    const priorityA = a.score * (100 - a.confidence);
    const priorityB = b.score * (100 - b.confidence);
    return priorityB - priorityA;
  });

  // Check top candidate domains
  for (const candidate of domainRankings) {
    // Only drill down if there is positive interest
    if (candidate.score < 35 && candidate.evidence > 0 && responses.length >= 8) {
      continue;
    }

    // Find unanswered domain questions for this domain
    const unansweredDomainQuestions = DOMAIN_QUESTIONS.filter(
      (q) => q.primaryDomainId === candidate.domainId && !answeredSet.has(q.id)
    );

    // If we haven't asked more than 3 Likert questions for this domain yet
    if (unansweredDomainQuestions.length > 0 && candidate.likertCount < 3) {
      return unansweredDomainQuestions[0];
    }
  }

  // Phase 3: Check Complementary / Crossover domains
  // If top domain has crossover partners with low evidence, check them
  const topDomain = domainRankings[0]?.domainId;
  if (topDomain) {
    const complements = COMPLEMENTARITY_MATRIX[topDomain];
    if (complements) {
      const sortedComplements = Object.entries(complements)
        .sort(([, wtA], [, wtB]) => (wtB || 0) - (wtA || 0))
        .map(([dom]) => dom as DomainId);

      for (const compDomain of sortedComplements) {
        const compAcc = accumulators.get(compDomain);
        if (compAcc && compAcc.evidenceCount < 2) {
          const compQuestions = DOMAIN_QUESTIONS.filter(
            (q) => q.primaryDomainId === compDomain && !answeredSet.has(q.id)
          );
          if (compQuestions.length > 0) {
            return compQuestions[0];
          }
        }
      }
    }
  }

  // Phase 4: Fallback to remaining universal questions if any unanswered
  const remainingUniversal = UNIVERSAL_QUESTIONS.filter((q) => !answeredSet.has(q.id));
  if (remainingUniversal.length > 0 && responses.length < 12) {
    return remainingUniversal[0];
  }

  // Phase 5: Any remaining high-score domain questions
  for (const candidate of domainRankings) {
    const candidateQuestions = DOMAIN_QUESTIONS.filter(
      (q) => q.primaryDomainId === candidate.domainId && !answeredSet.has(q.id)
    );
    if (candidateQuestions.length > 0) {
      return candidateQuestions[0];
    }
  }

  // Phase 6: Any unanswered question from the bank
  const anyUnanswered = ALL_QUESTIONS.find((q) => !answeredSet.has(q.id));
  return anyUnanswered || null;
}
