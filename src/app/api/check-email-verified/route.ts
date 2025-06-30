import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Safely read the cookie (App Router style)
    const emailVerified = req.cookies.get('emailVerified')?.value === 'true';
    return NextResponse.json({ emailVerified });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { emailVerified: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
