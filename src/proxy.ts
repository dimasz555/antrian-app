import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

const PUBLIC_ROUTES = ["/display", "/kiosk", "/api/auth/login", "/api/antrian/stream"];

const AUTH_ROUTES = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    if (token) {
      try {
        const payload = verifyToken(token);
        if (payload.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/poli", request.url));
        } else {
          return NextResponse.redirect(new URL("/poli/antrian", request.url));
        }
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
