import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Always allow the admin login page itself
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  let isAdmin = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      console.log(payload);
      
      isAdmin = payload.role === 'admin';
    } catch {
      isAdmin = false;
    }
  }

  if (!isAdmin) {
    return NextResponse.rewrite(new URL('/admin-not-found', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*','/admin-login'],
};