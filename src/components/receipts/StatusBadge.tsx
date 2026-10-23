import { cn } from '@/lib/utils';

export function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        paid: 'bg-green-50 text-green-700 border-green-200',
        voided: 'bg-brand-red-50 text-brand-red-700 border-brand-red-200',
        refunded: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    const label = status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                styles[status] ?? 'bg-slate-50 text-slate-700 border-slate-200'
            )}
        >
            {label}
        </span>
    );
}