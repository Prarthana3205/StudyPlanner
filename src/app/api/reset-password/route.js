import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) return Response.json({ error: 'Email and password required' }, { status: 400 });
  await dbConnect();
  const otpRecord = await Otp.findOne({ email });
  if (!otpRecord || !otpRecord.verified || otpRecord.expires < new Date()) {
    return Response.json({ error: 'OTP not verified or expired' }, { status: 400 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  await Otp.deleteOne({ email });
  return Response.json({ message: 'Password reset successful' });
}