import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';
import { DomainId } from '@/types';

export const dynamic = 'force-dynamic';

const RankingItemSchema = z.object({
  domainId: z.string(),
  rank: z.number().int().min(1).max(20),
});

const SubmissionSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().optional(),
  department: z.string().min(2).max(60),
  year: z.string().min(2).max(20),
  semester: z.number().int().min(1).max(8).optional(),
  phoneNumber: z.string().min(6).max(20),
  pathChosen: z.enum(['self_selected', 'questionnaire']),
  rankings: z.array(RankingItemSchema).min(1),
  isVerified: z.boolean().optional(),
  verificationMethod: z.enum(['email_otp', 'manual_id_card', 'id_card_ai', 'oauth']).optional(),
  idCardUrl: z.string().optional(),
  idCardAiVerification: z.any().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get('domainId') as DomainId | null;
    const department = searchParams.get('department') || undefined;
    const year = searchParams.get('year') || undefined;
    const semester = searchParams.get('semester') || undefined;
    const searchQuery = searchParams.get('search') || undefined;
    const isValidParam = searchParams.get('isValid');

    let isValidFilter: boolean | 'all' = true; // By default for public category list: VALIDATED ONLY!
    if (isValidParam === 'all') isValidFilter = 'all';
    else if (isValidParam === 'false') isValidFilter = false;

    const list = await Repository.getStudentSubmissions({
      domainId: domainId || undefined,
      department,
      year,
      semester,
      searchQuery,
      isValid: isValidFilter,
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
      email: data.email,
      department: data.department,
      year: data.year,
      semester: data.semester,
      phoneNumber: data.phoneNumber,
      pathChosen: data.pathChosen,
      rankings: data.rankings as any,
      isVerified: data.isVerified,
      verificationMethod: data.verificationMethod,
      idCardUrl: data.idCardUrl,
      idCardAiVerification: data.idCardAiVerification,
    });

    return NextResponse.json({
      success: true,
      data: submission,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

