import { NextRequest, NextResponse } from 'next/server';
import { Repository } from '@/lib/supabase/repository';

export async function POST(req: NextRequest) {
  try {
    const result = await Repository.advanceAcademicTerm();
    return NextResponse.json({
      success: true,
      message: `Academic term advanced successfully! Incremented semester for ${result.updatedCount} students.`,
      updatedCount: result.updatedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to advance academic term' },
      { status: 500 }
    );
  }
}
