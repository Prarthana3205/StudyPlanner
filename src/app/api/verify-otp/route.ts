import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp';

interface VerifyOtpRequestBody {
  email: string;
  otp: string;
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp }: VerifyOtpRequestBody = await req.json();
    
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
    }

    await dbConnect();
    
    const record = await Otp.findOne({ email, otp });
    if (!record || record.verified || record.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    record.verified = true;
    await record.save();
    
    return NextResponse.json({ message: 'OTP verified successfully' });
    
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
