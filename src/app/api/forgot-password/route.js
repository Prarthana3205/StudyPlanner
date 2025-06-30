import { sendMail } from '@/lib/sendMail';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp';

export async function POST(req) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: 'Email required' }, { status: 400 });
  await dbConnect();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  await Otp.findOneAndDelete({ email }); // Remove any previous OTPs for this email
  await Otp.create({ email, otp, expires });
  try {
    await sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    });
  } catch (e) {
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
  return Response.json({ message: 'OTP sent to email' });
}