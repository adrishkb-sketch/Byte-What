import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyCollegeIdCardWithAi } from '@/lib/ai/gemini';

const IdCardSchema = z.object({
  imageBase64: z.string().min(50),
  mimeType: z.string().default('image/jpeg'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = IdCardSchema.parse(body);

    const verificationResult = await verifyCollegeIdCardWithAi(imageBase64, mimeType);

    return NextResponse.json({
      success: true,
      data: verificationResult,
    });
  } catch (error: any) {
    console.error('ID Card AI verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process ID card image' },
      { status: 400 }
    );
  }
}
