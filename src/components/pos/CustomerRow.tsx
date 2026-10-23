'use client';

import { useDraftStore } from '@/features/receipts/store';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export function CustomerRow() {
    const { draft, setCustomer, clearCustomer } = useDraftStore();

    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
            <label className="text-xs font-medium text-slate-500 w-24 shrink-0">
                Customer
            </label>
            <input
                type="text"
                value={draft.customerName}
                onChange={(e) => setCustomer(e.target.value, null)}
                placeholder="Walk-in customer (optional)"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearCustomer}
                title="Clear customer (walk-in)"
            >
                <Zap className="h-4 w-4 mr-1" />
                Walk-in
            </Button>
        </div>
    );
}