const API_URL = process.env.API_URL ?? 'http://localhost:8001/graphql';

export async function gql<T>(
  query: string,
  variables: Record<string, unknown>,
  association: string,
  userId?: string,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) headers['x-user-id'] = userId;

  const res = await fetch(`${API_URL}?association=${association}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}
