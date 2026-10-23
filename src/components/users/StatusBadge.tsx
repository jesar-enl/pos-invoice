import { cn } from '@/lib/utils';

export function StatusBadge({
    status,
    isPending,
}: {
    status: string;
    isPending: boolean;
}) {
    if (isPending) {
        return (
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
                Pending
            </span>
        );
    }

    const active = status === 'active';
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                active
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-brand-red-50 text-brand-red-700 border-brand-red-200'
            )}
        >
            {active ? 'Active' : 'Suspended'}
        </span>
    );
}