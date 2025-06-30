import dbConnect from '@/lib/mongodb';
import { sendMail } from '@/lib/sendMail';
import crypto from 'crypto';
import VerificationToken from '@/models/VerificationToken';

export async function POST(req) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: 'Email required' }, { status: 400 });
  await dbConnect();
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await VerificationToken.findOneAndDelete({ email });
  await VerificationToken.create({ email, token, expires });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const link = `${baseUrl}/verify-email?token=${token}`;
  await sendMail({
    to: email,
    subject: 'Verify your email',
    text: `Click this link to verify your email: ${link}`,
    html: `<p>Click the link below to verify your email:</p><p><a href="${link}">${link}</a></p>`
  });
  return Response.json({ message: 'Verification link sent to your email.' });
}