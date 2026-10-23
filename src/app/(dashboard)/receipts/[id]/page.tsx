import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getReceipt } from '@/features/receipts/queries';
import { StatusBadge } from '@/components/receipts/StatusBadge';
import { ReprintButton } from './ReprintButton';
import { VoidButton } from './VoidButton';
import { ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { requirePermission } from '@/features/auth/guards';
import { can } from '@/features/auth/permissions';

function fmtMoney(n: number) {
    return n.toLocaleString('en-UG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default async function ReceiptDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await requirePermission('receipts.view');
    const canVoid = can(session.role, 'receipts.void');
    const { id } = await params;
    const receipt = await getReceipt(id);
    if (!receipt) notFound();

    const { header, items } = receipt;
    const totalQty = items.reduce((s, it) => s + Number(it.quantity), 0);

    return (
        <div className="-m-6 flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white px-6 py-4">
                <Link
                    href="/receipts"
                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-3"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to receipts
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-semibold text-slate-800">
                                {header.receipt_number}
                            </h1>
                            <StatusBadge status={header.status} />
                        </div>
                        <p className="text-sm text-slate-500">
                            {format(new Date(header.created_at), 'dd MMM yyyy, HH:mm')}
                            {header.customer_name && (
                                <> · {header.customer_name}</>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <ReprintButton receiptId={header.id} />
                        {header.status === 'paid' && canVoid && <VoidButton receiptId={header.id} />}
                    </div>
                </div>

                {header.status === 'voided' && header.voided_reason && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        <span className="font-medium">Voided</span>
                        {header.voided_at && (
                            <>
                                {' '}
                                on {format(new Date(header.voided_at), 'dd MMM yyyy, HH:mm')}
                            </>
                        )}
                        {' — '}
                        {header.voided_reason}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex-1 p-6">
                <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                    {/* Items table */}
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                            <tr className="text-xs uppercase tracking-wide text-slate-500">
                                <th className="px-4 py-3 text-left w-10">#</th>
                                <th className="px-4 py-3 text-left">Description</th>
                                <th className="px-4 py-3 text-right w-24">Qty</th>
                                <th className="px-4 py-3 text-right w-32">Rate</th>
                                <th className="px-4 py-3 text-right w-32">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it, i) => (
                                <tr key={it.id} className="border-b border-slate-100">
                                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                                    <td className="px-4 py-3 text-slate-800">
                                        {it.description}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                                        {Number(it.quantity).toFixed(2)}{' '}
                                        {it.unit && (
                                            <span className="text-slate-400">{it.unit}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                                        {fmtMoney(Number(it.unit_price))}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-800 tabular-nums">
                                        {fmtMoney(Number(it.line_total))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end px-4 py-4 border-t border-slate-200">
                        <div className="w-full max-w-xs space-y-1.5 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="tabular-nums">
                                    {fmtMoney(Number(header.subtotal))}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>VAT (18%)</span>
                                <span className="tabular-nums">
                                    {fmtMoney(Number(header.tax_total))}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-2 mt-1 text-base font-semibold text-slate-900">
                                <span>TOTAL</span>
                                <span className="tabular-nums">
                                    {fmtMoney(Number(header.total))}{' '}
                                    <span className="text-xs text-slate-500 font-normal">
                                        {header.currency}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Amount in words */}
                    {header.amount_in_words && (
                        <div className="px-4 py-3 border-t border-dashed border-slate-200">
                            <p className="text-xs text-slate-500">
                                <span className="font-medium">Amount in words:</span>{' '}
                                {header.amount_in_words}
                            </p>
                        </div>
                    )}

                    {/* Meta footer */}
                    <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl text-xs text-slate-500 flex items-center justify-between">
                        <span>Total quantity: {totalQty.toFixed(2)}</span>
                        <span>{items.length} line items</span>
                    </div>
                </div>
            </div>
        </div>
    );
}