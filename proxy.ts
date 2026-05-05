import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/access-denied',
]);

function resolveAssociationFromRequest(request: NextRequest): string | null {
  const param = request.nextUrl.searchParams.get('assoc');
  if (param) return param;

  const hostname = (request.headers.get('host') ?? '').split(':')[0];
  const parts = hostname.split('.');
  // A real subdomain (not localhost, not www)
  if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
    return parts[0];
  }

  return null;
}

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  const authObj = await auth();
  const association =
    resolveAssociationFromRequest(request) ??
    authObj.orgSlug ??
    process.env.DEFAULT_ASSOCIATION ??
    'shrm';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-association', association);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
