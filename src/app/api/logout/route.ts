import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response with success message
    const response = NextResponse.json({
      message: 'Logout successful'
    });

    // Clear the token cookie by setting it with expired date
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
      expires: new Date(0), // Set to past date to ensure deletion
    });

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      error: 'Logout failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
