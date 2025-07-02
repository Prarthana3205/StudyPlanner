import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload }: any = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const email = payload.email;
    if (!email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error("JWT error:", err);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}