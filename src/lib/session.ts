const SESSION_KEY = 'byte_what_anon_session_id';
const STUDENT_INFO_KEY = 'byte_what_student_info';

export interface StudentRegistrationInfo {
  name: string;
  email?: string;
  department: string;
  year: string;
  semester: number;
  phoneNumber: string;
  pathChosen?: 'self_selected' | 'questionnaire';
  isVerified?: boolean;
  verificationMethod?: 'email_otp' | 'id_card_ai' | 'oauth';
  idCardUrl?: string;
  idCardAiVerification?: any;
}

/**
 * Retrieves the local anonymous session ID or generates a new random UUID.
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
    localStorage.removeItem(STUDENT_INFO_KEY);
  }
}

export function saveStudentInfo(info: StudentRegistrationInfo): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STUDENT_INFO_KEY, JSON.stringify(info));
  }
}

export function getStudentInfo(): StudentRegistrationInfo | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STUDENT_INFO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
