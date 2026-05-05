'use client';

import { UserButton } from '@clerk/nextjs';

export default function UserMenu() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="My Products"
          labelIcon={<span>🏠</span>}
          href="/"
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
