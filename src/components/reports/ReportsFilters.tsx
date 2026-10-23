'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

const PRESETS = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: '7d', label: 'Last 7 days' },
    { key: 'week', label: 'This week' },
    { key: 'month', label: 'This month' },
    { key: 'last-month', label: 'Last month' },
    { key: 'year', label: 'This year' },
];

export function ReportsFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const [pending, startTransition] = useTransition();

    const preset = params.get('preset') ?? 'month';
    const from = params.get('from') ?? '';
    const to = params.get('to') ?? '';
    const isCustom = !!(from && to);

    function setParam(patch: Record<string, string | null>) {
        const next = new URLSearchParams(params.toString());
        for (const [k, v] of Object.entries(patch)) {
            if (v) next.set(k, v);
            else next.delete(k);
        }
        startTransition(() => router.replace(`${pathname}?${next.toString()}`));
    }

    function exportCsv() {
        const qs = params.toString();
        window.open(`/api/reports/export?${qs}`, '_blank');
    }

    return (
        <div className="border-b border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center gap-2">
            {/* Preset pills */}
            <div className="flex flex-wrap items-center gap-1">
                {PRESETS.map((p) => (
                    <button
                        key={p.key}
                        onClick={() => setParam({ preset: p.key, from: null, to: null })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!isCustom && preset === p.key
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Custom range */}
            <div className="flex items-center gap-2 ml-auto">
                <input
                    type="date"
                    value={from}
                    onChange={(e) =>
                        setParam({
                            from: e.target.value || null,
                            to: to || e.target.value || null,
                        })
                    }
                    className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                    aria-label="From"
                />
                <span className="text-xs text-slate-400">→</span>
                <input
                    type="date"
                    value={to}
                    onChange={(e) =>
                        setParam({
                            to: e.target.value || null,
                            from: from || e.target.value || null,
                        })
                    }
                    className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                    aria-label="To"
                />

                {isCustom && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setParam({ from: null, to: null })}
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Clear
                    </Button>
                )}

                <Button variant="outline" size="sm" onClick={exportCsv}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Export CSV
                </Button>
            </div>

            {pending && <span className="text-xs text-slate-400">Loading…</span>}
        </div>
    );
}