import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

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
      return NextResponse.json({ error: "Database connection not configured" }, { status: 500 });
    }

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const emailVerifications = db.collection("email_verifications");

    // Check if email verification exists and is verified
    const verification = await emailVerifications.findOne({ 
      email,
      isVerified: true 
    });

    await client.close();

    return NextResponse.json({ 
      isVerified: !!verification
    }, { status: 200 });

  } catch (err) {
    console.error("Check verification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
