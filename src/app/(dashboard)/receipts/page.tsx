import Link from 'next/link';
import { listReceipts, type ReceiptStatus } from '@/features/receipts/queries';
import { ReceiptsFilters } from '@/components/receipts/ReceiptsFilters';
import { StatusBadge } from '@/components/receipts/StatusBadge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ReceiptText } from 'lucide-react';
import { format } from 'date-fns';
import { requirePermission } from '@/features/auth/guards';
import { can } from '@/features/auth/permissions';

function fmtMoney(n: number) {
  return n.toLocaleString('en-UG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: ReceiptStatus;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const session = await requirePermission('receipts.view');
  const canCreate = can(session.role, 'receipts.create');
  
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const { rows, total, pageCount } = await listReceipts({
    q: sp.q,
    status: sp.status,
    from: sp.from,
    to: sp.to,
    page,
    pageSize: 20,
  });

  const qs = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();
    const merged = { ...sp, ...patch };
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== null && v !== '') next.set(k, String(v));
    }
    return next.toString();
  };

  return (
    <div className="-m-6 flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Receipts</h1>
          <p className="text-sm text-slate-500">
            {total} {total === 1 ? 'receipt' : 'receipts'}
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/new-sale">New Sale</Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <ReceiptsFilters />

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <ReceiptText className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">No receipts match your filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-left w-40">Receipt #</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left w-40">Date</th>
                <th className="px-4 py-3 text-right w-32">Total</th>
                <th className="px-4 py-3 text-left w-24">Status</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {r.receipt_number}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.customer_name || (
                      <span className="italic text-slate-400">Walk-in</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {format(new Date(r.created_at), 'dd MMM yyyy, HH:mm')}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800 tabular-nums">
                    {fmtMoney(r.total)}{' '}
                    <span className="text-xs text-slate-400 font-normal">
                      {r.currency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/receipts/${r.id}`}
                      className="text-sm text-slate-600 hover:text-slate-900 underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="border-t border-slate-200 bg-white px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Page {page} of {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/receipts?${qs({ page: page - 1 })}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              asChild={page < pageCount}
            >
              {page < pageCount ? (
                <Link href={`/receipts?${qs({ page: page + 1 })}`}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}