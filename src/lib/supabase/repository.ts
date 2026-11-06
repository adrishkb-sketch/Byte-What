import { supabaseServer, isServerSupabaseConfigured } from './server';
import {
  DomainId,
  QuestionnaireResultSummary,
  StudentSubmission,
  StudentDomainRank,
  UserResponse,
} from '@/types';
import { DOMAINS } from '@/data/domains';

interface MemoryStore {
  sessions: Map<string, { id: string; anonymousSessionId: string; status: string; questionsAnswered: number; startedAt: string; completedAt?: string }>;
  responses: Map<string, UserResponse[]>;
  results: Map<string, QuestionnaireResultSummary>;
  submissions: Map<string, StudentSubmission>;
  projects: Map<string, any>;
}

// Clean in-memory store with NO fake demo profiles
const memoryStore: MemoryStore = {
  sessions: new Map(),
  responses: new Map(),
  results: new Map(),
  submissions: new Map(),
  projects: new Map(),
};

export const Repository = {
  /**
   * Save or update a student submission with domain priority rankings
   */
  async saveStudentSubmission(data: {
    name: string;
    department: string;
    year: string;
    phoneNumber: string;
    pathChosen: 'self_selected' | 'questionnaire';
    rankings: StudentDomainRank[];
  }): Promise<StudentSubmission> {
    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const submission: StudentSubmission = {
      id: submissionId,
      name: data.name,
      department: data.department,
      year: data.year,
      phoneNumber: data.phoneNumber,
      pathChosen: data.pathChosen,
      rankings: data.rankings,
      createdAt: new Date().toISOString(),
    };

    if (isServerSupabaseConfigured && supabaseServer) {
      try {
        const { data: inserted, error } = await supabaseServer
          .from('student_submissions')
          .insert({
            name: submission.name,
            department: submission.department,
            year: submission.year,
            phone_number: submission.phoneNumber,
            path_chosen: submission.pathChosen,
            rankings: submission.rankings,
            created_at: submission.createdAt,
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase error inserting student_submission:', error);
        } else if (inserted) {
          submission.id = inserted.id;
        }
      } catch (err) {
        console.error('Supabase saveStudentSubmission exception:', err);
      }
    }

    memoryStore.submissions.set(submission.id, submission);
    return submission;
  },

  /**
   * Get student submissions filtered by domain, department, and year.
   * If a domain is specified, sorts students by their preference rank for that domain (rank 1 at top!).
   */
  async getStudentSubmissions(filters?: {
    domainId?: DomainId;
    department?: string;
    year?: string;
    searchQuery?: string;
  }): Promise<(StudentSubmission & { targetDomainRank?: number })[]> {
    let list: StudentSubmission[] = [];

    if (isServerSupabaseConfigured && supabaseServer) {
      try {
        let query = supabaseServer
          .from('student_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.department && filters.department !== 'All') {
          query = query.eq('department', filters.department);
        }
        if (filters?.year && filters.year !== 'All') {
          query = query.eq('year', filters.year);
        }

        const { data, error } = await query;
        if (!error && data) {
          list = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            department: row.department,
            year: row.year,
            phoneNumber: row.phone_number,
            pathChosen: row.path_chosen,
            rankings: row.rankings || [],
            createdAt: row.created_at,
          }));
        }
      } catch (err) {
        console.error('Supabase getStudentSubmissions exception:', err);
      }
    }

    // If Supabase returned no rows or is not configured, use memory store
    if (list.length === 0) {
      list = Array.from(memoryStore.submissions.values());
    }

    // Apply filters
    if (filters?.department && filters.department !== 'All') {
      list = list.filter((s) => s.department === filters.department);
    }
    if (filters?.year && filters.year !== 'All') {
      list = list.filter((s) => s.year === filters.year);
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q));
    }

    // If filtering by domain: only include students who selected this domain,
    // and sort them with the highest priority (lowest rank number: 1, 2, ...) at the top!
    if (filters?.domainId) {
      const filteredWithRank: (StudentSubmission & { targetDomainRank?: number })[] = [];

      for (const student of list) {
        const found = student.rankings.find((r) => r.domainId === filters.domainId);
        if (found) {
          filteredWithRank.push({
            ...student,
            targetDomainRank: found.rank,
          });
        }
      }

      // Sort by rank ascending (1 is highest priority), tie-broken by date
      filteredWithRank.sort((a, b) => {
        const rankA = a.targetDomainRank ?? 999;
        const rankB = b.targetDomainRank ?? 999;
        if (rankA !== rankB) {
          return rankA - rankB;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return filteredWithRank;
    }

    return list;
  },

  /**
   * Save or update an anonymous session
   */
  async upsertSession(anonymousSessionId: string, questionsAnswered: number, status: 'in_progress' | 'completed' = 'in_progress') {
    let session = memoryStore.sessions.get(anonymousSessionId);
    if (!session) {
      session = {
        id: `sess-${Date.now()}`,
        anonymousSessionId,
        status,
        questionsAnswered,
        startedAt: new Date().toISOString(),
      };
      memoryStore.sessions.set(anonymousSessionId, session);
    } else {
      session.questionsAnswered = questionsAnswered;
      session.status = status;
      if (status === 'completed') session.completedAt = new Date().toISOString();
    }
    return session;
  },

  /**
   * Store individual question response
   */
  async saveResponse(anonymousSessionId: string, response: UserResponse) {
    const list = memoryStore.responses.get(anonymousSessionId) || [];
    const filtered = list.filter((r) => r.questionId !== response.questionId);
    filtered.push(response);
    memoryStore.responses.set(anonymousSessionId, filtered);
  },

  /**
   * Get all responses for an anonymous session
   */
  async getResponses(anonymousSessionId: string): Promise<UserResponse[]> {
    return memoryStore.responses.get(anonymousSessionId) || [];
  },

  /**
   * Save calculated questionnaire results
   */
  async saveResults(summary: QuestionnaireResultSummary) {
    memoryStore.results.set(summary.sessionId, summary);
  },

  /**
   * Get results for an anonymous session
   */
  async getResults(anonymousSessionId: string): Promise<QuestionnaireResultSummary | null> {
    return memoryStore.results.get(anonymousSessionId) || null;
  },

  /**
   * Projects helper
   */
  async getProjects() {
    return Array.from(memoryStore.projects.values());
  },

  async createProject(project: any) {
    const id = `proj-${Date.now()}`;
    const item = { id, ...project, createdAt: new Date().toISOString() };
    memoryStore.projects.set(id, item);
    return item;
  },

  /**
   * Pure real-data analytics aggregated from actual student submissions
   */
  async getAnalytics() {
    const allSubmissions = await this.getStudentSubmissions();

    // Frequency count and top-choice count for all 20 domains
    const domainCounts: Record<DomainId, { totalSelected: number; topRanked: number }> = {} as any;
    DOMAINS.forEach((d) => {
      domainCounts[d.id] = { totalSelected: 0, topRanked: 0 };
    });

    const departmentCounts: Record<string, number> = {};
    const yearCounts: Record<string, number> = {};

    allSubmissions.forEach((sub) => {
      departmentCounts[sub.department] = (departmentCounts[sub.department] || 0) + 1;
      yearCounts[sub.year] = (yearCounts[sub.year] || 0) + 1;

      sub.rankings.forEach((r) => {
        if (domainCounts[r.domainId]) {
          domainCounts[r.domainId].totalSelected += 1;
          if (r.rank === 1) {
            domainCounts[r.domainId].topRanked += 1;
          }
        }
      });
    });

    const totalStudents = allSubmissions.length;

    const domainRankings = DOMAINS.map((domain) => {
      const stats = domainCounts[domain.id] || { totalSelected: 0, topRanked: 0 };
      const percentage = totalStudents > 0 ? Math.round((stats.totalSelected / totalStudents) * 100) : 0;
      return {
        id: domain.id,
        name: domain.name,
        category: domain.category,
        count: stats.totalSelected,
        topRankedCount: stats.topRanked,
        percentage,
      };
    }).sort((a, b) => b.count - a.count);

    return {
      totalSubmissions: totalStudents,
      departmentBreakdown: departmentCounts,
      yearBreakdown: yearCounts,
      domainRankings,
    };
  },
};
