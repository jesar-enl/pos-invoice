'use client';

import { useState, useTransition } from 'react';
import {
    changeRole,
    toggleSuspend,
    resendInvite,
    removeMember,
} from '@/features/users/actions';
import {
    MoreHorizontal,
    Shield,
    ShieldOff,
    RefreshCw,
    Trash2,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { MemberRow, MemberRole } from '@/features/users/types';

const ROLES: MemberRole[] = ['owner', 'admin', 'staff', 'viewer'];

export function MemberRowActions({
    member,
    callerRole,
    callerId,
}: {
    member: MemberRow;
    callerRole: MemberRole;
    callerId: string;
}) {
    const [open, setOpen] = useState(false);
    const [roleOpen, setRoleOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const isSelf = member.userId === callerId;

    function run(
        action: () => Promise<{ error?: string; message?: string }>,
        successMsg?: string
    ) {
        startTransition(async () => {
            const res = await action();
            if (res.error) toast.error(res.error);
            else toast.success(res.message ?? successMsg ?? 'Done');
            setOpen(false);
            setRoleOpen(false);
            router.refresh();
        });
    }

    function handleRoleChange(role: MemberRole) {
        const fd = new FormData();
        fd.set('userId', member.userId);
        fd.set('role', role);
        run(() => changeRole({}, fd), 'Role updated');
    }

    function handleSuspend() {
        const fd = new FormData();
        fd.set('userId', member.userId);
        fd.set('nextStatus', member.status === 'active' ? 'suspended' : 'active');
        run(
            () => toggleSuspend({}, fd),
            member.status === 'active' ? 'User suspended' : 'User reactivated'
        );
    }

    function handleResend() {
        const fd = new FormData();
        fd.set('email', member.email);
        run(() => resendInvite({}, fd), 'Invitation resent');
    }

    function handleRemove() {
        if (!confirm(`Remove ${member.email} from your team?`)) return;
        const fd = new FormData();
        fd.set('userId', member.userId);
        run(() => removeMember({}, fd), 'Member removed');
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                disabled={pending}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                aria-label="Actions"
            >
                {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <MoreHorizontal className="h-4 w-4" />
                )}
            </button>

            {open && !roleOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                        <button
                            onClick={() => setRoleOpen(true)}
                            disabled={isSelf}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                            <Shield className="h-3.5 w-3.5" />
                            Change role
                        </button>

                        {member.isPending && (
                            <button
                                onClick={handleResend}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Resend invitation
                            </button>
                        )}

                        <button
                            onClick={handleSuspend}
                            disabled={isSelf}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                            <ShieldOff className="h-3.5 w-3.5" />
                            {member.status === 'active' ? 'Suspend access' : 'Reactivate'}
                        </button>

                        <div className="my-1 border-t border-slate-100" />

                        <button
                            onClick={handleRemove}
                            disabled={isSelf}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-red-600 hover:bg-brand-red-50 disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove from team
                        </button>
                    </div>
                </>
            )}

            {roleOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                            setRoleOpen(false);
                            setOpen(false);
                        }}
                    />
                    <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                        <div className="px-3 py-1.5 text-xs uppercase tracking-wide text-slate-400">
                            Set role
                        </div>
                        {ROLES.map((r) => {
                            const disabled = r === 'owner' && callerRole !== 'owner';
                            return (
                                <button
                                    key={r}
                                    disabled={disabled || r === member.role}
                                    onClick={() => handleRoleChange(r)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                    <span className="capitalize">{r}</span>
                                    {r === member.role && (
                                        <span className="text-xs text-slate-400">current</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}