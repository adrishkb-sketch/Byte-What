import { NextRequest, NextResponse } from 'next/server';
import { Repository } from '@/lib/supabase/repository';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('bw_student_token')?.value;
    if (token) {
      await Repository.invalidateStudentSession(token);
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
    response.cookies.delete('bw_student_token');
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
