import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Allow login page access without infinite loop
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Get token cookie from request
  const tokenCookie = req.cookies.get("token");
  const token = tokenCookie?.value;

  console.log("--- PROXY DEBUG ---");
  console.log("Cookie found:", !!token);

  let isAdmin = false;

  if (token) {
    try {
      // Ensure secret exists
      const secretStr = process.env.JWT_SECRET;
      if (!secretStr) {
        throw new Error(
          "JWT_SECRET is not defined in Next.js environment variables!",
        );
      }

      const secretKey = new TextEncoder().encode(secretStr);

      // Verify JWT with jose using HS256 algorithm used by jsonwebtoken
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });

      console.log("Decoded Payload:", payload);
      isAdmin = payload?.role === "admin";
      console.log("Is Admin Check:", isAdmin);
    } catch (err) {
      console.error("JWT Verification Failed:", err.message);
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
