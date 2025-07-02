import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  console.log("JWT token from cookie:", token ? "present" : "missing");
  if (!token) return null;
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    console.log("Decoded JWT payload:", payload);
    const userId = payload.userId || payload.id || payload._id || null;
    console.log("Extracted userId from JWT:", userId);
    return userId;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    console.log("GET request failed: No userId found");
    return NextResponse.json({ events: [] }, { status: 401 });
  }

  let client;
  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    
    console.log("Fetching events for userId:", userId);
    
    // Fetch all events for the user
    const events = await db
      .collection("calendarEvents")
      .find({ userId: userId.toString() })
      .toArray();
      
    console.log("Found events:", events.length);
    console.log("Sample event:", events[0]);

    // Convert _id to string for frontend compatibility
    const eventsWithStringId = events.map(ev => ({
      ...ev,
      _id: ev._id?.toString?.() ?? undefined,
    }));

    return NextResponse.json({ events: eventsWithStringId });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ events: [] }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    console.log("POST request failed: No userId found");
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await req.json();
  console.log("Received POST body:", body);
  
  if (!body.date || !body.entries || !Array.isArray(body.entries)) {
    console.log("POST request failed: Missing required fields");
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  // Filter out completely empty entries
  const validEntries = body.entries.filter((entry: any) => 
    entry.title?.trim() || entry.description?.trim()
  );

  console.log("Valid entries to save:", validEntries);

  let client;
  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();

    if (validEntries.length === 0) {
      // If no valid entries, delete the document
      console.log("No valid entries, deleting document for date:", body.date);
      await db.collection("calendarEvents").deleteOne({
        userId: userId.toString(),
        date: body.date,
      });
    } else {
      // Save all entries for the day as a single document (overwrite previous)
      console.log("Saving entries for date:", body.date);
      const result = await db.collection("calendarEvents").updateOne(
        {
          userId: userId.toString(),
          date: body.date,
        },
        {
          $set: {
            userId: userId.toString(),
            date: body.date,
            entries: validEntries,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log("Save result:", result);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error saving events:", error);
    return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}