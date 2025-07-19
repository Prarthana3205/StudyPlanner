import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/sendMail';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';
import bcrypt from 'bcryptjs';

interface ResetPasswordRequestBody {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password }: ResetPasswordRequestBody = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    await dbConnect();
    
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || !otpRecord.verified || otpRecord.expires < new Date()) {
      return NextResponse.json({ error: 'OTP not verified or expired' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await Otp.deleteOne({ email });
    
    // Send confirmation email
    try {
      await sendMail({
        to: email,
        subject: 'Password Reset Successful',
        text: `Password Reset Successful

Your password has been successfully reset.

Your new password is now active.

If you didn't request this, please ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <p><strong>Password Reset Successful</strong></p>
            <p>Your password has been successfully reset.</p>
            <p>Your new password is now active.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
      console.log('Password reset confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the password reset if email fails
    }
    
    return NextResponse.json({ 
      message: 'Password reset successful',
      emailSent: true
    });
    
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
