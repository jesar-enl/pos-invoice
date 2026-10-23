import { cn } from '@/lib/utils';

export function ActiveBadge({ active }: { active: boolean }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                active
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
            )}
        >
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}