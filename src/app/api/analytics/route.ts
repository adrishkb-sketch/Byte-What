import { NextRequest, NextResponse } from 'next/server';
import { Repository } from '@/lib/supabase/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department') || undefined;
    const year = searchParams.get('year') || undefined;
    const semester = searchParams.get('semester') || undefined;

    const analytics = await Repository.getAnalytics({
      department,
      year,
      semester,
    });

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

