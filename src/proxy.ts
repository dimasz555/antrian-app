import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

const PUBLIC_ROUTES = [
  "/display",
  "/kiosk",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/favicon",
  "/api/antrian/stream",
  "/display/api",
];

const AUTH_ROUTES = ["/login"];

// Role → allowed path prefixes
const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  ADMIN: ["/admin"],
  PETUGAS_POLI: ["/petugas"],
};

// Default redirect per role setelah login
const ROLE_DEFAULT_REDIRECT: Record<string, string> = {
  ADMIN: "/admin/poli",
  PETUGAS_POLI: "/petugas/antrian",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Auth routes (/login)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute) {
    if (token) {
      try {
        const payload = verifyToken(token);
        const redirect = ROLE_DEFAULT_REDIRECT[payload.role] ?? "/login";
        return NextResponse.redirect(new URL(redirect, request.url));
      } catch {
        // token invalid — biarkan akses /login
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Public routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  if (isPublicRoute) return NextResponse.next();

  // protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return NextResponse.redirect(
      new URL("/login?reason=expired", request.url),
    );
  }

  // RBAC
  const allowedPaths = ROLE_ALLOWED_PATHS[payload.role] ?? [];
  const isAllowed = allowedPaths.some((p) => pathname.startsWith(p));

  if (!isAllowed) {
    // Akses ke path yang tidak diizinkan → redirect ke halaman default role
    const homeUrl = ROLE_DEFAULT_REDIRECT[payload.role] ?? "/login";
    return NextResponse.redirect(new URL(homeUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
