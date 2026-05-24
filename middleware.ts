import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/tokens';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return response;
  }

  const sessionCookie = request.cookies.get('portal_session')?.value;
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = await verifySessionToken(sessionCookie);
  if (!user) {
    const loginRedirect = NextResponse.redirect(new URL('/login', request.url));
    loginRedirect.cookies.delete('portal_session');
    return loginRedirect;
  }

  if (pathname.startsWith('/api/admin') && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Forward details safely down to api nodes via standard request headers
  const reqHeaders = new Headers(request.headers);
  reqHeaders.set('x-user-uid', user.uid);
  reqHeaders.set('x-user-email', user.email);
  reqHeaders.set('x-user-role', user.role);

  return NextResponse.next({
    request: {
      headers: reqHeaders,
    },
  });
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
};