import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Portal routes require auth
  if (pathname.startsWith('/portal') && !pathname.startsWith('/portal/login')) {
    const password = request.cookies.get('portal_password')?.value;

    if (password !== process.env.PORTAL_PASSWORD) {
      const loginUrl = new URL('/portal/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*'],
};
