import { describe, it, expect } from 'vitest';
import { scrubPIILocally } from '../src/lib/ai/chrome-ai';
import crypto from 'node:crypto';

describe('Chrome Built-in AI PII Protection & Local Processing', () => {
  it('redacts email addresses before local tokenization to preserve student privacy', () => {
    const raw = 'My name is Adrish and my email is student@gcect.ac.in. I like machine learning.';
    const scrubbed = scrubPIILocally(raw);
    expect(scrubbed).not.toContain('student@gcect.ac.in');
    expect(scrubbed).toContain('[REDACTED_EMAIL]');
    expect(scrubbed).toContain('machine learning');
  });

  it('redacts phone numbers before local tokenization', () => {
    const raw = 'Contact me at +91 9876543210 regarding the robotics club.';
    const scrubbed = scrubPIILocally(raw);
    expect(scrubbed).not.toContain('9876543210');
    expect(scrubbed).toContain('[REDACTED_PHONE]');
    expect(scrubbed).toContain('robotics club');
  });

  it('redacts institutional roll numbers', () => {
    const raw = 'Roll number 10100121045 working on web development.';
    const scrubbed = scrubPIILocally(raw);
    expect(scrubbed).not.toContain('10100121045');
    expect(scrubbed).toContain('[REDACTED_ROLL]');
  });
});

describe('Student Password Hashing Security', () => {
  it('correctly hashes and verifies passwords using crypto.scrypt', () => {
    const password = 'GcectSecretPassword2026';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const stored = `${salt}:${hash}`;

    const [retrievedSalt, retrievedKey] = stored.split(':');
    const testKey = crypto.scryptSync('GcectSecretPassword2026', retrievedSalt, 64);
    const isValid = crypto.timingSafeEqual(Buffer.from(retrievedKey, 'hex'), testKey);
    expect(isValid).toBe(true);

    const wrongKey = crypto.scryptSync('WrongPassword', retrievedSalt, 64);
    const isWrongValid = crypto.timingSafeEqual(Buffer.from(retrievedKey, 'hex'), wrongKey);
    expect(isWrongValid).toBe(false);
  });
});
