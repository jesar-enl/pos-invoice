'use client';

import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

export function ActionBar({
    onPrintPaid,
    onPrintNew,
    onCancel,
    disabled,
}: {
    onPrintPaid: () => void;
    onPrintNew: () => void;
    onCancel: () => void;
    disabled?: boolean;
}) {
    return (
        <div className="border-t border-slate-200 bg-white px-6 py-3 flex items-center justify-between">
            <button
                type="button"
                onClick={onCancel}
                disabled={disabled}
                className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
                <X className="h-4 w-4" />
                Cancel <span className="text-xs text-slate-400 ml-1">(Esc)</span>
            </button>

            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={onPrintNew}
                    disabled={disabled}
                    className="h-11"
                >
                    <Printer className="h-4 w-4 mr-2" />
                    Print &amp; New
                    <span className="ml-3 text-xs text-slate-400">F4</span>
                </Button>

                <Button
                    onClick={onPrintPaid}
                    disabled={disabled}
                    className="h-11 px-6"
                >
                    <Printer className="h-4 w-4 mr-2" />
                    Print &amp; Paid
                    <span className="ml-3 text-xs text-slate-300">F2</span>
                </Button>
            </div>
        </div>
    );
}