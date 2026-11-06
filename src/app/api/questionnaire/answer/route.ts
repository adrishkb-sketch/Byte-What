import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';
import { getNextAdaptiveQuestion, shouldStopQuestionnaire } from '@/lib/questionnaire/adaptive';
import { UserResponse } from '@/types';

const AnswerSchema = z.object({
  sessionId: z.string().min(5),
  questionId: z.string().min(2),
  selectedOptionId: z.string().optional(),
  numericValue: z.number().min(0).max(4).optional(),
  textResponse: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = AnswerSchema.parse(body);

    const responseItem: UserResponse = {
      questionId: data.questionId,
      selectedOptionId: data.selectedOptionId,
      numericValue: data.numericValue,
      textResponse: data.textResponse,
      timestamp: new Date().toISOString(),
    };

    // Save response to DB/memory
    await Repository.saveResponse(data.sessionId, responseItem);

    // Fetch all current responses for this session
    const currentResponses = await Repository.getResponses(data.sessionId);
    await Repository.upsertSession(data.sessionId, currentResponses.length, 'in_progress');

    // Check adaptive stopping
    const isReadyToComplete = shouldStopQuestionnaire(currentResponses);
    const canFinishEarly = currentResponses.length >= 10;
    const nextQuestion = !isReadyToComplete ? getNextAdaptiveQuestion(currentResponses) : null;

    return NextResponse.json({
      success: true,
      data: {
        questionsAnswered: currentResponses.length,
        isReadyToComplete,
        canFinishEarly,
        nextQuestion,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Invalid payload' }, { status: 400 });
  }
}

