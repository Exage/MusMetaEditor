import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse<{ message: string }>> {
  return NextResponse.json({
    message: 'ok',
  });
}
