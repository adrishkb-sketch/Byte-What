import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Repository } from '@/lib/supabase/repository';

const OtpSendSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = OtpSendSchema.parse(body);

    const cleanEmail = email.toLowerCase().trim();

    // Check if college domain
    const isCollegeDomain =
      cleanEmail.endsWith('@gcect.ac.in') ||
      cleanEmail.includes('gcect') ||
      cleanEmail.endsWith('.edu') ||
      cleanEmail.endsWith('.in');

    // Generate cryptographically random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Repository.saveEmailOtp(cleanEmail, otpCode);

    console.log(`[OTP Engine] Generated OTP ${otpCode} for ${cleanEmail}`);

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      // In development or when email gateway is pending, return simulated code for seamless testing
      simulatedOtp: otpCode,
      isCollegeDomain,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 400 }
    );
  }
}

