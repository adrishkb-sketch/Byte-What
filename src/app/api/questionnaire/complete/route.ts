import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';
import { generateQuestionnaireResults } from '@/lib/questionnaire/scoring';
import { explainInterestResults } from '@/lib/ai/gemini';
import { DomainId } from '@/types';

const CompleteSchema = z.object({
  sessionId: z.string().min(5),
  optionalStudentNotes: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = CompleteSchema.parse(body);

    const responses = await Repository.getResponses(sessionId);
    if (responses.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Insufficient questions answered to generate results' },
        { status: 400 }
      );
    }

    const sessionData = await Repository.upsertSession(sessionId, responses.length, 'completed');
    const startedAt = sessionData?.started_at || new Date().toISOString();

    // 1. Calculate deterministic scores
    const results = generateQuestionnaireResults(sessionId, startedAt, responses);

    // 2. Obtain top domain scores map
    const topDomainIds = results.primaryInterests.map((p) => p.domainId);
    const domainScoresMap: Record<DomainId, number> = {} as any;
    results.allDomainScores.forEach((s) => {
      domainScoresMap[s.domainId] = s.interestScore;
    });

    // 3. Call AI explanation (with graceful fallback if quota or offline)
    const aiInsight = await explainInterestResults(topDomainIds, domainScoresMap);

    results.writtenExplanation = aiInsight.writtenExplanation;
    results.suggestedProjects = aiInsight.suggestedProjects;
    results.crossDomainInsights = aiInsight.crossDomainInsights;

    // 4. Persist results
    await Repository.saveResults(results);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('Error completing questionnaire:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

