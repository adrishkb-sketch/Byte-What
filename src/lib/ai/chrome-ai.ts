/**
 * Client-Side Chrome Built-in AI (Gemini Nano) Integration
 * 
 * Runs entirely on-device inside the user's browser via `window.ai.languageModel`
 * (Chrome 127+ / Canary / Experimental AI flags) to process student questionnaire
 * answers and technical interests locally, ensuring zero Personally Identifiable
 * Information (PII) is transmitted to external cloud servers.
 */

export interface ChromeAICapabilities {
  available: boolean;
  model: string;
  isClientSide: boolean;
  statusText: string;
}

export interface AnswerAnalysisResult {
  inferredDomains: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  explanation: string;
  processedLocally: boolean;
}

/**
 * Checks whether Chrome's built-in AI (Gemini Nano) is available in the current browser.
 */
export async function checkChromeAIAvailability(): Promise<ChromeAICapabilities> {
  if (typeof window === 'undefined') {
    return {
      available: false,
      model: 'none',
      isClientSide: false,
      statusText: 'Server environment',
    };
  }

  try {
    const ai = (window as any).ai;
    if (ai && ai.languageModel) {
      const capabilities = await ai.languageModel.capabilities();
      if (capabilities && capabilities.available !== 'no') {
        return {
          available: true,
          model: 'Gemini Nano (On-Device)',
          isClientSide: true,
          statusText: capabilities.available === 'readily' ? 'Ready on-device' : 'Downloading/Initializing model',
        };
      }
    }
  } catch (err) {
    console.debug('Chrome AI capabilities check error:', err);
  }

  return {
    available: false,
    model: 'Local Client Heuristics (PII-Safe)',
    isClientSide: true,
    statusText: 'Using client-side PII-safe processor',
  };
}

/**
 * Processes a student's answer text using Chrome Built-in AI (Gemini Nano) directly in the browser.
 * Guarantees zero PII leaves the browser machine.
 */
export async function processStudentAnswerWithChromeAI(
  questionText: string,
  studentAnswer: string,
  candidateDomains: { id: string; name: string; keywords: string[] }[] = []
): Promise<AnswerAnalysisResult> {
  const sanitizedInput = scrubPIILocally(studentAnswer);

  if (typeof window !== 'undefined') {
    const ai = (window as any).ai;
    if (ai && ai.languageModel) {
      try {
        const capabilities = await ai.languageModel.capabilities();
        if (capabilities && capabilities.available !== 'no') {
          const session = await ai.languageModel.create({
            systemPrompt:
              'You are an on-device privacy-first AI evaluating collegiate engineering interests. ' +
              'Analyze the student input locally and extract relevant technical interests. ' +
              'Never store or transmit personally identifiable information.',
          });

          const domainOptions = candidateDomains.map((d) => `${d.id}: ${d.name}`).join(', ');

          const prompt = `Question: "${questionText}"
Student Answer: "${sanitizedInput}"
Candidate Engineering Domains: [${domainOptions}]

Return ONLY a valid JSON object in this format:
{
  "inferredDomains": ["domain_id"],
  "sentiment": "positive",
  "confidence": 85,
  "explanation": "Brief explanation"
}`;

          const responseText = await session.prompt(prompt);
          session.destroy?.();

          // Parse JSON from Nano response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              inferredDomains: parsed.inferredDomains || [],
              sentiment: parsed.sentiment || 'positive',
              confidence: parsed.confidence || 80,
              explanation: parsed.explanation || 'Analyzed via Chrome on-device Gemini Nano',
              processedLocally: true,
            };
          }
        }
      } catch (nanoError) {
        console.warn('Chrome AI Nano runtime exception, falling back to local heuristic:', nanoError);
      }
    }
  }

  // Client-Side Deterministic Fallback (Zero network transfer, 100% PII safe)
  return fallbackClientProcessing(sanitizedInput, candidateDomains);
}

/**
 * Locally scrubs common PII patterns (emails, phone numbers, roll numbers)
 * in memory before any local AI tokenization.
 */
export function scrubPIILocally(text: string): string {
  if (!text) return '';
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/\b(\+?91[\-\s]?)?[6-9]\d{9}\b/g, '[REDACTED_PHONE]')
    .replace(/\b(101|102|103|104)\d{6,8}\b/gi, '[REDACTED_ROLL]');
}

/**
 * Pure client-side keyword and intent extractor when Chrome Built-in AI is not enabled.
 */
function fallbackClientProcessing(
  cleanText: string,
  candidateDomains: { id: string; name: string; keywords: string[] }[]
): AnswerAnalysisResult {
  const lower = cleanText.toLowerCase();
  const matched: string[] = [];

  for (const domain of candidateDomains) {
    const hasKeyword = domain.keywords.some((kw) => lower.includes(kw.toLowerCase()));
    const hasName = lower.includes(domain.name.toLowerCase());
    if (hasKeyword || hasName) {
      matched.push(domain.id);
    }
  }

  // Detect basic affinity sentiment
  const isPositive =
    lower.includes('like') ||
    lower.includes('love') ||
    lower.includes('enjoy') ||
    lower.includes('interested') ||
    lower.includes('fascinat') ||
    lower.includes('passion');

  const isNegative =
    lower.includes('dislike') ||
    lower.includes('hate') ||
    lower.includes('boring') ||
    lower.includes('never') ||
    lower.includes('not interested');

  return {
    inferredDomains: matched,
    sentiment: isNegative ? 'negative' : isPositive ? 'positive' : 'neutral',
    confidence: matched.length > 0 ? 80 : 50,
    explanation: 'Processed on-device via local client-side intent analyzer (PII Protected)',
    processedLocally: true,
  };
}
