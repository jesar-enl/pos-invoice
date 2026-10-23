'use client';

import { useDraftStore } from '@/features/receipts/store';
import { calculateTotals } from '@/features/receipts/calculateTotals';
import { amountInWords } from '@/pdf/numberToWords';
import { useMemo } from 'react';

function fmt(n: number) {
    return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function TotalsBlock() {
    const lines = useDraftStore((s) => s.draft.lines);
    const totals = useMemo(() => calculateTotals(lines), [lines]);
    const words = useMemo(() => amountInWords(totals.gross), [totals.gross]);

    return (
        <div className="border-t border-slate-200 bg-white px-6 py-4">
            <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>{fmt(totals.net)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>VAT (18%)</span>
                        <span>{fmt(totals.vat)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 mt-1 text-base font-semibold text-slate-900">
                        <span>TOTAL</span>
                        <span>
                            {fmt(totals.gross)} <span className="text-xs text-slate-500 font-normal">UGX</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-3 border-t border-dashed border-slate-200 pt-3">
                <p className="text-xs text-slate-500">
                    <span className="font-medium">Amount in words:</span>{' '}
                    {totals.gross > 0 ? words : '—'}
                </p>
            </div>
        </div>
    );
}