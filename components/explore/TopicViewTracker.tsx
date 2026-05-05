'use client';

import { useEffect } from 'react';

const MUTATION = `
  mutation MarkTopicViewed(
    $product: String!, $topic: String!, $tgf: String!, $location: String!
  ) {
    markTopicViewed(
      productSlug: $product, topicName: $topic, tgfName: $tgf, location: $location
    )
  }
`;

export default function TopicViewTracker({
  product,
  topic,
  tgf,
  location,
  association,
  userId,
}: {
  product: string;
  topic: string;
  tgf: string;
  location: string;
  association: string;
  userId: string;
}) {
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001/graphql';

    fetch(`${apiUrl}?association=${association}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({
        query: MUTATION,
        variables: { product, topic, tgf, location },
      }),
    }).catch(() => {
      // Non-critical — silently ignore tracking failures
    });
  // Fire once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
