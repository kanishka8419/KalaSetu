import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes requiring authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/upload",
  "/my-products",
  "/enquiries",
  "/profile",
  "/admin",
];

// Role-specific route access
const ROLE_ROUTES: Record<string, string[]> = {
  artisan: ["/dashboard", "/upload", "/my-products", "/enquiries", "/profile"],
  buyer: ["/profile"],
  admin: ["/admin", "/profile"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for auth token in cookie or localStorage is not accessible in middleware
  // We rely on client-side auth check + redirect for now
  // This middleware primarily handles SSR-level redirect hints
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/my-products/:path*",
    "/enquiries/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
