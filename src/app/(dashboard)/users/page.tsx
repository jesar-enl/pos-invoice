import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { listMembers, getCurrentUserRole } from '@/features/users/queries';
import { RoleBadge } from '@/components/users/RoleBadge';
import { StatusBadge } from '@/components/users/StatusBadge';
import { MemberRowActions } from '@/components/users/MemberRowActions';
import { InviteUserModal } from '@/components/users/InviteUserModal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, UserPlus, Users as UsersIcon } from 'lucide-react';
import { requirePermission } from '@/features/auth/guards';

export const dynamic = 'force-dynamic';
const session = await requirePermission('users.manage');

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; page?: string }>;
}) {
  
  const sp = await searchParams;

  const callerRole = await getCurrentUserRole();
  await requirePermission('users.manage');

  const canManage = callerRole === 'owner' || callerRole === 'admin';

  if (!canManage) {
    return (
      <div className="-m-6 p-6">
        <div className="max-w-xl mx-auto mt-12 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <UsersIcon className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-slate-800">
            Team management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You don&apos;t have permission to manage users.
          </p>
        </div>
      </div>
    );
  }

  const members = await listMembers();
  const showInvite = sp.invite === '1';

  // Caller's own user id (to hide self-actions)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const callerId = user?.id ?? '';

  return (
    <div className="-m-6 flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Team</h1>
          <p className="text-sm text-slate-500">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        <Button asChild>
          <Link href="/users?invite=1">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite user
          </Link>
        </Button>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 overflow-hidden">
          {members.length === 0 ? (
            <div className="py-16 text-center">
              <UsersIcon className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No team members yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left w-32">Role</th>
                  <th className="px-5 py-3 text-left w-32">Status</th>
                  <th className="px-5 py-3 text-left w-40">Joined</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.membershipId} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-800">
                        {m.fullName || (
                          <span className="italic text-slate-400">
                            Unnamed
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{m.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <RoleBadge role={m.role} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={m.status}
                        isPending={m.isPending}
                      />
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {m.acceptedAt
                        ? format(new Date(m.acceptedAt), 'dd MMM yyyy')
                        : m.invitedAt
                          ? `Invited ${format(new Date(m.invitedAt), 'dd MMM yyyy')}`
                          : '—'}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <MemberRowActions
                        member={m}
                        callerRole={callerRole}
                        callerId={callerId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Role guide */}
        <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { role: 'Owner', desc: 'Full access including billing and team.' },
            { role: 'Admin', desc: 'Manages everything except billing.' },
            { role: 'Staff', desc: 'Creates sales, receipts, and manages clients.' },
            { role: 'Viewer', desc: 'Read-only. Good for accountants.' },
          ].map((r) => (
            <div
              key={r.role}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="mb-1">
                <RoleBadge role={r.role.toLowerCase()} />
              </div>
              <p className="text-xs text-slate-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {showInvite && <InviteUserModal />}
    </div>
  );
}