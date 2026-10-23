'use client';

import { useMemo, useRef, useState } from 'react';
import { CustomerRow } from '@/components/pos/CustomerRow';
import { ItemSearch } from '@/components/pos/ItemSearch';
import { LineItemsTable } from '@/components/pos/LineItemsTable';
import { TotalsBlock } from '@/components/pos/TotalsBlock';
import { ActionBar } from '@/components/pos/ActionBar';
import { useDraftStore } from '@/features/receipts/store';
import { useKeyboardShortcuts } from '@/features/receipts/useKeyboardShortcuts';
import { createReceipt } from '@/features/receipts/api';
import { toast } from 'sonner';

export function NewSaleClient() {
  const searchRef = useRef<HTMLInputElement>(null);
  const { draft, reset } = useDraftStore();
  const [busy, setBusy] = useState(false);

  async function commit(mode: 'paid' | 'new') {
    if (busy) return;
    if (draft.lines.length === 0) {
      toast.error('Add at least one item before printing');
      return;
    }

    // Open a placeholder tab SYNCHRONOUSLY so the browser
    // doesn't block it (this preserves the user-gesture context).
    const printWindow = window.open('', '_blank');

    setBusy(true);
    try {
      const receipt = await createReceipt(draft);

      // Navigate the placeholder to the real PDF
      if (printWindow) {
        printWindow.location.href = `/api/receipts/${receipt.id}/pdf`;
      } else {
        // Popup was blocked — give the user the link
        toast.message('Receipt saved', {
          description: receipt.receiptNumber,
          action: {
            label: 'Open PDF',
            onClick: () =>
              window.open(`/api/receipts/${receipt.id}/pdf`, '_blank'),
          },
        });
      }

      reset();
      searchRef.current?.focus();

      toast.success(`Saved ${receipt.receiptNumber}`, {
        description: `Total ${receipt.total.toLocaleString()} UGX`,
        action: {
          label: 'View',
          onClick: () => window.open(`/receipts/${receipt.id}`, '_blank'),
        },
      });

      // mode is here for future POS printer / auto-close behavior
      void mode;
    } catch (err) {
      if (printWindow) printWindow.close();
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      toast.error('Could not save receipt', { description: message });
    } finally {
      setBusy(false);
    }
  }

  function handlePrintPaid() {
    void commit('paid');
  }

  function handlePrintNew() {
    void commit('new');
  }

  function handleCancel() {
    if (busy) return;
    if (draft.lines.length === 0) return;
    if (!confirm('Discard this sale?')) return;
    reset();
    searchRef.current?.focus();
  }

  const shortcuts = useMemo(
    () => ({
      F2: handlePrintPaid,
      F4: handlePrintNew,
      Escape: handleCancel,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft, busy]
  );

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="-m-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Top strip */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-white text-xs">
        <span className="font-medium tracking-wide">
          NEW SALE {busy && <span className="text-slate-400">· saving…</span>}
        </span>
        <div className="flex items-center gap-4 text-slate-300">
          <span>
            Receipt #:{' '}
            <span className="text-white font-medium">PREVIEW</span>
          </span>
          <span>
            {new Date().toLocaleString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      <CustomerRow />
      <ItemSearch ref={searchRef} />
      <LineItemsTable />
      <TotalsBlock />
      <ActionBar
        onPrintPaid={handlePrintPaid}
        onPrintNew={handlePrintNew}
        onCancel={handleCancel}
        disabled={draft.lines.length === 0 || busy}
      />
    </div>
  );
}