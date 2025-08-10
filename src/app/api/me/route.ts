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
    const userId = payload.userId;
    console.log(`Fetching user with email: ${email}, userId: ${userId}`);
    
    if (!email && !userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();
    let user = await User.findOne({ email });
    console.log(`User found by email: ${!!user}`);

    // If user not found by email, try finding by userId (fallback for email change scenarios)
    if (!user && userId) {
      user = await User.findById(userId);
      console.log(`User found by userId: ${!!user}`);
    }

    if (!user) {
      console.log(`No user found for email: ${email}, userId: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      user: { 
        name: user.name, 
        email: user.email, 
        profilePhoto: user.profilePhoto, 
        bio: user.bio,
        occupation: user.occupation
      } 
    });
  } catch (err) {
    console.error("JWT error:", err);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload }: any = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const email = payload.email;
    const userId = payload.userId;
    if (!email && !userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email: newEmail, profilePhoto, bio, occupation } = body;

    await dbConnect();
    let user = await User.findOne({ email });

    // If user not found by email, try finding by userId (fallback for email change scenarios)
    if (!user && userId) {
      user = await User.findById(userId);
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if new email is already taken (if email is being updated)
    if (newEmail !== undefined && newEmail !== user.email) {
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
      }
    }

    // Update user fields
    if (name !== undefined) user.name = name;
    if (newEmail !== undefined) user.email = newEmail;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (bio !== undefined) user.bio = bio;
    if (occupation !== undefined) user.occupation = occupation;

    await user.save();

    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: { 
        name: user.name, 
        email: user.email, 
        profilePhoto: user.profilePhoto, 
        bio: user.bio,
        occupation: user.occupation
      } 
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}