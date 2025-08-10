import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "practice";
const JWT_SECRET = process.env.JWT_SECRET!;

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

    // If this is for email change, update the user's email
    if (verification.emailChangeFor) {
      console.log(`Processing email change from ${verification.emailChangeFor} to ${email}`);
      const users = db.collection("users");
      const userResult = await users.updateOne(
        { email: verification.emailChangeFor },
        {
          $set: {
            email: email,
            isEmailVerified: true
          }
        }
      );

      console.log(`User update result:`, userResult);

      // Create a new JWT token with the updated email
      if (userResult.modifiedCount > 0) {
        const updatedUser = await users.findOne({ email: email });
        if (updatedUser) {
          console.log(`Creating new JWT token for user:`, updatedUser._id);
          const newToken = jwt.sign(
            { email: email, userId: updatedUser._id.toString() },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          await client.close();

          // Create response with updated JWT token
          const response = NextResponse.json({ 
            success: true, 
            message: "Email changed successfully" 
          }, { status: 200 });

          response.cookies.set('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
          });

          console.log(`Email change complete, new token set`);
          return response;
        }
      }
    }

    await client.close();

    return NextResponse.json({ 
      success: true, 
      message: verification.emailChangeFor ? "Email changed successfully" : "Email verified successfully" 
    }, { status: 200 });

  } catch (err) {
    console.error("Email verification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
