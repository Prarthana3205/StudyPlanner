import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { sendMail } from "@/lib/sendMail";
import crypto from "crypto";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "practice";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!uri) {
      console.error("MONGODB_URI environment variable is not set");
      return NextResponse.json({ error: "Database connection not configured" }, { status: 500 });
    }

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const users = db.collection("users");
    const emailVerifications = db.collection("email_verifications");

    // Check if user already exists and is verified
    const existingUser = await users.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      await client.close();
      return NextResponse.json({ error: "Email is already registered and verified" }, { status: 400 });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store or update verification record
    await emailVerifications.replaceOne(
      { email },
      {
        email,
        verificationToken,
        verificationExpires,
        isVerified: false,
        createdAt: new Date()
      },
      { upsert: true }
    );

    // Create verification link
    const verificationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/email-verification?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // Send verification email
    await sendMail({
      to: email,
      subject: "Verify Your Email - DayDo",
      text: `
Hello,

Thank you for your interest in DayDo! Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours.

If you didn't request this verification, please ignore this email.

Best regards,
DayDo Team
      `
    });

    await client.close();

    return NextResponse.json({ 
      success: true, 
      message: "Verification email sent successfully" 
    }, { status: 200 });

  } catch (err) {
    console.error("Email verification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
