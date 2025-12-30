'use client';

import { ThemeToggle } from './theme-toggle';
import { LocaleSwitcher } from './locale-switcher';
import { UserMenu } from './user-menu';
import type { User } from '@supabase/supabase-js';

interface HeaderActionsProps {
  user: User | null;
  profile: { role: string; email: string } | null;
}

export function HeaderActions({ user, profile }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <LocaleSwitcher />
      <ThemeToggle />
      <UserMenu user={user} profile={profile} />
    </div>
  );
}
