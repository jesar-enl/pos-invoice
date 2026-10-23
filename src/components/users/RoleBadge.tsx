import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
    owner: 'bg-purple-50 text-purple-700 border-purple-200',
    admin: 'bg-blue-50 text-blue-700 border-blue-200',
    staff: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    viewer: 'bg-slate-50 text-slate-500 border-slate-200',
};

export function RoleBadge({ role }: { role: string }) {
    const label = role.charAt(0).toUpperCase() + role.slice(1);
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                styles[role] ?? styles.staff
            )}
        >
            {label}
        </span>
    );
}