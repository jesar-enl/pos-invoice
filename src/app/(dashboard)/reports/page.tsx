import { resolvePeriod } from '@/features/reports/periods';
import {
  getSummary,
  getDaily,
  getTopProducts,
  getByCategory,
} from '@/features/reports/queries';
import { ReportsFilters } from '@/components/reports/ReportsFilters';
import { StatCard } from '@/components/dashboard/StatCard';
import { fmtMoney } from '@/lib/format';
import { Coins, Receipt, TrendingUp, Landmark } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { requirePermission } from '@/features/auth/guards';

export const dynamic = 'force-dynamic';

function fmtDay(day: string) {
  try {
    return format(parseISO(day), 'EEE, dd MMM yyyy');
  } catch {
    return day;
  }
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    preset?: string;
    from?: string;
    to?: string;
  }>;
}) {
  await requirePermission('reports.view');
  const sp = await searchParams;
  const period = resolvePeriod(sp.preset, sp.from, sp.to);

  const [summary, daily, products, categories] = await Promise.all([
    getSummary(period),
    getDaily(period),
    getTopProducts(period, 50),
    getByCategory(period),
  ]);

  const avgTicket =
    summary.receiptCount > 0
      ? summary.grossTotal / summary.receiptCount
      : 0;

  return (
    <div className="-m-6 flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500">{period.label}</p>
        </div>
      </div>

      <ReportsFilters />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Revenue (gross)"
            value={fmtMoney(summary.grossTotal, { withCents: false })}
            icon={Coins}
            tone="positive"
          />
          <StatCard
            label="Net sales"
            value={fmtMoney(summary.netTotal, { withCents: false })}
            icon={TrendingUp}
          />
          <StatCard
            label="VAT collected"
            value={fmtMoney(summary.vatTotal, { withCents: false })}
            icon={Landmark}
          />
          <StatCard
            label="Receipts"
            value={summary.receiptCount.toLocaleString()}
            sublabel={`Avg ticket: ${fmtMoney(avgTicket, {
              withCents: false,
            })}`}
            icon={Receipt}
          />
        </div>

        {/* Daily breakdown */}
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-800">
              Daily breakdown
            </h2>
          </div>
          {daily.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
              No sales in this period.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-2.5 text-left">Date</th>
                  <th className="px-5 py-2.5 text-right">Receipts</th>
                  <th className="px-5 py-2.5 text-right">Net</th>
                  <th className="px-5 py-2.5 text-right">VAT</th>
                  <th className="px-5 py-2.5 text-right">Gross</th>
                </tr>
              </thead>
              <tbody>
                {daily.map((d) => (
                  <tr
                    key={d.day}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-2.5 text-slate-700">
                      {fmtDay(d.day)}
                    </td>
                    <td className="px-5 py-2.5 text-right text-slate-600 tabular-nums">
                      {d.receiptCount}
                    </td>
                    <td className="px-5 py-2.5 text-right text-slate-600 tabular-nums">
                      {fmtMoney(d.netTotal, { withCents: false })}
                    </td>
                    <td className="px-5 py-2.5 text-right text-slate-600 tabular-nums">
                      {fmtMoney(d.vatTotal, { withCents: false })}
                    </td>
                    <td className="px-5 py-2.5 text-right font-medium text-slate-800 tabular-nums">
                      {fmtMoney(d.grossTotal, { withCents: false })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Products + Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">
                Products
              </h2>
            </div>
            {products.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                No product sales in this period.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-2.5 text-left">Product</th>
                    <th className="px-5 py-2.5 text-right">Qty</th>
                    <th className="px-5 py-2.5 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr
                      key={`${p.productId ?? 'free'}-${p.description}-${i}`}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-2.5 text-slate-700 truncate max-w-[200px]">
                        {p.description}
                      </td>
                      <td className="px-5 py-2.5 text-right text-slate-600 tabular-nums">
                        {p.quantity.toFixed(2)}
                      </td>
                      <td className="px-5 py-2.5 text-right font-medium text-slate-800 tabular-nums">
                        {fmtMoney(p.grossTotal, { withCents: false })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">
                Categories
              </h2>
            </div>
            {categories.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                No category data in this period.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-2.5 text-left">Category</th>
                    <th className="px-5 py-2.5 text-right">Qty</th>
                    <th className="px-5 py-2.5 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr
                      key={c.category}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-2.5 text-slate-700">
                        {c.category}
                      </td>
                      <td className="px-5 py-2.5 text-right text-slate-600 tabular-nums">
                        {c.quantity.toFixed(2)}
                      </td>
                      <td className="px-5 py-2.5 text-right font-medium text-slate-800 tabular-nums">
                        {fmtMoney(c.grossTotal, { withCents: false })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}