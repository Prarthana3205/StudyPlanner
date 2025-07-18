// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip JWT check for public routes and static files
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret); // If invalid, throws
    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Apply to specific routes (optional)
export const config = {
  matcher: ["/dashboard/:path*", "/calendar/:path*"], // Protect only dashboard/calendar routes
};