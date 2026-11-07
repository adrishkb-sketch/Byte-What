import { DomainId, Question, StudentDomainRank, UserResponse } from '@/types';
import { DOMAIN_MAP, DOMAINS } from '@/data/domains';
import {
  AiExplanation,
  AiExplanationSchema,
  AiInterpretation,
  AiInterpretationSchema,
} from '@/lib/validations/ai';
import { geminiPool } from './gemini-pool';
import { calculateDomainScores } from '@/lib/questionnaire/scoring';

/**
 * Uses Gemini (with key rotation) to choose the most informative next question
 * based on the student's answered questions and current interest distribution.
 */
export async function selectNextQuestionWithGemini(
  history: UserResponse[],
  candidateQuestions: Question[]
): Promise<string | null> {
  if (candidateQuestions.length === 0) return null;
  if (geminiPool.getAvailableKeyCount() === 0) return null;

  // Summarize student answers for prompt
  const recentHistory = history.slice(-6).map((r) => {
    return `Question ${r.questionId}: value=${r.numericValue !== undefined ? r.numericValue : r.selectedOptionId}`;
  }).join(', ');

  // Take a sample of up to 15 candidates across different domains
  const sampleCandidates = candidateQuestions.slice(0, 15).map((q) => ({
    id: q.id,
    domain: q.primaryDomainId || 'universal',
    text: q.text,
  }));

  const prompt = `You are an adaptive questionnaire engine for engineering college students at GCECT.
A student has answered ${history.length} questions so far. Recent responses:
[${recentHistory}]

From the following list of candidate questions, select the SINGLE question ID that will best clarify, test depth, or resolve uncertainty in their technology interests:
${JSON.stringify(sampleCandidates)}

Respond with ONLY the exact question ID (e.g. "Q042"). No markdown, no punctuation.`;

  try {
    const responseText = await geminiPool.generateContentWithRotation(prompt);
    if (responseText) {
      const match = responseText.trim().match(/Q\d{3}/i);
      if (match) {
        const selectedId = match[0].toUpperCase();
        if (candidateQuestions.some((q) => q.id === selectedId)) {
          return selectedId;
        }
      }
    }
  } catch (err) {
    console.warn('[selectNextQuestionWithGemini] Failed to select with Gemini:', err);
  }

  return null;
}

export function getFallbackDomainRankings(responses: UserResponse[]): {
  rankings: StudentDomainRank[];
  explanation: string;
} {
  const accumulators = calculateDomainScores(responses);
  const provisional = Array.from(accumulators.entries())
    .map(([domainId, acc]) => {
      const score = acc.maxPossibleWeightedSum > 0 ? Math.round((acc.weightedSum / acc.maxPossibleWeightedSum) * 100) : 0;
      return { domainId, score, evidenceCount: acc.evidenceCount };
    })
    .sort((a, b) => b.score - a.score);

  // Group into ranks with ties for close scores (within 4 points)
  const rankings: StudentDomainRank[] = [];
  let currentRank = 1;

  for (let i = 0; i < provisional.length; i++) {
    if (i > 0) {
      const diff = provisional[i - 1].score - provisional[i].score;
      if (diff > 4) {
        currentRank = i + 1;
      }
      // If diff <= 4, keep currentRank (tied rank)
    }
    rankings.push({
      domainId: provisional[i].domainId,
      rank: currentRank,
    });
  }

  const topDomain = DOMAIN_MAP.get(provisional[0]?.domainId)?.name || 'Engineering';
  const explanation = `Algorithmic analysis identifies your highest technological affinity in ${topDomain}, with complementary focus across synergistic domains.`;

  return { rankings, explanation };
}

/**
 * Uses Gemini (with key rotation) to validate all responses and generate a prioritized 1-to-20 ranking
 * of the 20 technology categories with rationale and suggested ties.
 * Falls back immediately to deterministic scoring in the background if Gemini is offline or unavailable.
 */
