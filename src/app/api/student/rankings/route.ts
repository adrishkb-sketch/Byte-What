import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';

export const dynamic = 'force-dynamic';

const RankingItemSchema = z.object({
  domainId: z.string(),
  rank: z.number().int().min(1).max(20),
});

const UpdateRankingsSchema = z.object({
  rankings: z.array(RankingItemSchema).min(1, 'Please select at least 1 domain'),
  pathChosen: z.enum(['self_selected', 'questionnaire']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('bw_student_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in to your student account.' },
        { status: 401 }
      );
    }

    const currentStudent = await Repository.getStudentBySessionToken(token);
    if (!currentStudent) {
      return NextResponse.json(
        { success: false, error: 'Student session expired. Please log in again.' },
        { status: 401 }
      );
    }

    // STRICT CHECK: Must be verified by admin
    if (!currentStudent.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Your account is pending admin manual verification. You will be able to submit interests once verified.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = UpdateRankingsSchema.parse(body);

    const updated = await Repository.updateStudentRankings(
      currentStudent.id,
      data.rankings as any,
      data.pathChosen || 'self_selected'
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Interests and domain rankings saved successfully!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save rankings.' },
      { status: 400 }
    );
  }
}
