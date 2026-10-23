'use client';

import { useActionState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    createProduct,
    updateProduct,
    type ProductFormState,
} from '@/features/products/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const initial: ProductFormState = {};

export type ProductFormModalProps = {
    mode: 'create' | 'edit';
    product?: {
        id: string;
        name: string;
        sku: string | null;
        description: string | null;
        category: string | null;
        unit: string;
        unit_price: number;
        tax_rate: number;
        is_active: boolean;
    };
};

export function ProductFormModal({ mode, product }: ProductFormModalProps) {
    const router = useRouter();
    const pathname = usePathname();
    const action = mode === 'create' ? createProduct : updateProduct;
    const [state, formAction, isPending] = useActionState(action, initial);

    // Close on success
    useEffect(() => {
        if (state.success) {
            toast.success(mode === 'create' ? 'Product created' : 'Product updated');
            router.replace(pathname);
            router.refresh();
        }
    }, [state.success, mode, router, pathname]);

    function close() {
        router.replace(pathname);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {mode === 'create' ? 'New product' : 'Edit product'}
                    </h3>
                    <button
                        onClick={close}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    {mode === 'edit' && product && (
                        <input type="hidden" name="id" value={product.id} />
                    )}

                    {state.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {state.error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={product?.name ?? ''}
                            placeholder="e.g. Basco 4L Dove Grey"
                            disabled={isPending}
                            autoFocus
                            required
                        />
                        {state.fieldErrors?.name && (
                            <p className="text-xs text-red-600">{state.fieldErrors.name}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="sku">SKU / Barcode</Label>
                            <Input
                                id="sku"
                                name="sku"
                                defaultValue={product?.sku ?? ''}
                                placeholder="BSC-4L-DG"
                                disabled={isPending}
                            />
                            {state.fieldErrors?.sku && (
                                <p className="text-xs text-red-600">{state.fieldErrors.sku}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                name="category"
                                defaultValue={product?.category ?? ''}
                                placeholder="Paint"
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                                id="unit"
                                name="unit"
                                defaultValue={product?.unit ?? 'pcs'}
                                placeholder="TN, pcs, kg"
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="unit_price">Price (incl. VAT)</Label>
                            <Input
                                id="unit_price"
                                name="unit_price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={product?.unit_price ?? 0}
                                disabled={isPending}
                                required
                            />
                            {state.fieldErrors?.unit_price && (
                                <p className="text-xs text-red-600">
                                    {state.fieldErrors.unit_price}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="tax_rate">VAT rate</Label>
                            <select
                                id="tax_rate"
                                name="tax_rate"
                                defaultValue={String(product?.tax_rate ?? 0.18)}
                                disabled={isPending}
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                            >
                                <option value="0.18">18%</option>
                                <option value="0">0% (exempt)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={product?.description ?? ''}
                            rows={2}
                            disabled={isPending}
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            defaultChecked={product?.is_active ?? true}
                            disabled={isPending}
                            className="h-4 w-4 rounded border-slate-300"
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">
                            Active (shown in POS search)
                        </Label>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={close}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving…
                                </>
                            ) : mode === 'create' ? (
                                'Create product'
                            ) : (
                                'Save changes'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}