export async function rankInterestsWithGemini(
  responses: UserResponse[]
): Promise<{ rankings: StudentDomainRank[]; explanation: string }> {
  if (geminiPool.getAvailableKeyCount() === 0) {
    return getFallbackDomainRankings(responses);
  }

  const accumulators = calculateDomainScores(responses);
  const provisional = Array.from(accumulators.entries()).map(([domainId, acc]) => {
    const score = acc.maxPossibleWeightedSum > 0 ? Math.round((acc.weightedSum / acc.maxPossibleWeightedSum) * 100) : 0;
    return {
      domainId,
      name: DOMAIN_MAP.get(domainId)?.name || domainId,
      score,
      evidenceCount: acc.evidenceCount,
    };
  }).sort((a, b) => b.score - a.score);

  const prompt = `You are an expert engineering advisor for GCECT (Government College of Engineering and Ceramic Technology).
A student completed our adaptive technology interest questionnaire (${responses.length} answered questions).
Their provisional algorithmic scores are:
${JSON.stringify(provisional)}

Validate these results and output a finalized priority list from Rank 1 (highest priority) to Rank 20 for all 20 domains.
If two or more domains have very close passion scores or strong synergy, YOU CAN ASSIGN THEM THE SAME RANK (A TIE, e.g., both Rank 1).

Return ONLY a valid JSON object matching this schema:
{
  "rankings": [
    { "domainId": "domain_id", "rank": 1 }
  ],
  "explanation": "Short 2-sentence rationale summarizing their top strengths and why ties were made"
}
Strictly include all 20 domain IDs:
software_web, mobile_development, artificial_intelligence, machine_learning, data_science, cybersecurity, cloud_devops, networks_systems, blockchain_web3, game_development, ar_vr_xr, robotics_iot, electronics_vlsi, competitive_programming, ui_ux_design, graphic_3d_design, entrepreneurship, cs_research, bioinformatics_healthtech, fintech_quant.
No markdown backticks. Valid JSON only.`;

  try {
    const text = await geminiPool.generateContentWithRotation(prompt);
    if (text) {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.rankings && Array.isArray(parsed.rankings)) {
        return {
          rankings: parsed.rankings,
          explanation: parsed.explanation || '',
        };
      }
    }
  } catch (err) {
    console.warn('[rankInterestsWithGemini] Failed to rank with Gemini, using background fallback:', err);
  }

  return getFallbackDomainRankings(responses);
}

/**
 * Deterministic fallback for text interpretation.
 */
export function getFallbackInterpretation(userText: string): AiInterpretation {
  const lower = userText.toLowerCase();
  const matched: DomainId[] = [];

  const keywords: Record<DomainId, string[]> = {
    software_web: ['web', 'website', 'frontend', 'backend', 'fullstack', 'react', 'javascript', 'api'],
    mobile_development: ['mobile', 'app', 'android', 'ios', 'flutter', 'smartphone'],
    artificial_intelligence: ['ai', 'intelligence', 'llm', 'chatgpt', 'gpt', 'reasoning', 'autonomous', 'assistant'],
    machine_learning: ['machine learning', 'deep learning', 'neural', 'pytorch', 'vision', 'train model'],
    data_science: ['data', 'analytics', 'statistics', 'charts', 'visualization', 'eda'],
    cybersecurity: ['security', 'hacking', 'penetration', 'forensics', 'malware', 'cyber'],
    cloud_devops: ['cloud', 'devops', 'docker', 'kubernetes', 'aws', 'deploy', 'ci/cd', 'infrastructure'],
    networks_systems: ['network', 'operating system', 'kernel', 'linux', 'c language', 'low level'],
    blockchain_web3: ['blockchain', 'crypto', 'web3', 'smart contract', 'solidity', 'decentralized'],
    game_development: ['game', 'gaming', 'unity', 'unreal', 'godot', 'gameplay'],
    ar_vr_xr: ['vr', 'ar', 'augmented', 'virtual reality', 'metaverse', 'spatial', 'webxr'],
    robotics_iot: ['robot', 'robotics', 'iot', 'arduino', 'esp32', 'sensor', 'hardware device'],
    electronics_vlsi: ['vlsi', 'circuit', 'chip', 'electronics', 'fpga', 'semiconductor'],
    competitive_programming: ['dsa', 'algorithm', 'competitive programming', 'leetcode', 'codeforces', 'logic'],
    ui_ux_design: ['ui', 'ux', 'design', 'figma', 'prototype', 'wireframe', 'user experience'],
    graphic_3d_design: ['3d', 'blender', 'animation', 'graphic', 'illustration', 'photoshop'],
    entrepreneurship: ['startup', 'business', 'product', 'founder', 'company', 'market'],
    cs_research: ['research', 'paper', 'publish', 'hypothesis', 'theoretical', 'scientific'],
    bioinformatics_healthtech: ['bio', 'biology', 'health', 'genomic', 'medical', 'dna'],
    fintech_quant: ['fintech', 'finance', 'trading', 'quant', 'stock', 'banking'],
  };

  for (const [dom, kwList] of Object.entries(keywords) as [DomainId, string[]][]) {
    if (kwList.some((kw) => lower.includes(kw))) {
      matched.push(dom);
    }
  }

  const identifiedDomains = matched.length > 0 ? matched.slice(0, 3) : (['software_web', 'artificial_intelligence'] as DomainId[]);
  const primaryDomain = DOMAIN_MAP.get(identifiedDomains[0]);

  return {
    identifiedDomains,
    supportingPhrases: [userText.slice(0, 100)],
    explanation: `Based on your note, interests in ${identifiedDomains.map((d) => DOMAIN_MAP.get(d)?.name).join(', ')} were identified.`,
    confidence: matched.length > 0 ? 80 : 50,
    suggestedRelatedDomains: primaryDomain?.relatedDomains.slice(0, 3) || [],
  };
}

/**
 * Interpret student's free-form written interests via Gemini Pool or fallback.
 */
