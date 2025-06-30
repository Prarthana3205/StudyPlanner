import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expires: { type: Date, required: true },
  verified: { type: Boolean, default: false },
});

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
