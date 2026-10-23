'use client';

import { useDraftStore } from '@/features/receipts/store';
import type { DraftLine } from '@/features/receipts/types';
import { Trash2 } from 'lucide-react';
import { round2 } from '@/features/receipts/calculateTotals';

export function LineItemRow({
    line,
    index,
}: {
    line: DraftLine;
    index: number;
}) {
    const updateLine = useDraftStore((s) => s.updateLine);
    const removeLine = useDraftStore((s) => s.removeLine);

    const lineTotal = round2(line.quantity * line.unitPrice);

    return (
        <tr className="border-b border-slate-100 hover:bg-slate-50/50">
            <td className="px-3 py-2 text-xs text-slate-400 w-10">{index + 1}</td>

            <td className="px-3 py-2">
                <input
                    value={line.description}
                    onChange={(e) => updateLine(line.id, { description: e.target.value })}
                    className="w-full bg-transparent text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1 py-0.5"
                />
            </td>

            <td className="px-2 py-2 w-24">
                <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.quantity}
                    onChange={(e) =>
                        updateLine(line.id, { quantity: Number(e.target.value) || 0 })
                    }
                    className="w-full text-right bg-transparent text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1 py-0.5"
                />
            </td>

            <td className="px-2 py-2 w-16">
                <input
                    value={line.unit}
                    onChange={(e) => updateLine(line.id, { unit: e.target.value })}
                    className="w-full text-center bg-transparent text-xs text-slate-600 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1 py-0.5"
                />
            </td>

            <td className="px-2 py-2 w-32">
                <input
                    type="number"
                    min={0}
                    step="1"
                    value={line.unitPrice}
                    onChange={(e) =>
                        updateLine(line.id, { unitPrice: Number(e.target.value) || 0 })
                    }
                    className="w-full text-right bg-transparent text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1 py-0.5"
                />
            </td>

            <td className="px-3 py-2 w-32 text-right text-sm font-medium text-slate-800">
                {lineTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </td>

            <td className="px-2 py-2 w-10">
                <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    className="p-1 rounded text-slate-300 hover:text-red-600 hover:bg-red-50"
                    title="Remove item"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </td>
        </tr>
    );
}