export async function interpretStudentText(text: string): Promise<AiInterpretation> {
  const prompt = `You are an expert engineering advisor for GCECT (Government College of Engineering and Ceramic Technology).
A student wrote this optional description of their technology interests:
"""${text.slice(0, 1000)}"""

Analyze their interests and map them strictly to the following 20 domain IDs:
software_web, mobile_development, artificial_intelligence, machine_learning, data_science, cybersecurity, cloud_devops, networks_systems, blockchain_web3, game_development, ar_vr_xr, robotics_iot, electronics_vlsi, competitive_programming, ui_ux_design, graphic_3d_design, entrepreneurship, cs_research, bioinformatics_healthtech, fintech_quant.

Return ONLY a valid JSON object matching this schema:
{
  "identifiedDomains": ["domain_id"],
  "supportingPhrases": ["phrase from student text"],
  "explanation": "Clear explanation of why these domains fit what they wrote",
  "confidence": 85,
  "suggestedRelatedDomains": ["domain_id"]
}
Do not include markdown fences or any other text.`;

  try {
    const rawText = await geminiPool.generateContentWithRotation(prompt);
    if (rawText) {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return AiInterpretationSchema.parse(parsed);
    }
  } catch (error) {
    console.warn('Gemini text interpretation fallback triggered:', error);
  }

  return getFallbackInterpretation(text);
}

/**
 * Deterministic fallback for interest explanations.
 */
export function getFallbackExplanation(
  topDomains: DomainId[],
  scores: Record<DomainId, number>
): AiExplanation {
  const d1 = DOMAIN_MAP.get(topDomains[0]) || DOMAIN_MAP.get('software_web')!;
  const d2 = DOMAIN_MAP.get(topDomains[1]) || DOMAIN_MAP.get('artificial_intelligence')!;
  const d3 = DOMAIN_MAP.get(topDomains[2]) || DOMAIN_MAP.get('cloud_devops')!;

  const writtenExplanation = `Your responses demonstrate a strong affinity for ${d1.name} (score: ${scores[d1.id] ?? 85}%), complemented by curiosity in ${d2.name} and ${d3.name}. You appreciate both foundational engineering principles and practical implementation. This combination gives you a strong foundation for building multi-disciplinary, impactful solutions.`;

  const crossDomainInsights = [
    `Synergy between ${d1.name} and ${d2.name} enables you to build full-scale systems that leverage intelligent automation.`,
    `Your interest in ${d3.name} will help ensure your projects are scalable, reliable, and user-centric.`,
  ];

  const suggestedProjects = [
    {
      title: `${d1.name} + ${d2.name} Convergence Portal`,
      description: `Build an end-to-end platform combining ${d1.skills[0]} with modern ${d2.skills[0]} capabilities for campus use.`,
      domains: [d1.id, d2.id],
      technologies: [...d1.exampleTechnologies.slice(0, 3), ...d2.exampleTechnologies.slice(0, 2)],
    },
    {
      title: `Automated ${d3.name} Diagnostic Utility`,
      description: `A lightweight open-source tool focusing on ${d3.skills[0]} to solve everyday collegiate engineering workflows.`,
      domains: [d3.id, d1.id],
      technologies: [...d3.exampleTechnologies.slice(0, 3)],
    },
  ];

  return {
    writtenExplanation,
    crossDomainInsights,
    suggestedProjects,
  };
}

/**
 * Generate interest explanation and project suggestions via Gemini Pool or fallback.
 */
export async function explainInterestResults(
  topDomains: DomainId[],
  domainScores: Record<DomainId, number>
): Promise<AiExplanation> {
  const domainNames = topDomains.map((id) => DOMAIN_MAP.get(id)?.name || id);

  const prompt = `You are BYTE WHAT's AI Academic & Technical Mentor for GCECT college students.
A student took our deterministic technology interest questionnaire and their top domains are:
1. ${domainNames[0]} (${topDomains[0]}): ${domainScores[topDomains[0]] ?? 80}%
2. ${domainNames[1]} (${topDomains[1]}): ${domainScores[topDomains[1]] ?? 70}%
3. ${domainNames[2]} (${topDomains[2]}): ${domainScores[topDomains[2]] ?? 60}%

Explain why this combination is powerful, identify cross-domain synergies, and propose 2-3 practical, beginner/intermediate student project ideas.

Return ONLY a valid JSON object matching this schema:
{
  "writtenExplanation": "A thoughtful 2-3 paragraph explanation of their strengths and interest profile",
  "crossDomainInsights": ["Key synergy bullet 1", "Key synergy bullet 2"],
  "suggestedProjects": [
    {
      "title": "Project Name",
      "description": "Engaging description of what to build and why",
      "domains": ["${topDomains[0]}", "${topDomains[1]}"],
      "technologies": ["Tech1", "Tech2"]
    }
  ]
}
Do not output markdown codeblocks. Return valid JSON only.`;

  try {
    const rawText = await geminiPool.generateContentWithRotation(prompt);
    if (rawText) {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return AiExplanationSchema.parse(parsed);
    }
  } catch (error) {
    console.warn('Gemini explanation fallback triggered:', error);
  }

  return getFallbackExplanation(topDomains, domainScores);
}
