//proxy.js
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }
  const tokenCookie = req.cookies.get("token");
  const token = tokenCookie?.value;

  let isAdmin = false;

  if (token) {
    try {
      const secretStr = process.env.JWT_SECRET;
      if (!secretStr) {
        throw new Error(
          "JWT_SECRET is not defined in Next.js environment variables!",
        );
      }

      const secretKey = new TextEncoder().encode(secretStr);
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });

      console.log("MW payload:", payload);
      isAdmin = payload?.role === "admin";
    } catch (err) {
      console.error("JWT Verification Failed:", err.message);
      console.log("MW token present:", !!token);
      isAdmin = false;
    }
  } else {
    console.log("No 'token' cookie attached to request.");
  }

  if (!isAdmin) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin-login"],
};
