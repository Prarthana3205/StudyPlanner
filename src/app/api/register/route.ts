import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "practice";
const JWT_SECRET = process.env.JWT_SECRET!;

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  emailChangeVerification?: boolean;
  currentUserId?: string;
}

interface User {
  _id?: any;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
}

interface EmailVerification {
  email: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  emailChangeFor?: string;
  createdAt?: Date;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { name, email, password, emailChangeVerification, currentUserId } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!uri || !JWT_SECRET) {
      console.error("Missing required environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const users = db.collection<User>("users");
    const emailVerifications = db.collection<EmailVerification>("email_verifications");

    // Handle email change verification
    if (emailChangeVerification && currentUserId) {
      // Check if new email already exists for another user
      const existing = await users.findOne({ email });
      if (existing) {
        await client.close();
        return NextResponse.json({ error: "Email already in use by another account" }, { status: 409 });
      }

      // Generate verification token and send email
      const crypto = require('crypto');
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification record with flag for email change
      await emailVerifications.insertOne({
        email,
        isVerified: false,
        verificationToken,
        verificationExpires,
        emailChangeFor: currentUserId, // Flag to identify this is for email change
        createdAt: new Date()
      });

      // Send verification email
      const { sendMail } = require('../../../lib/sendMail');
      const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/profile-email-verification?token=${verificationToken}&email=${encodeURIComponent(email)}`;

      await sendMail({
        to: email,
        subject: "Verify Your New Email Address - StudyPlanner",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Verify Your New Email Address</h2>
            <p>You requested to change your email address on StudyPlanner.</p>
            <p>Click the button below to verify your new email address:</p>
            <a href="${verificationUrl}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Verify New Email
            </a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #7c3aed;">${verificationUrl}</p>
            <p><strong>This verification link will expire in 24 hours.</strong></p>
            <p>If you didn't request this email change, please ignore this email.</p>
          </div>
        `,
        text: `Verify your new email address by clicking this link: ${verificationUrl}`
      });

      await client.close();
      return NextResponse.json({ 
        success: true, 
        message: "Verification email sent to new email address" 
      }, { status: 200 });
    }

    // Regular registration flow (existing code continues...)
    const existing = await users.findOne({ email });
    if (existing) {
      await client.close();
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Check if email was verified
    const verification = await emailVerifications.findOne({ 
      email, 
      isVerified: true 
    });
    
    if (!verification) {
      await client.close();
      return NextResponse.json({ 
        error: "Email must be verified before registration" 
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ 
      name, 
      email, 
      password: hashedPassword,
      isEmailVerified: true
    });

    // Clean up verification record
    await emailVerifications.deleteOne({ email });

    // Create JWT token for automatic login
    const token = jwt.sign(
      { email: email, userId: result.insertedId.toString() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await client.close();

    // Create response with authentication cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { name, email }
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error("Registration Error:", err);
    return NextResponse.json({ 
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}
