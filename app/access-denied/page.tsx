'use client';

import { useClerk } from '@clerk/nextjs';

export default function AccessDeniedPage() {
  const { signOut } = useClerk();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-3 text-sm text-gray-600">
          You don&apos;t have a license for this product. Please contact your
          administrator if you believe this is an error.
        </p>
        <div className="mt-6">
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
