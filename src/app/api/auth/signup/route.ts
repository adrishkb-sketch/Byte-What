import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';

export const dynamic = 'force-dynamic';

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().min(2),
  year: z.string().min(2),
  semester: z.number().int().min(1).max(8),
  phoneNumber: z.string().min(6, 'Please enter a valid phone number'),
  verificationMethod: z.enum(['email_otp', 'manual_id_card']),
  idCardUrl: z.string().optional(),
  isVerified: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = SignupSchema.parse(body);

    if (data.verificationMethod === 'manual_id_card' && !data.idCardUrl) {
      return NextResponse.json(
        { success: false, error: 'Please upload an image of your physical College ID card for manual review.' },
        { status: 400 }
      );
    }

    const { student, token } = await Repository.registerStudent({
      name: data.name,
      email: data.email,
      password: data.password,
      department: data.department,
      year: data.year,
      semester: data.semester,
      phoneNumber: data.phoneNumber,
      verificationMethod: data.verificationMethod,
      idCardUrl: data.idCardUrl,
      isVerified: Boolean(data.isVerified),
    });

    const response = NextResponse.json({
      success: true,
      data: student,
      message: 'Account created successfully. Awaiting manual admin verification.',
    });

    // Set secure HTTP-only session cookie
    response.cookies.set('bw_student_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create student account.' },
      { status: 400 }
    );
  }
}
