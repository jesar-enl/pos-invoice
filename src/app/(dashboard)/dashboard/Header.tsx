'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { usePermissions } from '@/features/auth/context';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/users/RoleBadge';

export function Header() {
  const router = useRouter();
  const { email, role } = usePermissions();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <RoleBadge role={role} />
        <span className="text-sm text-slate-600">{email}</span>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </header>
  );
}