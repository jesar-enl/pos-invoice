import { Receipt, TrendingUp, Coins, BarChart3 } from 'lucide-react';
import { listReceipts } from '@/features/receipts/queries';
import {
  getSummary,
  getDaily,
  getTopProducts,
} from '@/features/reports/queries';
import {
  todayPeriod,
  thisMonthPeriod,
  last7DaysPeriod,
} from '@/features/reports/periods';
import { StatCard } from '@/components/dashboard/StatCard';
import { MiniBarChart } from '@/components/dashboard/MiniBarChart';
import { RecentReceipts } from '@/components/dashboard/RecentReceipts';
import { TopProductsList } from '@/components/dashboard/TopProductsList';
import { fmtMoney } from '@/lib/format';
import { requirePermission } from '@/features/auth/guards';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requirePermission('dashboard.view');

  const today = todayPeriod();
  const last7 = last7DaysPeriod();
  const month = thisMonthPeriod();

  const [todaySummary, monthSummary, daily7, topProducts, recent] =
    await Promise.all([
      getSummary(today),
      getSummary(month),
      getDaily(last7),
      getTopProducts(month, 5),
      listReceipts({ page: 1, pageSize: 5 }),
    ]);

  const avgTicket =
    todaySummary.receiptCount > 0
      ? todaySummary.grossTotal / todaySummary.receiptCount
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Today&apos;s activity at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Today's revenue"
          value={`${fmtMoney(todaySummary.grossTotal, { withCents: false })}`}
          sublabel={`VAT: ${fmtMoney(todaySummary.vatTotal, {
            withCents: false,
          })}`}
          icon={Coins}
          tone="positive"
        />
        <StatCard
          label="Today's receipts"
          value={todaySummary.receiptCount.toLocaleString()}
          sublabel={`Avg ticket: ${fmtMoney(avgTicket, {
            withCents: false,
          })}`}
          icon={Receipt}
        />
        <StatCard
          label="This month"
          value={fmtMoney(monthSummary.grossTotal, { withCents: false })}
          sublabel={`${monthSummary.receiptCount} receipts`}
          icon={TrendingUp}
        />
        <StatCard
          label="Month VAT"
          value={fmtMoney(monthSummary.vatTotal, { withCents: false })}
          sublabel={`Net: ${fmtMoney(monthSummary.netTotal, {
            withCents: false,
          })}`}
          icon={BarChart3}
          tone="muted"
        />
      </div>

      {/* Chart + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MiniBarChart data={daily7} days={7} />
        </div>
        <TopProductsList rows={topProducts} />
      </div>

      {/* Recent */}
      <RecentReceipts rows={recent.rows} />
    </div>
  );
}