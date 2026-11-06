const SESSION_KEY = 'byte_what_anon_session_id';

/**
 * Retrieves the local anonymous session ID or generates a new random UUID.
 * Purely anonymous: no email, roll number, or personal identifiers are stored.
 */
export function getOrCreateAnonymousSessionId(): string {
  if (typeof window === 'undefined') {
    return 'anon-server-temp';
  }

  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `anon-${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function clearAnonymousSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}
