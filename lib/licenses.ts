export type License = {
  association: string;
  products: string[];
};

// Maps license keys (as stored in Clerk metadata) to product slugs used in URLs.
// Add new entries here as products are onboarded.
const LICENSE_KEY_TO_PRODUCT_SLUG: Record<string, string> = {
  shrmcps: 'shrmcps1',
  cpscp: 'cpscp1',
};

export function licenseKeyToSlug(key: string): string {
  return LICENSE_KEY_TO_PRODUCT_SLUG[key] ?? key;
}

export function getProductsForAssociation(
  licenses: License[],
  association: string,
): string[] {
  const entry = licenses.find((l) => l.association === association);
  if (!entry) return [];
  return entry.products.map(licenseKeyToSlug);
}

export function hasProductAccess(
  licenses: License[],
  association: string,
  productSlug: string,
): boolean {
  return getProductsForAssociation(licenses, association).includes(productSlug);
}
