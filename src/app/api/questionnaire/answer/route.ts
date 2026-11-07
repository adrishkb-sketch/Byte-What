import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';
import { getNextAdaptiveQuestion, getAdaptiveCandidates, shouldStopQuestionnaire } from '@/lib/questionnaire/adaptive';
import { selectNextQuestionWithGemini } from '@/lib/ai/gemini';
import { QUESTION_MAP } from '@/data/questions';
import { Question, UserResponse } from '@/types';

const AnswerSchema = z.object({
  sessionId: z.string().min(5),
  questionId: z.string().min(2),
  selectedOptionId: z.string().optional(),
  numericValue: z.number().min(0).max(4).optional(),
  textResponse: z.string().max(1000).optional(),
  clientHistory: z.array(z.any()).optional(),
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

    // If client supplied history, ensure all are saved
    if (data.clientHistory && Array.isArray(data.clientHistory)) {
      for (const hist of data.clientHistory) {
        if (hist.questionId) {
          await Repository.saveResponse(data.sessionId, hist);
        }
      }
    }

    // Fetch all current responses for this session
    const currentResponses = await Repository.getResponses(data.sessionId);
    await Repository.upsertSession(data.sessionId, currentResponses.length, 'in_progress');

    // Check adaptive stopping (capped strictly at 20-25 questions)
    const shouldStop = shouldStopQuestionnaire(currentResponses);
    const isReadyToComplete = currentResponses.length >= 25 || (currentResponses.length >= 20 && shouldStop);
    const canFinishEarly = currentResponses.length >= 20;

    let nextQuestion: Question | null = null;

    if (!isReadyToComplete) {
      // 1. Gather candidate pool from 520-question bank
      const candidates = getAdaptiveCandidates(currentResponses, 20);

      // 2. Try Gemini adaptive question selection using rotated API keys
      try {
        const geminiSelectedId = await selectNextQuestionWithGemini(currentResponses, candidates);
        if (geminiSelectedId && QUESTION_MAP.has(geminiSelectedId)) {
          nextQuestion = QUESTION_MAP.get(geminiSelectedId)!;
        }
      } catch (err) {
        console.warn('Gemini question selection fallback to adaptive algorithm:', err);
      }

      // 3. Fallback to deterministic adaptive engine if Gemini returned null or failed
      if (!nextQuestion) {
        nextQuestion = getNextAdaptiveQuestion(currentResponses);
      }
    }

    // Never mark as ready to complete before 20 questions are answered
    const finalizedReady = currentResponses.length >= 25 || (currentResponses.length >= 20 && (isReadyToComplete || !nextQuestion));

    return NextResponse.json({
      success: true,
      data: {
        questionsAnswered: currentResponses.length,
        isReadyToComplete: finalizedReady,
        canFinishEarly,
        nextQuestion,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Invalid payload' }, { status: 400 });
  }
}

