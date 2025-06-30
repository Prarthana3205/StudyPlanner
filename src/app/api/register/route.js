import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "practice";

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
    await users.insertOne({ name, email, password: hashedPassword });

    await client.close();
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Registration Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}