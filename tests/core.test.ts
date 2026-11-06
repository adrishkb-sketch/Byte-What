import { describe, it, expect } from 'vitest';
import { ALL_QUESTIONS, DOMAIN_QUESTIONS, UNIVERSAL_QUESTIONS, QUESTION_MAP } from '../src/data/questions';
import { DOMAINS, DOMAIN_MAP } from '../src/data/domains';
import { calculateDomainScores, calculateConfidence, generateQuestionnaireResults } from '../src/lib/questionnaire/scoring';
import { getNextAdaptiveQuestion, shouldStopQuestionnaire } from '../src/lib/questionnaire/adaptive';
import { getFallbackExplanation, getFallbackInterpretation } from '../src/lib/ai/gemini';
import { UserResponse } from '../src/types';

describe('1. Question Bank Integrity', () => {
  it('contains exactly 200 unique questions', () => {
    expect(ALL_QUESTIONS.length).toBe(200);

    const ids = new Set(ALL_QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(200);
  });

  it('contains exactly 20 universal questions', () => {
    expect(UNIVERSAL_QUESTIONS.length).toBe(20);
    UNIVERSAL_QUESTIONS.forEach((q) => {
      expect(q.isUniversal).toBe(true);
      expect(q.options).toBeDefined();
      expect(q.options!.length).toBeGreaterThan(0);
    });
  });

  it('contains exactly 180 domain-specific questions', () => {
    expect(DOMAIN_QUESTIONS.length).toBe(180);
    DOMAIN_QUESTIONS.forEach((q) => {
      expect(q.isUniversal).toBe(false);
      expect(q.primaryDomainId).toBeDefined();
    });
  });
});

describe('2. Domains Integrity', () => {
  it('contains all 20 predefined technology domains', () => {
    expect(DOMAINS.length).toBe(20);
    const domainIds = new Set(DOMAINS.map((d) => d.id));
    expect(domainIds.size).toBe(20);

    const requiredIds = [
      'software_web',
      'mobile_development',
      'artificial_intelligence',
      'machine_learning',
      'data_science',
      'cybersecurity',
      'cloud_devops',
      'networks_systems',
      'blockchain_web3',
      'game_development',
      'ar_vr_xr',
      'robotics_iot',
      'electronics_vlsi',
      'competitive_programming',
      'ui_ux_design',
      'graphic_3d_design',
      'entrepreneurship',
      'cs_research',
      'bioinformatics_healthtech',
      'fintech_quant',
    ];

    requiredIds.forEach((id) => {
      expect(domainIds.has(id as any)).toBe(true);
    });
  });

  it('every domain has exactly nine domain-specific questions', () => {
    DOMAINS.forEach((domain) => {
      const domainQuestions = DOMAIN_QUESTIONS.filter((q) => q.primaryDomainId === domain.id);
      expect(domainQuestions.length).toBe(9);
    });
  });
});

describe('3. Deterministic Scoring Engine', () => {
  it('normalizes scores into 0–100 range', () => {
    const responses: UserResponse[] = [
      {
        questionId: 'Q001',
        selectedOptionId: 'Q001_3', // Creating something new
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'Q021', // Software Engineering Q1
        numericValue: 4, // Strongly agree
        timestamp: new Date().toISOString(),
      },
    ];

    const results = generateQuestionnaireResults('test-session', new Date().toISOString(), responses);

    results.allDomainScores.forEach((score) => {
      expect(score.interestScore).toBeGreaterThanOrEqual(0);
      expect(score.interestScore).toBeLessThanOrEqual(100);
      expect(score.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(score.confidenceScore).toBeLessThanOrEqual(100);
    });
  });

  it('handles missing answers without penalizing score', () => {
    // Student answers only 1 question for software_web with Strongly Agree (4)
    const responses: UserResponse[] = [
      {
        questionId: 'Q021',
        numericValue: 4, // 100% agreement
        timestamp: new Date().toISOString(),
      },
    ];

    const results = generateQuestionnaireResults('test-session', new Date().toISOString(), responses);
    const swResult = results.allDomainScores.find((d) => d.domainId === 'software_web');

    expect(swResult).toBeDefined();
    // 4 out of 4 is 100% interest score, even though 8 questions were not answered
    expect(swResult!.interestScore).toBe(100);
    // But confidence should be low because only 1 question was answered!
    expect(swResult!.confidenceScore).toBeLessThan(40);
  });

  it('distinguishes confidence from interest score', () => {
    const responsesMany: UserResponse[] = [
      { questionId: 'Q021', numericValue: 4, timestamp: '' },
      { questionId: 'Q022', numericValue: 4, timestamp: '' },
      { questionId: 'Q023', numericValue: 4, timestamp: '' },
      { questionId: 'Q024', numericValue: 4, timestamp: '' },
    ];

    const results = generateQuestionnaireResults('test-session', new Date().toISOString(), responsesMany);
    const swResult = results.allDomainScores.find((d) => d.domainId === 'software_web');

    expect(swResult).toBeDefined();
    expect(swResult!.interestScore).toBe(100);
    // With 4 strong questions answered, confidence should be noticeably higher
    expect(swResult!.confidenceScore).toBeGreaterThan(60);
  });
});

describe('4. Adaptive Engine Behavior', () => {
  it('never repeats an already answered question', () => {
    const responses: UserResponse[] = [
      { questionId: 'Q001', selectedOptionId: 'Q001_1', timestamp: '' },
      { questionId: 'Q002', selectedOptionId: 'Q002_1', timestamp: '' },
    ];

    const nextQ = getNextAdaptiveQuestion(responses);
    expect(nextQ).not.toBeNull();
    expect(nextQ!.id).not.toBe('Q001');
    expect(nextQ!.id).not.toBe('Q002');
  });

  it('stops at hard limit of 30 questions', () => {
    const thirtyResponses: UserResponse[] = Array.from({ length: 30 }, (_, i) => ({
      questionId: ALL_QUESTIONS[i].id,
      numericValue: 3,
      timestamp: '',
    }));

    expect(shouldStopQuestionnaire(thirtyResponses)).toBe(true);
    const nextQ = getNextAdaptiveQuestion(thirtyResponses);
    expect(nextQ).toBeNull();
  });
});

describe('5. Gemini Fallback Resilience', () => {
  it('generates rich deterministic explanations when Gemini is unavailable', () => {
    const topDomains = ['software_web', 'artificial_intelligence', 'cloud_devops'] as const;
    const scores = { software_web: 90, artificial_intelligence: 80, cloud_devops: 75 };

    const explanation = getFallbackExplanation(topDomains as any, scores as any);

    expect(explanation.writtenExplanation.length).toBeGreaterThan(50);
    expect(explanation.crossDomainInsights.length).toBeGreaterThan(0);
    expect(explanation.suggestedProjects.length).toBeGreaterThan(0);
  });

  it('interprets student text using keyword fallback if Gemini is offline', () => {
    const text = 'I enjoy robotics, arduino microcontrollers, and building physical devices.';
    const interpretation = getFallbackInterpretation(text);

    expect(interpretation.identifiedDomains.length).toBeGreaterThan(0);
    expect(interpretation.identifiedDomains).toContain('robotics_iot');
    expect(interpretation.confidence).toBeGreaterThan(0);
  });
});
