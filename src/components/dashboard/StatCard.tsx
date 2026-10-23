import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
    label,
    value,
    sublabel,
    icon: Icon,
    tone = 'default',
}: {
    label: string;
    value: string;
    sublabel?: string;
    icon?: LucideIcon;
    tone?: 'default' | 'positive' | 'muted';
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                </span>
                {Icon && <Icon className="h-4 w-4 text-slate-400" />}
            </div>
            <div
                className={cn(
                    'text-2xl font-semibold tabular-nums',
                    tone === 'positive' && 'text-green-700',
                    tone === 'muted' && 'text-slate-500',
                    tone === 'default' && 'text-slate-900'
                )}
            >
                {value}
            </div>
            {sublabel && (
                <div className="text-xs text-slate-500 mt-1">{sublabel}</div>
            )}
        </div>
    );
}