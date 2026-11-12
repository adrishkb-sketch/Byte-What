import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';

const LoginSchema = z.object({
  password: z.string().min(1),
  username: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = LoginSchema.parse(body);

    const isMatch = await Repository.authenticateAdmin(password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Incorrect admin credentials. Access denied.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
    });

    // Set secure cookie for admin session
    response.cookies.set({
      name: 'bytemonk_admin_token',
      value: 'admin_authenticated_session_token_bytemonk',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('bytemonk_admin_token');
  return response;
}

