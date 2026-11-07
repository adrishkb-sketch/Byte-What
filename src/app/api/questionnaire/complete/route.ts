import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';
import { generateQuestionnaireResults } from '@/lib/questionnaire/scoring';
import { explainInterestResults, rankInterestsWithGemini } from '@/lib/ai/gemini';
import { DomainId, UserResponse } from '@/types';

const CompleteSchema = z.object({
  sessionId: z.string().min(5),
  optionalStudentNotes: z.string().max(1000).optional(),
  responses: z.array(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, responses: clientResponses } = CompleteSchema.parse(body);

    let responses: UserResponse[] = await Repository.getResponses(sessionId);

    // If client supplied responses, merge them so session state is never lost
    if (clientResponses && Array.isArray(clientResponses) && clientResponses.length > 0) {
      if (responses.length < clientResponses.length) {
        responses = clientResponses;
        for (const resp of clientResponses) {
          if (resp.questionId) {
            await Repository.saveResponse(sessionId, resp);
          }
        }
      }
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please answer at least one question before completing.' },
        { status: 400 }
      );
    }

    const sessionData = await Repository.upsertSession(sessionId, responses.length, 'completed');
    const startedAt = (sessionData as any)?.startedAt || (sessionData as any)?.started_at || new Date().toISOString();

    // 1. Calculate deterministic scores
    const results = generateQuestionnaireResults(sessionId, startedAt, responses);

    // 2. Obtain top domain scores map
    const topDomainIds = results.primaryInterests.map((p) => p.domainId);
    const domainScoresMap: Record<DomainId, number> = {} as any;
    results.allDomainScores.forEach((s) => {
      domainScoresMap[s.domainId] = s.interestScore;
    });

    // 3. Call AI ranking with Gemini (using rotated API keys from pool)
    let geminiRankings = null;
    let geminiExplanation = null;
    try {
      const aiRank = await rankInterestsWithGemini(responses);
      if (aiRank) {
        geminiRankings = aiRank.rankings;
        geminiExplanation = aiRank.explanation;
      }
    } catch (err) {
      console.warn('Gemini interest ranking error (falling back to deterministic):', err);
    }

    // 4. Call AI explanation (with graceful fallback if quota or offline)
    const aiInsight = await explainInterestResults(topDomainIds, domainScoresMap);

    results.writtenExplanation = geminiExplanation || aiInsight.writtenExplanation;
    results.suggestedProjects = aiInsight.suggestedProjects;
    results.crossDomainInsights = aiInsight.crossDomainInsights;
    (results as any).geminiRankings = geminiRankings;

    // 5. Persist results
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

