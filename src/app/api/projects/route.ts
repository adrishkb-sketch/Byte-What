import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';
import { DomainId } from '@/types';

const CreateProjectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  creatorPseudonym: z.string().min(2).max(40),
  creatorSessionId: z.string().optional(),
  domains: z.array(z.string()).min(1),
  skillRequirements: z.array(z.string()).default([]),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  status: z.enum(['Open', 'In Progress', 'Completed']).default('Open'),
  teamRequirements: z.string().min(3).max(200).default('Seeking collaborators'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domainFilter = searchParams.get('domain') as DomainId | null;
    const difficultyFilter = searchParams.get('difficulty');
    const statusFilter = searchParams.get('status');

    let projects = await Repository.getProjects();

    if (domainFilter) {
      projects = projects.filter((p) => p.domains.includes(domainFilter));
    }
    if (difficultyFilter && difficultyFilter !== 'All') {
      projects = projects.filter((p) => p.difficulty === difficultyFilter);
    }
    if (statusFilter && statusFilter !== 'All') {
      projects = projects.filter((p) => p.status === statusFilter);
    }

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateProjectSchema.parse(body);

    const newProject = await Repository.createProject({
      title: data.title,
      description: data.description,
      creatorPseudonym: data.creatorPseudonym,
      creatorSessionId: data.creatorSessionId,
      domains: data.domains as DomainId[],
      skillRequirements: data.skillRequirements,
      difficulty: data.difficulty,
      status: data.status,
      teamRequirements: data.teamRequirements,
    });

    return NextResponse.json({
      success: true,
      data: newProject,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
