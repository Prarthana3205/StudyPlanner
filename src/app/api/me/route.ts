import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

// Replace with your MongoDB URI and JWT secret
const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    // 1. Get JWT token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ name: null }, { status: 401 });
    }

    // 2. Verify JWT and extract userId
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Uncomment for debugging:
      // console.error("JWT verification failed:", err);
      return NextResponse.json({ name: null }, { status: 401 });
    }

    // Debug: Check payload
    // console.log("JWT payload:", payload);

    // Some JWT libraries use "id", some use "_id", some use "userId"
    // Try all possible keys for user id
    const userId = payload.userId || payload.id || payload._id;
    if (!userId) {
      // Uncomment for debugging:
      // console.error("No userId in JWT payload:", payload);
      return NextResponse.json({ name: null }, { status: 401 });
    }

    // 3. Connect to MongoDB and fetch user
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    // Debug: Check userId type
    // console.log("MongoDB userId:", userId);
    let user;
    try {
      user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    } catch (err) {
      // If userId is not a valid ObjectId, try as string (for non-ObjectId _id)
      // console.error("ObjectId conversion failed, trying as string:", err);
      user = await db.collection("users").findOne({ _id: userId });
    }
    await client.close();

    // Debug: Check user result
    // console.log("User found:", user);

    if (!user) {
      // Uncomment for debugging:
      // console.error("No user found for userId:", userId);
      return NextResponse.json({ name: null }, { status: 404 });
    }

    // 4. Return the user's name
    return NextResponse.json({ name: user.name || null });
  } catch (err) {
    // Optionally log error for debugging
    // console.error("API /api/me error:", err);
    return NextResponse.json({ name: null }, { status: 500 });
  }
}
