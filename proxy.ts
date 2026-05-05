import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/access-denied',
]);

function resolveAssociation(request: NextRequest): string {
  const param = request.nextUrl.searchParams.get('assoc');
  if (param) return param;

  const hostname = (request.headers.get('host') ?? '').split(':')[0];
  const parts = hostname.split('.');
  if (parts.length >= 2 && parts[0] !== 'www') {
    return parts[0];
  }

  return process.env.DEFAULT_ASSOCIATION ?? 'shrm';
}

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  const association = resolveAssociation(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-association', association);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
