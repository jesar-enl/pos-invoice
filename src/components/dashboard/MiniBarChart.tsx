import { fmtCompact, fmtMoney } from '@/lib/format';
import { format, parseISO } from 'date-fns';

export function MiniBarChart({
    data,
    days = 7,
}: {
    data: { day: string; grossTotal: number }[];
    days?: number;
}) {
    // Ensure exactly N days by zero-filling
    const byDay = new Map(data.map((d) => [d.day, d.grossTotal]));
    const today = new Date();
    const slots: { day: string; value: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = format(d, 'yyyy-MM-dd');
        slots.push({ day: key, value: byDay.get(key) ?? 0 });
    }

    const max = Math.max(1, ...slots.map((s) => s.value));

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">
                    Last {days} days
                </h3>
                <span className="text-xs text-slate-400">
                    Peak: {fmtMoney(max, { withCents: false })}
                </span>
            </div>

            <div className="flex items-end gap-2 h-40">
                {slots.map((s) => {
                    const heightPct = (s.value / max) * 100;
                    return (
                        <div
                            key={s.day}
                            className="flex-1 flex flex-col items-center gap-1 group"
                            title={`${format(parseISO(s.day), 'EEE d MMM')}: ${fmtMoney(
                                s.value,
                                { withCents: false }
                            )}`}
                        >
                            <div className="w-full flex-1 flex items-end">
                                <div
                                    className="w-full rounded-t bg-brand-navy-800 group-hover:bg-brand-navy-700 transition-colors"
                                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-slate-500 tabular-nums">
                                {fmtCompact(s.value)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                                {format(parseISO(s.day), 'EEE')}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}