import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';
import { getNextAdaptiveQuestion } from '@/lib/questionnaire/adaptive';

const StartSchema = z.object({
  sessionId: z.string().min(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = StartSchema.parse(body);

    const session = await Repository.upsertSession(sessionId, 0, 'in_progress');
    const existingResponses = await Repository.getResponses(sessionId);
    const firstQuestion = getNextAdaptiveQuestion(existingResponses);

    return NextResponse.json({
      success: true,
      data: {
        session,
        nextQuestion: firstQuestion,
        responsesCount: existingResponses.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Invalid request' }, { status: 400 });
  }
}
