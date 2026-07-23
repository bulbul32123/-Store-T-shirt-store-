import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  let isAdmin = false;

  if (token) {
    try {
      // Encode secret properly
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"], // Default algorithm used by jsonwebtoken
      });

      console.log("Verified Payload:", payload);
      isAdmin = payload.role === "admin";
    } catch (err) {
      console.error("JWT Verification Error:", err.message);
      isAdmin = false;
    }
  }

  if (!isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin-login"],
};
