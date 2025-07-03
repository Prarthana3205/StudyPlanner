import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CalendarNote from "@/models/CalendarNote";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  await dbConnect();
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const notes = await CalendarNote.find({ userId: payload._id });
    return NextResponse.json({ notes });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const { year, month, day, entries } = await req.json();

    await CalendarNote.findOneAndUpdate(
      { userId: payload._id, year, month, day },
      { entries },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Error saving note" }, { status: 500 });
  }
}
