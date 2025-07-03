import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    await dbConnect();
    const user = await User.findOne({ email }) as { _id: any; email: string; name: string; password: string };
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

  const token = jwt.sign(
    { email: user.email, userId: user._id.toString() }, // include userId
    JWT_SECRET,
    { expiresIn: '7d' }
  );

    // ✅ Store it in a cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: { email: user.email, name: user.name },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}