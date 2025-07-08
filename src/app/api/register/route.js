import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "practice";
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    if (existing) {
      await client.close();
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ name, email, password: hashedPassword });

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
  } catch (err) {
    console.error("Registration Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}