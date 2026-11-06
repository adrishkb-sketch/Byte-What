import {
  DomainId,
  DomainScoreResult,
  QuestionnaireResultSummary,
  UserResponse,
} from '@/types';
import { DOMAINS, DOMAIN_MAP } from '@/data/domains';
import { ALL_QUESTIONS, QUESTION_MAP } from '@/data/questions';

export interface RawDomainAccumulator {
  weightedSum: number;
  maxPossibleWeightedSum: number;
  evidenceCount: number;
  likertCount: number;
  universalCount: number;
  scoresList: number[]; // normalized 0-1 responses
}

/**
 * Deterministic scoring algorithm:
 * domain_score = (weighted_sum / max_possible_weighted_sum) * 100
 * Missing answers are excluded from maxPossibleWeightedSum so missing questions do not penalize.
 */
export function calculateDomainScores(responses: UserResponse[]): Map<DomainId, RawDomainAccumulator> {
  const accumulators = new Map<DomainId, RawDomainAccumulator>();

  for (const domain of DOMAINS) {
    accumulators.set(domain.id, {
      weightedSum: 0,
      maxPossibleWeightedSum: 0,
      evidenceCount: 0,
      likertCount: 0,
      universalCount: 0,
      scoresList: [],
    });
  }

  for (const resp of responses) {
    const question = QUESTION_MAP.get(resp.questionId);
    if (!question) continue;

    if (question.isUniversal && resp.selectedOptionId && question.options) {
      const selectedOption = question.options.find((o) => o.id === resp.selectedOptionId);
      if (!selectedOption) continue;

      // Find max possible weight across all options of this question for each domain
      const maxWeightsPerDomain: Partial<Record<DomainId, number>> = {};
      for (const opt of question.options) {
        for (const [dom, wt] of Object.entries(opt.domainWeights) as [DomainId, number][]) {
          maxWeightsPerDomain[dom] = Math.max(maxWeightsPerDomain[dom] || 0, wt);
        }
      }

      for (const [domainId, weight] of Object.entries(selectedOption.domainWeights) as [DomainId, number][]) {
        const acc = accumulators.get(domainId);
        if (!acc) continue;

        const maxWt = maxWeightsPerDomain[domainId] || weight;
        acc.weightedSum += weight * 100;
        acc.maxPossibleWeightedSum += maxWt * 100;
        acc.evidenceCount += 1;
        acc.universalCount += 1;
        acc.scoresList.push(weight / (maxWt || 1));
      }
    } else if (!question.isUniversal && resp.numericValue !== undefined && question.primaryDomainId) {
      // 5-point Likert scale (0 to 4)
      const normalizedScore = resp.numericValue / 4; // 0.0 to 1.0

      // Primary domain contribution (weight = 1.0)
      const primaryAcc = accumulators.get(question.primaryDomainId);
      if (primaryAcc) {
        primaryAcc.weightedSum += normalizedScore * 100;
        primaryAcc.maxPossibleWeightedSum += 100;
        primaryAcc.evidenceCount += 1;
        primaryAcc.likertCount += 1;
        primaryAcc.scoresList.push(normalizedScore);
      }

      // Secondary domain contribution if any
      if (question.secondaryDomainWeights) {
        for (const [domainId, secondaryWeight] of Object.entries(question.secondaryDomainWeights) as [DomainId, number][]) {
          const secAcc = accumulators.get(domainId);
          if (!secAcc) continue;

          secAcc.weightedSum += normalizedScore * secondaryWeight * 100;
          secAcc.maxPossibleWeightedSum += secondaryWeight * 100;
          secAcc.evidenceCount += 1;
          secAcc.likertCount += 1;
          secAcc.scoresList.push(normalizedScore);
        }
      }
    }
  }

  return accumulators;
}

/**
 * Calculates confidence based on:
 * 1. Evidence count (sample size)
 * 2. Likert depth (direct domain questions vs general hints)
 * 3. Response consistency (variance)
 */
export function calculateConfidence(acc: RawDomainAccumulator): number {
  if (acc.evidenceCount === 0 || acc.maxPossibleWeightedSum === 0) return 0;

  // Base score from question count (up to 4 domain-specific questions gives high confidence)
  // Likert questions have higher confidence value than universal hints
  const countFactor = Math.min(1.0, (acc.likertCount * 0.22) + (acc.universalCount * 0.12));

  // Consistency factor: low variance among high scores = higher confidence
  let consistencyFactor = 0.85;
  if (acc.scoresList.length >= 2) {
    const mean = acc.scoresList.reduce((a, b) => a + b, 0) / acc.scoresList.length;
    const variance = acc.scoresList.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / acc.scoresList.length;
    // Lower variance gives up to 1.0, high variance gives 0.7
    consistencyFactor = Math.max(0.65, 1.0 - (variance * 0.8));
  }

  const confidence = Math.round(countFactor * consistencyFactor * 100);
  return Math.min(100, Math.max(0, confidence));
}

/**
 * Classifies domains into primary (top 3), secondary (next 3), emerging, and low-evidence.
 */
export function generateQuestionnaireResults(
  sessionId: string,
  startedAt: string,
  responses: UserResponse[],
  customExplanation?: string
): QuestionnaireResultSummary {
  const accumulators = calculateDomainScores(responses);

  const allScores: DomainScoreResult[] = [];

  for (const domain of DOMAINS) {
    const acc = accumulators.get(domain.id)!;
    const interestScore = acc.maxPossibleWeightedSum > 0
      ? Math.round((acc.weightedSum / acc.maxPossibleWeightedSum) * 100)
      : 0;

    const confidenceScore = calculateConfidence(acc);

    allScores.push({
      domainId: domain.id,
      domainName: domain.name,
      interestScore,
      confidenceScore,
      evidenceCount: acc.evidenceCount,
      classification: 'low_evidence', // will adjust below
    });
  }

  // Sort by interest score descending, breaking ties with confidence score
  allScores.sort((a, b) => {
    if (b.interestScore !== a.interestScore) {
      return b.interestScore - a.interestScore;
    }
    return b.confidenceScore - a.confidenceScore;
  });

  // Assign classifications
  // Primary: top 3 with interestScore >= 40 and evidenceCount >= 2 (or top 3 if early)
  const primaryInterests: DomainScoreResult[] = [];
  const secondaryInterests: DomainScoreResult[] = [];
  const emergingInterests: DomainScoreResult[] = [];
  const lowEvidenceInterests: DomainScoreResult[] = [];

  allScores.forEach((item, index) => {
    if (index < 3 && item.evidenceCount >= 1 && item.interestScore > 0) {
      item.classification = 'primary';
      primaryInterests.push(item);
    } else if (index < 6 && item.evidenceCount >= 1 && item.interestScore > 0) {
      item.classification = 'secondary';
      secondaryInterests.push(item);
    } else if (item.interestScore >= 60 && item.confidenceScore < 45) {
      // Promising high interest, but low evidence/confidence
      item.classification = 'emerging';
      emergingInterests.push(item);
    } else {
      item.classification = 'low_evidence';
      lowEvidenceInterests.push(item);
    }
  });

  return {
    sessionId,
    startedAt,
    completedAt: new Date().toISOString(),
    questionsAnswered: responses.length,
    primaryInterests,
    secondaryInterests,
    emergingInterests,
    lowEvidenceInterests,
    allDomainScores: allScores,
    writtenExplanation: customExplanation,
  };
}

