import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
    // Retrieve the token cookie
  const tokenCookie = request.cookies.get("token");
  // If user is already logged in and is visiting public pages, redirect them to the root.
  if (
    (pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/register") ||
      pathname.startsWith("/auth/confirmemail")) &&
    tokenCookie
  ) {
    const rootUrl = request.nextUrl.clone();
    rootUrl.pathname = "/";
    return NextResponse.redirect(rootUrl);
  }

  // Exclude public routes from authentication (e.g., login, register, API routes)
  if (
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/confirmemail") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  if (!tokenCookie) {
    // If not logged in, redirect to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  response.cookies.set("token", tokenCookie.value, {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });

  return response;
}

// Optional: limit middleware to certain paths.
export const config = {
  matcher: ["/((?!api/).*)"],
};
