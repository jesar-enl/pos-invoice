'use client';

import { useState } from 'react';

export function ReceiptNumberPreview({
    initialPrefix,
    initialFormat,
}: {
    initialPrefix: string;
    initialFormat: string;
}) {
    const [prefix, setPrefix] = useState(initialPrefix);
    const [format, setFormat] = useState(initialFormat);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const fy1 = month >= 7 ? year % 100 : (year - 1) % 100;
    const fy2 = month >= 7 ? (year + 1) % 100 : year % 100;
    const seq = 1;

    const preview = format
        .replace(/\{prefix\}/g, prefix || 'SR')
        .replace(/\{seq4\}/g, String(seq).padStart(4, '0'))
        .replace(/\{seq\}/g, String(seq))
        .replace(/\{fy1\}/g, String(fy1))
        .replace(/\{fy2\}/g, String(fy2))
        .replace(/\{year\}/g, String(year));

    return (
        <div className="space-y-3">
            <input type="hidden" name="receipt_prefix" value={prefix} />
            <input type="hidden" name="receipt_number_format" value={format} />

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs text-slate-500 mb-1">Live preview</div>
                <div className="font-mono text-base text-slate-900">{preview}</div>
                <div className="text-xs text-slate-400 mt-1">
                    Next receipt will use this format.
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                    <span className="text-xs text-slate-500">Prefix</span>
                    <input
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-navy-800"
                        maxLength={16}
                    />
                </label>
                <label className="space-y-1">
                    <span className="text-xs text-slate-500">Format</span>
                    <input
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-navy-800"
                        maxLength={64}
                    />
                </label>
            </div>

            <div className="text-xs text-slate-400">
                Tokens: <code>{'{prefix}'}</code> <code>{'{seq}'}</code>{' '}
                <code>{'{seq4}'}</code> <code>{'{fy1}'}</code> <code>{'{fy2}'}</code>{' '}
                <code>{'{year}'}</code>
            </div>
        </div>
    );
}