import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get("token");

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

  if (
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/confirmemail") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  if (!tokenCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    return NextResponse.redirect(loginUrl);
  }

  let isAdmin = false;
  try {
    const payload = decodeJwt(tokenCookie.value);
    if (payload.role && typeof payload.role === "string") {
      const roles = payload.role.split(",").map((role) => role.trim());
      isAdmin = roles.some((role) => role.toLowerCase() === "admin");
    }
  } catch (error) {
    console.error("JWT decoding failed", error);
  }


  const response = NextResponse.next();

  // Refresh the token cookie (if needed)
  response.cookies.set("token", tokenCookie.value, {
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });

  // Set a non-httpOnly cookie for the role
  response.cookies.set("userRole", isAdmin ? "admin" : "user", {
    path: "/",
    maxAge: 60 * 60 * 24,
    // Do NOT mark as httpOnly so that client code can read it
  });

  if (
    (pathname.startsWith("/Admin") && !isAdmin)
  ) {
    const rootUrl = request.nextUrl.clone();
    rootUrl.pathname = "/";
    return NextResponse.redirect(rootUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api/).*)"],
};
