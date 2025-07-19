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
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { name, email, password } = body;

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
