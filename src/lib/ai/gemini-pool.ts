import { GoogleGenAI } from '@google/genai';

interface KeyState {
  key: string;
  cooldownUntil: number;
  failureCount: number;
}

class GeminiKeyManager {
  private keys: KeyState[] = [];
  private currentIndex: number = 0;
  private defaultModel: string;

  constructor() {
    this.defaultModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.initKeys();
  }

  private initKeys() {
    const rawKeys: string[] = [];

    // 1. Check GEMINI_API_KEYS (comma or newline separated list of 15-16 keys)
    if (process.env.GEMINI_API_KEYS) {
      const split = process.env.GEMINI_API_KEYS.split(/[,\n\s]+/).map((k) => k.trim()).filter(Boolean);
      rawKeys.push(...split);
    }

    // 2. Check individual GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
    for (let i = 1; i <= 30; i++) {
      const k = process.env[`GEMINI_API_KEY_${i}`];
      if (k && k.trim()) {
        rawKeys.push(k.trim());
      }
    }

    // 3. Check single GEMINI_API_KEY (could also be comma-separated)
    if (process.env.GEMINI_API_KEY) {
      const split = process.env.GEMINI_API_KEY.split(/[,\n\s]+/).map((k) => k.trim()).filter(Boolean);
      rawKeys.push(...split);
    }

    // Deduplicate
    const unique = Array.from(new Set(rawKeys));
    this.keys = unique.map((key) => ({
      key,
      cooldownUntil: 0,
      failureCount: 0,
    }));

    if (this.keys.length > 0) {
      console.log(`[GeminiKeyManager] Loaded ${this.keys.length} Gemini API keys for rotation.`);
    }
  }

  public getAvailableKeyCount(): number {
    return this.keys.length;
  }

  /**
   * Get the next usable key that is not in cooldown.
   */
  private getNextKey(): KeyState | null {
    if (this.keys.length === 0) return null;
    const now = Date.now();

    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.currentIndex + i) % this.keys.length;
      const candidate = this.keys[idx];
      if (candidate.cooldownUntil <= now) {
        this.currentIndex = (idx + 1) % this.keys.length;
        return candidate;
      }
    }

    // If all are in cooldown, return the one closest to expiring cooldown
    const sorted = [...this.keys].sort((a, b) => a.cooldownUntil - b.cooldownUntil);
    return sorted[0];
  }

  /**
   * Mark a key as having hit quota limit (429 / RESOURCE_EXHAUSTED)
   */
  private markKeyCooling(keyState: KeyState, cooldownMs: number = 60000) {
    keyState.cooldownUntil = Date.now() + cooldownMs;
    keyState.failureCount += 1;
    console.warn(`[GeminiKeyManager] Key ...${keyState.key.slice(-6)} hit rate-limit. Cooling for ${cooldownMs / 1000}s.`);
  }

  /**
   * Executes a prompt with automatic key rotation and retry across multiple keys.
   */
  public async generateContentWithRotation(prompt: string, modelOverride?: string): Promise<string | null> {
    if (this.keys.length === 0) {
      return null;
    }

    const modelName = modelOverride || this.defaultModel;
    const maxAttempts = Math.min(this.keys.length, 5); // try up to 5 different keys per request

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const keyState = this.getNextKey();
      if (!keyState) break;

      try {
        const client = new GoogleGenAI({ apiKey: keyState.key });

        // Add 3.5s timeout per attempt so API hiccups never block the user
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out')), 3500)
        );

        const contentPromise = client.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        const response = await Promise.race([contentPromise, timeoutPromise]);

        if (response && response.text) {
          // Success! Reset failure count
          keyState.failureCount = 0;
          return response.text;
        }
      } catch (err: any) {
        const errMsg = String(err?.message || err);
        const isQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');

        if (isQuota) {
          this.markKeyCooling(keyState, 60000); // 1 minute cooldown
        } else {
          keyState.failureCount += 1;
          console.warn(`[GeminiKeyManager] Error with key ...${keyState.key.slice(-6)}:`, errMsg);
        }
      }
    }

    return null;
  }
}

export const geminiPool = new GeminiKeyManager();

