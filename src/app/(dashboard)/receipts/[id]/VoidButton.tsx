'use client';

import { useActionState, useState } from 'react';
import { voidReceipt, type VoidState } from '@/features/receipts/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ban, Loader2, X } from 'lucide-react';
import { requirePermission } from '@/features/auth/guards';
import { can } from '@/features/auth/permissions';

const initial: VoidState = {};
const session = await requirePermission('receipts.view');
const canVoid = can(session.role, 'receipts.void');


export function VoidButton({ receiptId }: { receiptId: string }) {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(
        voidReceipt,
        initial
    );

    // Close modal on success
    if (state.success && open) {
        // Schedule a close after render
        setTimeout(() => setOpen(false), 0);
    }

    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>
                <Ban className="h-4 w-4 mr-2" />
                Void
            </Button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Void this receipt?
                            </h3>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-700"
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 mb-4">
                            This will mark the receipt as voided. The record is kept for
                            audit purposes and cannot be undone from this screen.
                        </p>

                        <form action={formAction} className="space-y-4">
                            <input type="hidden" name="receiptId" value={receiptId} />

                            <div className="space-y-1.5">
                                <Label htmlFor="reason">Reason</Label>
                                <Input
                                    id="reason"
                                    name="reason"
                                    placeholder="e.g. Wrong item, customer cancelled"
                                    disabled={isPending}
                                    autoFocus
                                    required
                                />
                            </div>

                            {state.error && (
                                <div className="rounded-lg border border-brand-red-200 bg-brand-red-50 px-3 py-2 text-sm text-brand-red-700">
                                    {state.error}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Voiding…
                                        </>
                                    ) : (
                                        'Void Receipt'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
