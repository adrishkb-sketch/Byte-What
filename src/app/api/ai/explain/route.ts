import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { explainInterestResults } from '@/lib/ai/gemini';
import { DomainIdEnum } from '@/lib/validations/ai';

const ExplainRequestSchema = z.object({
  topDomains: z.array(DomainIdEnum).min(1).max(5),
  scores: z.record(z.string(), z.number()).default({}),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topDomains, scores } = ExplainRequestSchema.parse(body);

    const explanation = await explainInterestResults(topDomains as any, scores as any);

    return NextResponse.json({
      success: true,
      data: explanation,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Invalid input' }, { status: 400 });
  }
}

