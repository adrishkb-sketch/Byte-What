import { NextResponse } from 'next/server';
import { DOMAINS } from '@/data/domains';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: DOMAINS,
  });
}
