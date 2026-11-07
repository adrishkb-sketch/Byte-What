import { supabaseServer, isServerSupabaseConfigured } from './server';
import { sql, isPostgresConfigured } from '@/lib/db/postgres';
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

const globalForByteWhat = globalThis as unknown as {
  __byteWhatMemoryStore?: MemoryStore;
};

// Resilient in-memory store preserved across Next.js dev reloads
export const memoryStore: MemoryStore =
  globalForByteWhat.__byteWhatMemoryStore || {
    sessions: new Map(),
    responses: new Map(),
    results: new Map(),
    submissions: new Map(),
    projects: new Map(),
  };

globalForByteWhat.__byteWhatMemoryStore = memoryStore;

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

    // 1. Neon Postgres / Standard Postgres
    if (isPostgresConfigured && sql) {
      try {
        const rows = await sql(
          `INSERT INTO student_submissions (name, department, year, phone_number, path_chosen, rankings, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            submission.name,
            submission.department,
            submission.year,
            submission.phoneNumber,
            submission.pathChosen,
            JSON.stringify(submission.rankings),
            submission.createdAt,
          ]
        );
        if (rows && rows.length > 0 && rows[0].id) {
          submission.id = String(rows[0].id);
        }
      } catch (err) {
        console.error('Neon/Postgres saveStudentSubmission exception:', err);
      }
    } else if (isServerSupabaseConfigured && supabaseServer) {
      // 2. Supabase
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

    // Always keep in memory store
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

    // 1. Neon Postgres / Standard Postgres
    if (isPostgresConfigured && sql) {
      try {
        let queryStr = `SELECT * FROM student_submissions WHERE 1=1`;
        const params: any[] = [];

        if (filters?.department && filters.department !== 'All') {
          params.push(filters.department);
          queryStr += ` AND department = $${params.length}`;
        }
        if (filters?.year && filters.year !== 'All') {
          params.push(filters.year);
          queryStr += ` AND year = $${params.length}`;
        }

        queryStr += ` ORDER BY created_at DESC`;

        const rows = await sql(queryStr, params);
        if (rows && rows.length > 0) {
          list = rows.map((row: any) => ({
            id: String(row.id),
            name: row.name,
            department: row.department,
            year: row.year,
            phoneNumber: row.phone_number,
            pathChosen: row.path_chosen,
            rankings: typeof row.rankings === 'string' ? JSON.parse(row.rankings) : (row.rankings || []),
            createdAt: row.created_at,
          }));
        }
      } catch (err) {
        console.error('Neon/Postgres getStudentSubmissions exception:', err);
      }
    } else if (isServerSupabaseConfigured && supabaseServer) {
      // 2. Supabase
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

    // If database returned no rows or is not configured, use memory store
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

    if (isPostgresConfigured && sql) {
      try {
        await sql(
          `INSERT INTO anonymous_sessions (id, anonymous_session_id, status, questions_answered, started_at, completed_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (anonymous_session_id)
           DO UPDATE SET questions_answered = $4, status = $3, completed_at = $6`,
          [session.id, session.anonymousSessionId, session.status, session.questionsAnswered, session.startedAt, session.completedAt || null]
        );
      } catch (err) {
        // Fall back cleanly to memory store
      }
    } else if (isServerSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('anonymous_sessions').upsert(
          {
            id: session.id,
            anonymous_session_id: session.anonymousSessionId,
            status: session.status,
            questions_answered: session.questionsAnswered,
            started_at: session.startedAt,
            completed_at: session.completedAt || null,
          },
          { onConflict: 'anonymous_session_id' }
        );
      } catch (err) {
        // Fall back cleanly to memory store
      }
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

    if (isPostgresConfigured && sql) {
      try {
        await sql(
          `INSERT INTO questionnaire_responses (session_id, question_id, selected_option_id, numeric_value, text_response, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            anonymousSessionId,
            response.questionId,
            response.selectedOptionId || null,
            response.numericValue !== undefined ? response.numericValue : null,
            response.textResponse || null,
            response.timestamp || new Date().toISOString(),
          ]
        );
      } catch (err) {
        // Fall back cleanly to memory store
      }
    } else if (isServerSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('questionnaire_responses').insert({
          session_id: anonymousSessionId,
          question_id: response.questionId,
          selected_option_id: response.selectedOptionId || null,
          numeric_value: response.numericValue !== undefined ? response.numericValue : null,
          text_response: response.textResponse || null,
          created_at: response.timestamp || new Date().toISOString(),
        });
      } catch (err) {
        // Fall back cleanly to memory store
      }
    }
  },

  /**
   * Get all responses for an anonymous session
   */
  async getResponses(anonymousSessionId: string): Promise<UserResponse[]> {
    if (isPostgresConfigured && sql) {
      try {
        const rows = await sql(
          `SELECT * FROM questionnaire_responses WHERE session_id = $1 ORDER BY created_at ASC`,
          [anonymousSessionId]
        );
        if (rows && rows.length > 0) {
          return rows.map((row: any) => ({
            questionId: row.question_id,
            selectedOptionId: row.selected_option_id || undefined,
            numericValue: row.numeric_value !== null ? row.numeric_value : undefined,
            textResponse: row.text_response || undefined,
            timestamp: row.created_at,
          }));
        }
      } catch (err) {
        // Fall back cleanly to memory store
      }
    } else if (isServerSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('questionnaire_responses')
          .select('*')
          .eq('session_id', anonymousSessionId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            questionId: row.question_id,
            selectedOptionId: row.selected_option_id || undefined,
            numericValue: row.numeric_value !== null ? row.numeric_value : undefined,
            textResponse: row.text_response || undefined,
            timestamp: row.created_at,
          }));
        }
      } catch (err) {
        // Fall back cleanly to memory store
      }
    }

    return memoryStore.responses.get(anonymousSessionId) || [];
  },

  /**
   * Save calculated questionnaire results
   */
  async saveResults(summary: QuestionnaireResultSummary) {
    memoryStore.results.set(summary.sessionId, summary);

    if (isPostgresConfigured && sql) {
      try {
        await sql(
          `INSERT INTO questionnaire_results (session_id, data, created_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (session_id)
           DO UPDATE SET data = $2`,
          [summary.sessionId, JSON.stringify(summary), summary.completedAt || new Date().toISOString()]
        );
      } catch (err) {
        // Fall back cleanly to memory store
      }
    } else if (isServerSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.from('questionnaire_results').upsert(
          {
            session_id: summary.sessionId,
            data: summary,
            created_at: summary.completedAt || new Date().toISOString(),
          },
          { onConflict: 'session_id' }
        );
      } catch (err) {
        // Fall back cleanly to memory store
      }
    }
  },

  /**
   * Get results for an anonymous session
   */
  async getResults(anonymousSessionId: string): Promise<QuestionnaireResultSummary | null> {
    if (isPostgresConfigured && sql) {
      try {
        const rows = await sql(
          `SELECT data FROM questionnaire_results WHERE session_id = $1 LIMIT 1`,
          [anonymousSessionId]
        );
        if (rows && rows.length > 0 && rows[0].data) {
          return typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
        }
      } catch (err) {
        // Fall back cleanly to memory store
      }
    } else if (isServerSupabaseConfigured && supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('questionnaire_results')
          .select('data')
          .eq('session_id', anonymousSessionId)
          .single();

        if (!error && data && data.data) {
          return data.data as QuestionnaireResultSummary;
        }
      } catch (err) {
        // Fall back cleanly to memory store
      }
    }

    return memoryStore.results.get(anonymousSessionId) || null;
  },

  /**
   * Projects helper
   */
  async getProjects() {
    if (isPostgresConfigured && sql) {
      try {
        const rows = await sql(`SELECT * FROM projects ORDER BY created_at DESC`);
        if (rows && rows.length > 0) {
          return rows.map((row: any) => ({
            id: String(row.id),
            title: row.title,
            description: row.description,
            creatorPseudonym: row.creator_pseudonym,
            creatorSessionId: row.creator_session_id,
            domains: typeof row.domains === 'string' ? JSON.parse(row.domains) : (row.domains || []),
            skillRequirements: typeof row.skill_requirements === 'string' ? JSON.parse(row.skill_requirements) : (row.skill_requirements || []),
            difficulty: row.difficulty,
            status: row.status,
            teamRequirements: row.team_requirements,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
        }
      } catch (err) {
        // Fall back cleanly to memory store
      }
    }
    return Array.from(memoryStore.projects.values());
  },

  async createProject(project: any) {
    const id = `proj-${Date.now()}`;
    const item = { id, ...project, createdAt: new Date().toISOString() };
    if (isPostgresConfigured && sql) {
      try {
        const rows = await sql(
          `INSERT INTO projects (title, description, creator_pseudonym, creator_session_id, domains, skill_requirements, difficulty, status, team_requirements, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING id`,
          [
            project.title,
            project.description,
            project.creatorPseudonym,
            project.creatorSessionId || null,
            JSON.stringify(project.domains || []),
            JSON.stringify(project.skillRequirements || []),
            project.difficulty || 'Intermediate',
            project.status || 'Open',
            project.teamRequirements || '',
            item.createdAt,
            item.createdAt,
          ]
        );
        if (rows && rows.length > 0 && rows[0].id) {
          item.id = String(rows[0].id);
        }
      } catch (err) {
        // Fall back cleanly to memory store
      }
    }
    memoryStore.projects.set(item.id, item);
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

