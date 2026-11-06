import { GoogleGenAI } from '@google/genai';
import { DomainId } from '@/types';
import { DOMAIN_MAP } from '@/data/domains';
import {
  AiExplanation,
  AiExplanationSchema,
  AiInterpretation,
  AiInterpretationSchema,
} from '@/lib/validations/ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

let geminiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    geminiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

/**
 * Deterministic fallback for text interpretation when Gemini is unavailable.
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
 * Interpret student's free-form written interests via Gemini or deterministic fallback.
 */
export async function interpretStudentText(text: string): Promise<AiInterpretation> {
  if (!geminiClient || !apiKey) {
    return getFallbackInterpretation(text);
  }

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
    const response = await geminiClient.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const rawText = response.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return AiInterpretationSchema.parse(parsed);
  } catch (error) {
    console.warn('Gemini text interpretation fallback triggered:', error);
    return getFallbackInterpretation(text);
  }
}

/**
 * Deterministic fallback for interest explanations and project suggestions.
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
 * Generate interest explanation and project suggestions via Gemini or deterministic fallback.
 */
export async function explainInterestResults(
  topDomains: DomainId[],
  domainScores: Record<DomainId, number>
): Promise<AiExplanation> {
  if (!geminiClient || !apiKey) {
    return getFallbackExplanation(topDomains, domainScores);
  }

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
    const response = await geminiClient.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const rawText = response.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return AiExplanationSchema.parse(parsed);
  } catch (error) {
    console.warn('Gemini explanation fallback triggered:', error);
    return getFallbackExplanation(topDomains, domainScores);
  }
}

