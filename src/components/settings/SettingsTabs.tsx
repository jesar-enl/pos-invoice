'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
    { key: 'business', label: 'Business' },
    { key: 'financial', label: 'Financial' },
    { key: 'receipt', label: 'Receipt' },
    { key: 'team', label: 'Team' },
];

export function SettingsTabs() {
    const pathname = usePathname();
    const params = useSearchParams();
    const current = params.get('tab') ?? 'business';

    return (
        <div className="border-b border-slate-200 bg-white px-6">
            <nav className="flex gap-1 -mb-px">
                {TABS.map((t) => {
                    const active = current === t.key;
                    const next = new URLSearchParams(params.toString());
                    next.set('tab', t.key);
                    return (
                        <Link
                            key={t.key}
                            href={`${pathname}?${next.toString()}`}
                            className={cn(
                                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                                active
                                    ? 'border-slate-900 text-slate-900'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            )}
                        >
                            {t.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}