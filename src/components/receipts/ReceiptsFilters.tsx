'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ReceiptsFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [q, setQ] = useState(params.get('q') ?? '');

    // Debounce the search box
    useEffect(() => {
        const handle = setTimeout(() => {
            const current = params.get('q') ?? '';
            if (q === current) return;
            const next = new URLSearchParams(params.toString());
            if (q) next.set('q', q);
            else next.delete('q');
            next.delete('page'); // reset pagination
            startTransition(() => {
                router.replace(`${pathname}?${next.toString()}`);
            });
        }, 300);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    function setParam(key: string, value: string | null) {
        const next = new URLSearchParams(params.toString());
        if (value) next.set(key, value);
        else next.delete(key);
        next.delete('page');
        startTransition(() => {
            router.replace(`${pathname}?${next.toString()}`);
        });
    }

    const status = params.get('status') ?? 'all';
    const from = params.get('from') ?? '';
    const to = params.get('to') ?? '';
    const hasFilters = q || status !== 'all' || from || to;

    return (
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by receipt number or customer…"
                    className="pl-9"
                />
            </div>

            {/* Status */}
            <select
                value={status}
                onChange={(e) => setParam('status', e.target.value === 'all' ? null : e.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="voided">Voided</option>
                <option value="refunded">Refunded</option>
            </select>

            {/* From date */}
            <input
                type="date"
                value={from}
                onChange={(e) => setParam('from', e.target.value || null)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                aria-label="From date"
            />

            {/* To date */}
            <input
                type="date"
                value={to}
                onChange={(e) => setParam('to', e.target.value || null)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                aria-label="To date"
            />

            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setQ('');
                        const next = new URLSearchParams();
                        startTransition(() => {
                            router.replace(`${pathname}?${next.toString()}`);
                        });
                    }}
                >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear
                </Button>
            )}

            {isPending && (
                <span className="text-xs text-slate-400">Loading…</span>
            )}
        </div>
    );
}