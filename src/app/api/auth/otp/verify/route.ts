import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';

const OtpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = OtpVerifySchema.parse(body);

    const isValid = await Repository.verifyEmailOtp(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code. Please request a new OTP.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'College email verified successfully!',
      email: email.toLowerCase().trim(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 400 }
    );
  }
}

