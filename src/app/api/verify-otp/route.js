import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp';

export async function POST(req) {
  const { email, otp } = await req.json();
  if (!email || !otp) return Response.json({ error: 'Email and OTP required' }, { status: 400 });
  await dbConnect();
  const record = await Otp.findOne({ email, otp });
  if (!record || record.verified || record.expires < new Date()) {
    return Response.json({ error: 'Invalid or expired OTP' }, { status: 400 });
  }
  record.verified = true;
  await record.save();
  return Response.json({ message: 'OTP verified' });
}