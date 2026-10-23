'use client';

import { useActionState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    updateSettings,
    type SettingsState,
} from '@/features/settings/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LogoUploader } from './LogoUploader';
import { ReceiptNumberPreview } from './ReceiptNumberPreview';
import type { Tenant } from '@/lib/tenant';

const initial: SettingsState = {};

const CURRENCIES = ['UGX', 'USD', 'EUR', 'GBP', 'KES', 'TZS', 'RWF'];

export function SettingsForm({ tenant }: { tenant: Tenant }) {
    const params = useSearchParams();
    const tab = params.get('tab') ?? 'business';
    const [state, formAction, isPending] = useActionState(
        updateSettings,
        initial
    );

    useEffect(() => {
        if (state.success) toast.success('Settings saved');
    }, [state.success]);

    function err(field: string) {
        const msg = state.fieldErrors?.[field];
        return msg ? <p className="text-xs text-red-600 mt-1">{msg}</p> : null;
    }

    return (
        <form action={formAction} className="space-y-6">
            {state.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {state.error}
                </div>
            )}

            {/* All tabs stay mounted; only active one is visible. */}

            {/* ---------------- BUSINESS ---------------- */}
            <div className={tab === 'business' ? 'space-y-6' : 'hidden'}>
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-sm font-semibold text-slate-800 mb-4">
                        Business logo
                    </h2>
                    <LogoUploader currentUrl={tenant.logo_url} tenantId={tenant.id} />
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800">
                        Business details
                    </h2>

                    <div className="space-y-1.5">
                        <Label htmlFor="name">Business name *</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={tenant.name}
                            required
                            disabled={isPending}
                        />
                        {err('name')}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="address">Address</Label>
                        <textarea
                            id="address"
                            name="address"
                            defaultValue={tenant.address ?? ''}
                            rows={3}
                            disabled={isPending}
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        {err('address')}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={tenant.phone ?? ''}
                                disabled={isPending}
                            />
                            {err('phone')}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={tenant.email ?? ''}
                                disabled={isPending}
                            />
                            {err('email')}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="tin">TIN (Tax ID)</Label>
                            <Input
                                id="tin"
                                name="tin"
                                defaultValue={tenant.tin ?? ''}
                                disabled={isPending}
                            />
                            {err('tin')}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="vat_number">VAT number</Label>
                            <Input
                                id="vat_number"
                                name="vat_number"
                                defaultValue={tenant.vat_number ?? ''}
                                disabled={isPending}
                            />
                            {err('vat_number')}
                        </div>
                    </div>
                </section>
            </div>

            {/* ---------------- FINANCIAL ---------------- */}
            <div className={tab === 'financial' ? 'space-y-6' : 'hidden'}>
                <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800">
                        Currency & tax
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="currency">Currency</Label>
                            <select
                                id="currency"
                                name="currency"
                                defaultValue={tenant.currency}
                                disabled={isPending}
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            {err('currency')}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="vat_rate">VAT rate</Label>
                            <select
                                id="vat_rate"
                                name="vat_rate"
                                defaultValue={String(Number(tenant.vat_rate))}
                                disabled={isPending}
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            >
                                <option value="0.18">18% (standard)</option>
                                <option value="0">0% (exempt)</option>
                            </select>
                            {err('vat_rate')}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                            id="timezone"
                            name="timezone"
                            defaultValue={tenant.timezone ?? 'Africa/Kampala'}
                            disabled={isPending}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        >
                            <option value="Africa/Kampala">Africa/Kampala (UTC+3)</option>
                            <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                            <option value="UTC">UTC</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            Used for &quot;today&quot; boundaries in dashboard and reports.
                        </p>
                        {err('timezone')}
                    </div>
                </section>
            </div>

            {/* ---------------- RECEIPT ---------------- */}
            <div className={tab === 'receipt' ? 'space-y-6' : 'hidden'}>
                <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-800">
                            Receipt numbering
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Format how receipt numbers are generated. Past receipts keep
                            their original numbers.
                        </p>
                    </div>

                    <ReceiptNumberPreview
                        initialPrefix={tenant.receipt_prefix}
                        initialFormat={tenant.receipt_number_format}
                    />
                    {err('receipt_prefix')}
                    {err('receipt_number_format')}

                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                        <strong>Note:</strong> Changing format does not reset the
                        counter. Subsequent receipts use the new format; historical ones
                        keep theirs.
                    </div>
                </section>
            </div>

            {/* ---------------- TEAM ---------------- */}
            <div className={tab === 'team' ? 'space-y-6' : 'hidden'}>
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800">
                                Team members
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Manage users and permissions.
                            </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/users">Manage team →</Link>
                        </Button>
                    </div>
                </section>
            </div>

            {/* ---------------- SAVE BAR ---------------- */}
            {tab !== 'team' && (
                <div className="sticky bottom-0 -mx-6 px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            'Save changes'
                        )}
                    </Button>
                </div>
            )}
        </form>
    );
}