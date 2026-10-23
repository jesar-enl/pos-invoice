'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { useDraftStore } from '@/features/receipts/store';
import type { ProductListItem } from '@/features/products/types';
import { Loader2, Search } from 'lucide-react';

export const ItemSearch = forwardRef<HTMLInputElement>(
    function ItemSearch(_props, ref) {
        const [query, setQuery] = useState('');
        const [results, setResults] = useState<ProductListItem[]>([]);
        const [highlight, setHighlight] = useState(0);
        const [loading, setLoading] = useState(false);
        const addLine = useDraftStore((s) => s.addLine);
        const abortRef = useRef<AbortController | null>(null);

        // Debounced search
        useEffect(() => {
            const q = query.trim();
            if (!q) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const handle = setTimeout(async () => {
                abortRef.current?.abort();
                const controller = new AbortController();
                abortRef.current = controller;

                try {
                    const res = await fetch(
                        `/api/products/search?q=${encodeURIComponent(q)}&limit=8`,
                        { signal: controller.signal }
                    );
                    if (!res.ok) throw new Error('Search failed');
                    const json = await res.json();
                    setResults(json.products ?? []);
                    setHighlight(0);
                } catch (err) {
                    if ((err as Error).name !== 'AbortError') {
                        setResults([]);
                    }
                } finally {
                    setLoading(false);
                }
            }, 200);

            return () => {
                clearTimeout(handle);
            };
        }, [query]);

        function focusSearch() {
            const el = (ref as React.RefObject<HTMLInputElement>)?.current;
            el?.focus();
        }

        function selectProduct(p: ProductListItem) {
            addLine({
                productId: p.id,
                description: p.name,
                quantity: 1,
                unit: p.unit,
                unitPrice: Number(p.unit_price),
                taxRate: Number(p.tax_rate),
            });
            setQuery('');
            setResults([]);
            setHighlight(0);
            focusSearch();
        }

        function selectFreeText(text: string) {
            addLine({
                productId: null,
                description: text,
                quantity: 1,
                unit: 'pcs',
                unitPrice: 0,
                taxRate: 0.18,
            });
            setQuery('');
            setResults([]);
            setHighlight(0);
            focusSearch();
        }

        function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlight((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[highlight]) {
                    selectProduct(results[highlight]);
                } else if (query.trim() && !loading) {
                    selectFreeText(query.trim());
                }
            } else if (e.key === 'Escape') {
                setQuery('');
                setResults([]);
                setHighlight(0);
            }
        }

        const showDropdown = query.trim().length > 0;

        return (
            <div className="relative px-4 py-3 bg-white border-b border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    {loading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
                    )}
                    <input
                        ref={ref}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Search product or scan barcode…"
                        className="w-full pl-10 pr-9 py-3 border border-slate-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-brand-navy-800 focus:border-transparent"
                        autoFocus
                        autoComplete="off"
                    />
                </div>

                {showDropdown && (
                    <ul className="absolute left-4 right-4 top-full mt-1 z-20 bg-white border border-slate-200 rounded-md shadow-lg max-h-72 overflow-auto">
                        {results.length === 0 && !loading ? (
                            <li className="px-3 py-2 text-sm text-slate-500">
                                No products match. Press Enter to add &ldquo;{query}&rdquo; as a
                                custom item.
                            </li>
                        ) : (
                            results.map((p, i) => (
                                <li
                                    key={p.id}
                                    onMouseEnter={() => setHighlight(i)}
                                    onClick={() => selectProduct(p)}
                                    className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm ${i === highlight ? 'bg-slate-100' : ''
                                        }`}
                                >
                                    <div>
                                        <div className="font-medium text-slate-800">{p.name}</div>
                                        {p.sku && (
                                            <div className="text-xs text-slate-400 font-mono">
                                                {p.sku}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-slate-500 tabular-nums">
                                        {Number(p.unit_price).toLocaleString()} / {p.unit}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>
        );
    }
);