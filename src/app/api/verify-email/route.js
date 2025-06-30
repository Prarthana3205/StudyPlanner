import dbConnect from '@/lib/mongodb';
import VerificationToken from '@/models/VerificationToken';
import User from '@/models/User';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return Response.json({ error: 'Token required' }, { status: 400 });
  await dbConnect();
  const record = await VerificationToken.findOne({ token });
  if (!record || record.expires < new Date()) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
  await User.findOneAndUpdate({ email: record.email }, { emailVerified: true });
  await VerificationToken.deleteOne({ token });
  return Response.json({ message: 'Email verified!' });
}