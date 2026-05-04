import { headers } from 'next/headers';

export async function getAssociation(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get('x-association') ?? process.env.DEFAULT_ASSOCIATION ?? 'shrm';
}
