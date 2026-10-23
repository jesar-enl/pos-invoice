'use client';

import { useDraftStore } from '@/features/receipts/store';
import { LineItemRow } from './LineItemRow';

export function LineItemsTable() {
    const lines = useDraftStore((s) => s.draft.lines);

    return (
        <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                    <tr className="text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-2 text-left w-10">#</th>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-2 py-2 text-right w-24">Qty</th>
                        <th className="px-2 py-2 text-center w-16">Unit</th>
                        <th className="px-2 py-2 text-right w-32">Rate</th>
                        <th className="px-3 py-2 text-right w-32">Amount</th>
                        <th className="w-10" />
                    </tr>
                </thead>
                <tbody>
                    {lines.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-16 text-center text-sm text-slate-400">
                                No items yet. Search for a product above to add the first line.
                            </td>
                        </tr>
                    ) : (
                        lines.map((line, i) => (
                            <LineItemRow key={line.id} line={line} index={i} />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}