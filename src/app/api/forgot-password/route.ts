import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/sendMail';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp';

export async function POST(req: NextRequest) {
  try {
    const { email }: { email: string } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await dbConnect();
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry
    
    // Remove any previous OTPs for this email
    await Otp.findOneAndDelete({ email });
    
    // Create new OTP record
    await Otp.create({ email, otp, expires });
    
    // Try to send email
    const emailResult = await sendMail({
      to: email,
      subject: 'Your Password Reset OTP Code',
      text: `Password Reset Request

Your OTP code for password reset is:
${otp}

This code will expire in 2 minutes.

If you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p style="color: #8B5CF6; font-size: 18px; font-weight: bold; margin-bottom: 20px;">Password Reset Request</p>
          <p>Your OTP code for password reset is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 32px; font-weight: bold; color: #8B5CF6; letter-spacing: 4px; margin: 0;">${otp}</p>
          </div>
          <p>This code will expire in 2 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });
    
    console.log('Email send result:', emailResult);
    
    // Check if email sending failed
    if (!emailResult.success) {
      // Delete the OTP since email failed
      await Otp.findOneAndDelete({ email });
      
      return NextResponse.json({ 
        error: 'Failed to send email. Please check your email address and try again.',
        details: process.env.NODE_ENV === 'development' ? emailResult.error : undefined
      }, { status: 500 });
    }
    
    // Check if it's just a development log (no real email sent)
    if (emailResult.message && emailResult.message.includes('console')) {
      return NextResponse.json({ 
        message: 'OTP generated. Email credentials not configured - check server console for OTP.',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        development: true
      });
    }
    
    return NextResponse.json({ 
      message: 'OTP sent to email successfully',
      debug: process.env.NODE_ENV === 'development' ? { emailResult } : undefined
    });
    
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
