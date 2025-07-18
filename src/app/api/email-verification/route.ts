import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "practice";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json({ error: "Token and email are required" }, { status: 400 });
    }

    if (!uri) {
      console.error("MONGODB_URI environment variable is not set");
      return NextResponse.json({ error: "Database connection not configured" }, { status: 500 });
    }

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const emailVerifications = db.collection("email_verifications");

    // Find verification record with matching token and email
    const verification = await emailVerifications.findOne({ 
      email,
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
      isVerified: false
    });

    if (!verification) {
      await client.close();
      return NextResponse.json({ 
        error: "Invalid or expired verification token" 
      }, { status: 400 });
    }

    // Mark verification as completed
    await emailVerifications.updateOne(
      { email, verificationToken: token },
      {
        $set: {
          isVerified: true,
          verifiedAt: new Date()
        }
      }
    );

    await client.close();

    return NextResponse.json({ 
      success: true, 
      message: "Email verified successfully" 
    }, { status: 200 });

  } catch (err) {
    console.error("Email verification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
