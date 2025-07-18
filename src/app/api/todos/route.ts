import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  
  if (!token) return null;

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const userId = payload.userId || payload.id || payload._id || null;
    return userId;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

// GET - Fetch user's todos
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let client;
  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();

    const todos = await db
      .collection("todos")
      .find({ userId: userId.toString() })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ todos });
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}

// POST - Create new todo
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let client;
  try {
    const body = await req.json();
    const { text, priority = "medium" } = body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json({ error: "Todo text is required" }, { status: 400 });
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return NextResponse.json({ error: "Invalid priority level" }, { status: 400 });
    }

    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();

    const newTodo = {
      userId: userId.toString(),
      text: text.trim(),
      priority,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("todos").insertOne(newTodo);
    const todo = { ...newTodo, _id: result.insertedId };

    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}

// PUT - Update todo (toggle completed or edit text)
export async function PUT(req: NextRequest) {
  const userId = await getUserId(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let client;
  try {
    const body = await req.json();
    const { todoId, completed, text } = body;

    if (!todoId) {
      return NextResponse.json({ error: "Todo ID is required" }, { status: 400 });
    }

    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();

    const updateData: any = { updatedAt: new Date() };
    
    if (typeof completed === "boolean") {
      updateData.completed = completed;
    }
    
    if (typeof text === "string" && text.trim() !== "") {
      updateData.text = text.trim();
    }

    const result = await db.collection("todos").updateOne(
      { 
        _id: new ObjectId(todoId), 
        userId: userId.toString() 
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}

// DELETE - Delete todo
export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let client;
  try {
    const { searchParams } = new URL(req.url);
    const todoId = searchParams.get("id");

    if (!todoId) {
      return NextResponse.json({ error: "Todo ID is required" }, { status: 400 });
    }

    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();

    const result = await db.collection("todos").deleteOne({
      _id: new ObjectId(todoId),
      userId: userId.toString(),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}