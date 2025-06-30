import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Mock database (replace with real DB in production)
const users: { name: string; email: string; password: string }[] = [];

export async function POST(req: NextRequest) {
  const { name, email, password, confirmPassword } = await req.json();

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }
  if (users.find((u) => u.email === email)) {
    return NextResponse.json({ error: "Email already registered." }, { status: 400 });
  }

  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Store user (in-memory)
  users.push({ name, email, password: hashedPassword });

  return NextResponse.json({ message: "User registered successfully!" }, { status: 201 });
}