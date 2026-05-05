'use client';

import { OrganizationSwitcher, useOrganizationList } from '@clerk/nextjs';

export default function OrgSwitcher() {
  const { userMemberships } = useOrganizationList({ userMemberships: true });

  if ((userMemberships.count ?? 0) <= 1) return null;

  return (
    <OrganizationSwitcher
      hidePersonal
      afterSelectOrganizationUrl="/"
      appearance={{
        elements: {
          rootBox: 'flex items-center',
          organizationSwitcherTrigger:
            'rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors',
        },
      }}
    />
  );
}
