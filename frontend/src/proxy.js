import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
export async function proxy(req) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  let isAdmin = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      console.log(payload)
      isAdmin = payload.role === "admin";
    } catch {
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
