import { NextResponse } from 'next/server';
import { Repository } from '@/lib/supabase/repository';

export async function GET() {
  try {
    const analytics = await Repository.getAnalytics();
    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

