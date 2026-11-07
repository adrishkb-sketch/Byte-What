import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';
import { DomainId } from '@/types';

const RankingItemSchema = z.object({
  domainId: z.string(),
  rank: z.number().int().min(1).max(20),
});

const SubmissionSchema = z.object({
  name: z.string().min(2).max(60),
  department: z.string().min(2).max(60),
  year: z.string().min(2).max(20),
  phoneNumber: z.string().min(6).max(20),
  pathChosen: z.enum(['self_selected', 'questionnaire']),
  rankings: z.array(RankingItemSchema).min(1),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get('domainId') as DomainId | null;
    const department = searchParams.get('department') || undefined;
    const year = searchParams.get('year') || undefined;
    const searchQuery = searchParams.get('search') || undefined;

    const list = await Repository.getStudentSubmissions({
      domainId: domainId || undefined,
      department,
      year,
      searchQuery,
    });

    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = SubmissionSchema.parse(body);

    const submission = await Repository.saveStudentSubmission({
      name: data.name,
      department: data.department,
      year: data.year,
      phoneNumber: data.phoneNumber,
      pathChosen: data.pathChosen,
      rankings: data.rankings as any,
    });

    return NextResponse.json({
      success: true,
      data: submission,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

