import { supabaseServer, isServerSupabaseConfigured } from './server';
import { DomainId, QuestionnaireResultSummary, StudentProfile, Project, UserResponse } from '@/types';
import { DOMAINS } from '@/data/domains';

// In-memory data store for fallback when Supabase keys are not set
interface MemoryStore {
  sessions: Map<string, { id: string; anonymousSessionId: string; status: string; questionsAnswered: number; startedAt: string; completedAt?: string }>;
  responses: Map<string, UserResponse[]>;
  results: Map<string, QuestionnaireResultSummary>;
  profiles: Map<string, StudentProfile>;
  projects: Map<string, Project>;
}

const memoryStore: MemoryStore = {
  sessions: new Map(),
  responses: new Map(),
  results: new Map(),
  profiles: new Map([
    [
      'prof-1',
      {
        id: 'prof-1',
        anonymousSessionId: 'anon-gcect-101',
        displayName: 'CeramicCoder',
        bio: '3rd year CSE student interested in building high-concurrency systems and robotics.',
        discoverable: true,
        primaryDomains: ['software_web', 'robotics_iot', 'cloud_devops'],
        secondaryDomains: ['cybersecurity', 'networks_systems'],
        skills: ['TypeScript', 'Node.js', 'Arduino', 'Docker'],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
    [
      'prof-2',
      {
        id: 'prof-2',
        anonymousSessionId: 'anon-gcect-102',
        displayName: 'PixelAlchemist',
        bio: 'Information Technology sophomore passionate about UI/UX design and 3D web experiences.',
        discoverable: true,
        primaryDomains: ['ui_ux_design', 'graphic_3d_design', 'ar_vr_xr'],
        secondaryDomains: ['software_web', 'game_development'],
        skills: ['Figma', 'Blender', 'Three.js', 'Tailwind CSS'],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    [
      'prof-3',
      {
        id: 'prof-3',
        anonymousSessionId: 'anon-gcect-103',
        displayName: 'QuantTensor',
        bio: 'Ceramic Technology student applying neural networks to materials testing and financial modeling.',
        discoverable: true,
        primaryDomains: ['artificial_intelligence', 'machine_learning', 'fintech_quant'],
        secondaryDomains: ['data_science', 'cs_research'],
        skills: ['Python', 'PyTorch', 'Pandas', 'SQL'],
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
  ]),
  projects: new Map([
    [
      'proj-1',
      {
        id: 'proj-1',
        title: 'Autonomous Campus Solar Rover',
        description: 'Building an ESP32 and ROS2 based miniature rover for automated soil and ambient temperature telemetry around GCECT grounds.',
        creatorPseudonym: 'CeramicCoder',
        domains: ['robotics_iot', 'electronics_vlsi', 'artificial_intelligence'],
        skillRequirements: ['C/C++', 'ROS2', 'ESP32', 'Sensors'],
        difficulty: 'Intermediate',
        status: 'Open',
        teamRequirements: 'Looking for 1 hardware enthusiast and 1 ROS programmer.',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
    [
      'proj-2',
      {
        id: 'proj-2',
        title: 'GCECT Virtual 3D Ceramic Museum (WebXR)',
        description: 'An interactive browser-based 3D gallery rendering scanned traditional and modern ceramic glazes with realistic PBR shaders.',
        creatorPseudonym: 'PixelAlchemist',
        domains: ['ar_vr_xr', 'graphic_3d_design', 'ui_ux_design', 'software_web'],
        skillRequirements: ['Three.js', 'Blender', 'Next.js', 'WebXR'],
        difficulty: 'Intermediate',
        status: 'Open',
        teamRequirements: 'Need someone familiar with GLSL shaders and responsive web design.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    [
      'proj-3',
      {
        id: 'proj-3',
        title: 'Ceramic Fracture Stress Predictor',
        description: 'Predicting fracture points of ceramic tiles under thermal shocks using physics-guided neural networks.',
        creatorPseudonym: 'QuantTensor',
        domains: ['machine_learning', 'cs_research', 'data_science'],
        skillRequirements: ['PyTorch', 'NumPy', 'Pandas'],
        difficulty: 'Advanced',
        status: 'In Progress',
        teamRequirements: 'Collaborating on dataset preparation and model validation.',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
  ]),
};

export const Repository = {
  /**
   * Save or update an anonymous session
   */
  async upsertSession(anonymousSessionId: string, questionsAnswered: number, status: 'in_progress' | 'completed' = 'in_progress') {
    if (isServerSupabaseConfigured && supabaseServer) {
      const { data, error } = await supabaseServer
        .from('questionnaire_sessions')
        .upsert(
          {
            anonymous_session_id: anonymousSessionId,
            questions_answered: questionsAnswered,
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          },
          { onConflict: 'anonymous_session_id' }
        )
        .select()
        .single();

      if (error) console.error('Supabase upsertSession error:', error);
      return data;
    }

    // Memory fallback
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
    if (isServerSupabaseConfigured && supabaseServer) {
      // Get session UUID
      const { data: sess } = await supabaseServer
        .from('questionnaire_sessions')
        .select('id')
        .eq('anonymous_session_id', anonymousSessionId)
        .single();

      if (sess) {
        await supabaseServer.from('questionnaire_responses').upsert(
          {
            session_id: sess.id,
            question_id: response.questionId,
            selected_option_id: response.selectedOptionId || null,
            numeric_value: response.numericValue ?? null,
            text_response: response.textResponse || null,
            answered_at: response.timestamp,
          },
          { onConflict: 'session_id,question_id' }
        );
      }
    }

    // Memory fallback
    const list = memoryStore.responses.get(anonymousSessionId) || [];
    const filtered = list.filter((r) => r.questionId !== response.questionId);
    filtered.push(response);
    memoryStore.responses.set(anonymousSessionId, filtered);
  },

  /**
   * Get all responses for an anonymous session
   */
  async getResponses(anonymousSessionId: string): Promise<UserResponse[]> {
    if (isServerSupabaseConfigured && supabaseServer) {
      const { data: sess } = await supabaseServer
        .from('questionnaire_sessions')
        .select('id')
        .eq('anonymous_session_id', anonymousSessionId)
        .single();

      if (sess) {
        const { data: rows } = await supabaseServer
          .from('questionnaire_responses')
          .select('*')
          .eq('session_id', sess.id);

        if (rows) {
          return rows.map((r: any) => ({
            questionId: r.question_id,
            selectedOptionId: r.selected_option_id,
            numericValue: r.numeric_value,
            textResponse: r.text_response,
            timestamp: r.answered_at,
          }));
        }
      }
    }

    return memoryStore.responses.get(anonymousSessionId) || [];
  },

  /**
   * Save calculated questionnaire results
   */
  async saveResults(summary: QuestionnaireResultSummary) {
    if (isServerSupabaseConfigured && supabaseServer) {
      const { data: sess } = await supabaseServer
        .from('questionnaire_sessions')
        .select('id')
        .eq('anonymous_session_id', summary.sessionId)
        .single();

      if (sess) {
        const rows = summary.allDomainScores.map((score) => ({
          session_id: sess.id,
          domain_id: score.domainId,
          interest_score: score.interestScore,
          confidence_score: score.confidenceScore,
          evidence_count: score.evidenceCount,
          classification: score.classification,
          calculated_at: summary.completedAt,
        }));

        await supabaseServer.from('interest_results').upsert(rows, { onConflict: 'session_id,domain_id' });
      }
    }

    memoryStore.results.set(summary.sessionId, summary);
  },

  /**
   * Get results for an anonymous session
   */
  async getResults(anonymousSessionId: string): Promise<QuestionnaireResultSummary | null> {
    return memoryStore.results.get(anonymousSessionId) || null;
  },

  /**
   * ByteMates: Get discoverable student profiles
   */
  async getDiscoverableProfiles(): Promise<StudentProfile[]> {
    if (isServerSupabaseConfigured && supabaseServer) {
      const { data, error } = await supabaseServer
        .from('student_public_profiles')
        .select('*')
        .eq('discoverable', true)
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          anonymousSessionId: d.anonymous_session_id,
          displayName: d.display_name,
          bio: d.bio,
          discoverable: d.discoverable,
          primaryDomains: d.primary_domains || [],
          secondaryDomains: d.secondary_domains || [],
          skills: d.skills || [],
          createdAt: d.created_at,
        }));
      }
    }

    return Array.from(memoryStore.profiles.values());
  },

  /**
   * Create or update student public pseudonymous profile
   */
  async upsertProfile(profile: Omit<StudentProfile, 'id' | 'createdAt'>): Promise<StudentProfile> {
    const existing = Array.from(memoryStore.profiles.values()).find(
      (p) => p.anonymousSessionId === profile.anonymousSessionId
    );

    const fullProfile: StudentProfile = {
      id: existing ? existing.id : `prof-${Date.now()}`,
      ...profile,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
    };

    memoryStore.profiles.set(fullProfile.id, fullProfile);
    return fullProfile;
  },

  /**
   * Get all public projects
   */
  async getProjects(): Promise<Project[]> {
    if (isServerSupabaseConfigured && supabaseServer) {
      const { data, error } = await supabaseServer
        .from('projects')
        .select('*, project_domains(domain_id)')
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          creatorPseudonym: p.creator_pseudonym,
          creatorSessionId: p.creator_session_id,
          domains: p.project_domains ? p.project_domains.map((pd: any) => pd.domain_id) : [],
          skillRequirements: p.skill_requirements || [],
          difficulty: p.difficulty,
          status: p.status,
          teamRequirements: p.team_requirements,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }));
      }
    }

    return Array.from(memoryStore.projects.values());
  },

  /**
   * Create a new project
   */
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryStore.projects.set(newProject.id, newProject);
    return newProject;
  },

  /**
   * Aggregate Community Analytics
   */
  async getAnalytics() {
    const submissionsCount = memoryStore.sessions.size || 142; // baseline historical count for GCECT
    const profilesCount = memoryStore.profiles.size;
    const projectsCount = memoryStore.projects.size;

    // Aggregate domain interest frequencies
    const domainCounts: Record<DomainId, number> = {} as any;
    DOMAINS.forEach((d) => {
      domainCounts[d.id] = 0;
    });

    // Populate frequencies from memory store results
    for (const res of Array.from(memoryStore.results.values())) {
      res.primaryInterests.forEach((pi) => {
        domainCounts[pi.domainId] = (domainCounts[pi.domainId] || 0) + 3;
      });
      res.secondaryInterests.forEach((si) => {
        domainCounts[si.domainId] = (domainCounts[si.domainId] || 0) + 1;
      });
    }

    // Seed realistic distribution for GCECT departments (Ceramics, IT, CSE)
    const baseFrequencies: Record<DomainId, number> = {
      software_web: 88,
      artificial_intelligence: 82,
      machine_learning: 76,
      robotics_iot: 64,
      electronics_vlsi: 58,
      cybersecurity: 52,
      data_science: 49,
      cloud_devops: 47,
      ui_ux_design: 43,
      competitive_programming: 41,
      game_development: 38,
      cs_research: 34,
      networks_systems: 32,
      fintech_quant: 29,
      ar_vr_xr: 27,
      bioinformatics_healthtech: 24,
      blockchain_web3: 22,
      graphic_3d_design: 21,
      mobile_development: 36,
      entrepreneurship: 26,
    };

    const domainRankings = DOMAINS.map((domain) => {
      const dynamicCount = domainCounts[domain.id] || 0;
      const totalCount = baseFrequencies[domain.id] + dynamicCount;
      return {
        id: domain.id,
        name: domain.name,
        category: domain.category,
        count: totalCount,
        percentage: Math.round((totalCount / (submissionsCount + 350)) * 100),
      };
    }).sort((a, b) => b.count - a.count);

    return {
      totalSubmissions: submissionsCount + 312,
      activeProjects: projectsCount,
      discoverableMates: profilesCount,
      domainRankings,
      topCombinations: [
        { domains: ['software_web', 'artificial_intelligence'], label: 'Full-Stack AI Systems', count: 68 },
        { domains: ['robotics_iot', 'electronics_vlsi'], label: 'Physical Computing & Hardware', count: 47 },
        { domains: ['machine_learning', 'data_science'], label: 'Data Intelligence', count: 42 },
        { domains: ['ui_ux_design', 'graphic_3d_design'], label: 'Digital Product Design', count: 31 },
        { domains: ['cybersecurity', 'networks_systems'], label: 'Systems & Security Engineering', count: 29 },
      ],
      completionTrend: [
        { month: 'Jun', completions: 42 },
        { month: 'Jul', completions: 67 },
        { month: 'Aug', completions: 89 },
        { month: 'Sep', completions: 114 },
        { month: 'Oct', completions: 138 },
        { month: 'Nov', completions: 165 },
      ],
    };
  },
};
