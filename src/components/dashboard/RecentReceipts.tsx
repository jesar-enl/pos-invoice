import Link from 'next/link';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/receipts/StatusBadge';
import { fmtMoney } from '@/lib/format';
import type { ReceiptListItem } from '@/features/receipts/queries';

export function RecentReceipts({ rows }: { rows: ReceiptListItem[] }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800">
                    Recent receipts
                </h3>
                <Link
                    href="/receipts"
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                    View all
                </Link>
            </div>

            {rows.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-400">
                    No receipts yet.
                </div>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {rows.map((r) => (
                        <li key={r.id}>
                            <Link
                                href={`/receipts/${r.id}`}
                                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-800">
                                            {r.receipt_number}
                                        </span>
                                        <StatusBadge status={r.status} />
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">
                                        {r.customer_name || 'Walk-in'} ·{' '}
                                        {format(new Date(r.created_at), 'dd MMM, HH:mm')}
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-slate-800 tabular-nums ml-4">
                                    {fmtMoney(Number(r.total))}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}