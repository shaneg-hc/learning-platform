// Maps license keys (as stored in Clerk user private metadata) to product slugs used in URLs.
// Add new entries here as products are onboarded.
const LICENSE_KEY_TO_PRODUCT_SLUG: Record<string, string> = {
  shrmcps: 'shrmcps1',
  cpscp: 'cpscp1',
};

export function licenseKeyToSlug(key: string): string {
  return LICENSE_KEY_TO_PRODUCT_SLUG[key] ?? key;
}

// Metadata shape: { licenses: { "shrm": ["shrmcps", "cpscp"], "ascm": ["cpim"] } }
export function getProducts(
  privateMetadata: Record<string, unknown>,
  association: string,
): string[] {
  const licenses = (privateMetadata?.licenses ?? {}) as Record<string, string[]>;
  const keys = licenses[association] ?? [];
  return keys.map(licenseKeyToSlug);
}

export function hasProductAccess(
  privateMetadata: Record<string, unknown>,
  association: string,
  productSlug: string,
): boolean {
  return getProducts(privateMetadata, association).includes(productSlug);
}
