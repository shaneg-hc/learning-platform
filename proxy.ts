import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function resolveAssociation(request: NextRequest): string {
  // 1. Query param — dev convenience: ?assoc=ascm
  const param = request.nextUrl.searchParams.get('assoc');
  if (param) return param;

  // 2. Subdomain — production + local /etc/hosts: shrm.localhost:3000
  const hostname = (request.headers.get('host') ?? '').split(':')[0];
  const parts = hostname.split('.');
  if (parts.length >= 2 && parts[0] !== 'www') {
    return parts[0];
  }

  // 3. Env default
  return process.env.DEFAULT_ASSOCIATION ?? 'shrm';
}

export function proxy(request: NextRequest) {
  const association = resolveAssociation(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-association', association);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
