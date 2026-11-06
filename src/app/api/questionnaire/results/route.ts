import { NextRequest, NextResponse } from 'next/server';
import { Repository } from '@/lib/supabase/repository';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
  }

  const results = await Repository.getResults(sessionId);
  if (!results) {
    return NextResponse.json({ success: false, error: 'Results not found for this session' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: results,
  });
}
