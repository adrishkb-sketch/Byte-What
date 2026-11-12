import { NextRequest, NextResponse } from 'next/server';
import { Repository } from '@/lib/supabase/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all'; // 'pending' | 'valid' | 'all'
    const department = searchParams.get('department') || undefined;
    const year = searchParams.get('year') || undefined;
    const semester = searchParams.get('semester') || undefined;
    const searchQuery = searchParams.get('search') || undefined;

    let isValidFilter: boolean | 'all' = 'all';
    if (status === 'pending') isValidFilter = false;
    else if (status === 'valid') isValidFilter = true;

    const list = await Repository.getStudentSubmissions({
      department,
      year,
      semester,
      searchQuery,
      isValid: isValidFilter,
    });

    return NextResponse.json({
      success: true,
      data: list,
      total: list.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin submissions' },
      { status: 500 }
    );
  }
}
