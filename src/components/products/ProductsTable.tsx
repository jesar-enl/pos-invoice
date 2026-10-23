import Link from 'next/link';
import type { ProductListItem } from '@/features/products/types';
import { ActiveBadge } from './ActiveBadge';
import { Pencil } from 'lucide-react';

function fmtMoney(n: number) {
    return n.toLocaleString('en-UG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function ProductsTable({ rows }: { rows: ProductListItem[] }) {
    return (
        <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left w-32">SKU</th>
                    <th className="px-4 py-3 text-left w-32">Category</th>
                    <th className="px-4 py-3 text-right w-32">Price (incl.)</th>
                    <th className="px-4 py-3 text-center w-16">Unit</th>
                    <th className="px-4 py-3 text-center w-24">Status</th>
                    <th className="w-16" />
                </tr>
            </thead>
            <tbody>
                {rows.map((p) => (
                    <tr
                        key={p.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                    >
                        <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                            {p.sku ?? <span className="italic text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                            {p.category ?? <span className="italic text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                            {fmtMoney(Number(p.unit_price))}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-500">{p.unit}</td>
                        <td className="px-4 py-3 text-center">
                            <ActiveBadge active={p.is_active} />
                        </td>
                        <td className="px-4 py-3 text-right">
                            <Link
                                href={`/products?edit=${p.id}`}
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
                                title="Edit"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                <span className="text-xs underline">Edit</span>
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}