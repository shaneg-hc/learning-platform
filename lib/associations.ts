import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

export async function getAssociation(): Promise<string> {
  const { orgSlug } = await auth();
  if (orgSlug) return orgSlug;
  const hdrs = await headers();
  return hdrs.get('x-association') ?? process.env.DEFAULT_ASSOCIATION ?? 'shrm';
}
