import { NextResponse } from 'next/server';
import { ALL_QUESTIONS } from '@/data/questions';

export async function GET() {
  return NextResponse.json({
    success: true,
    totalCount: ALL_QUESTIONS.length,
    data: ALL_QUESTIONS,
  });
}

