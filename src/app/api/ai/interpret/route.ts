import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { interpretStudentText } from '@/lib/ai/gemini';

const InterpretRequestSchema = z.object({
  text: z.string().min(5).max(1000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = InterpretRequestSchema.parse(body);

    const interpretation = await interpretStudentText(text);

    return NextResponse.json({
      success: true,
      data: interpretation,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Invalid input' }, { status: 400 });
  }
}
