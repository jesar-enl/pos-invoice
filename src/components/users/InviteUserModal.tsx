'use client';

import { useActionState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    inviteUser,
    type UsersActionState,
} from '@/features/users/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const initial: UsersActionState = {};

export function InviteUserModal() {
    const router = useRouter();
    const pathname = usePathname();
    const [state, formAction, isPending] = useActionState(inviteUser, initial);

    useEffect(() => {
        if (state.success) {
            toast.success(state.message ?? 'Invitation sent');
            router.replace(pathname);
            router.refresh();
        }
    }, [state.success, state.message, router, pathname]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                            Invite team member
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            They&apos;ll receive an email with a link to set their password.
                        </p>
                    </div>
                    <button
                        onClick={() => router.replace(pathname)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    {state.error && (
                        <div className="rounded-lg border border-brand-red-200 bg-brand-red-50 px-3 py-2 text-sm text-brand-red-700">
                            {state.error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            disabled={isPending}
                            autoFocus
                            required
                        />
                        {state.fieldErrors?.email && (
                            <p className="text-xs text-brand-red-600">
                                {state.fieldErrors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="full_name">Full name</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            placeholder="Jane Doe"
                            disabled={isPending}
                        />
                        {state.fieldErrors?.full_name && (
                            <p className="text-xs text-brand-red-600">
                                {state.fieldErrors.full_name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            name="role"
                            defaultValue="staff"
                            disabled={isPending}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy-800"
                        >
                            <option value="admin">Admin — manage everything except billing</option>
                            <option value="staff">Staff — create sales and receipts</option>
                            <option value="viewer">Viewer — read-only access</option>
                        </select>
                        <p className="text-xs text-slate-500">
                            Owner role is reserved for the business owner.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.replace(pathname)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending…
                                </>
                            ) : (
                                'Send invitation'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}