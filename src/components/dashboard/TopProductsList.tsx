import { fmtMoney } from '@/lib/format';
import type { ProductRow } from '@/features/reports/types';

export function TopProductsList({ rows }: { rows: ProductRow[] }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800">
                    Top products this month
                </h3>
            </div>
            {rows.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-400">
                    No sales yet this month.
                </div>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {rows.map((r, i) => (
                        <li
                            key={`${r.productId ?? 'free'}-${r.description}`}
                            className="flex items-center gap-3 px-5 py-3"
                        >
                            <span className="text-xs font-medium text-slate-400 w-5 tabular-nums">
                                {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-slate-800 truncate">
                                    {r.description}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {r.quantity.toFixed(2)} sold · {r.receiptCount}{' '}
                                    {r.receiptCount === 1 ? 'sale' : 'sales'}
                                </div>
                            </div>
                            <div className="text-sm font-medium text-slate-800 tabular-nums">
                                {fmtMoney(r.grossTotal, { withCents: false })}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}