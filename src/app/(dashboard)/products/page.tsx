import Link from 'next/link';
import { listProducts, getProduct } from '@/features/products/queries';
import { ProductsFilters } from '@/components/products/ProductsFilters';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Package, Plus } from 'lucide-react';
import { requirePermission } from '@/features/auth/guards';
import { can } from '@/features/auth/permissions';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: 'active' | 'inactive';
    page?: string;
    new?: string;
    edit?: string;
  }>;
}) {
  await requirePermission('products.view');
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const { rows, total, pageCount, categories } = await listProducts({
    q: sp.q,
    category: sp.category,
    status: sp.status === 'active' || sp.status === 'inactive' ? sp.status : 'all',
    page,
    pageSize: 20,
  });

  const session = await requirePermission('products.view');
  const canManage = can(session.role, 'products.manage');

  // Handle modal route params
  const showNew = sp.new === '1';
  const editId = sp.edit;
  const editing = editId ? await getProduct(editId) : null;

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
          <h1 className="text-xl font-semibold text-slate-800">Products</h1>
          <p className="text-sm text-slate-500">
            {total} {total === 1 ? 'product' : 'products'}
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href={`/products?${qs({ new: '1' })}`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <ProductsFilters categories={categories} />

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Package className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm mb-3">No products match your filters.</p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/products?${qs({ new: '1', edit: undefined })}`}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add your first product
              </Link>
            </Button>
          </div>
        ) : (
          <ProductsTable rows={rows} />
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
                <Link href={`/products?${qs({ page: page - 1 })}`}>
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
                <Link href={`/products?${qs({ page: page + 1 })}`}>
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

      {/* Modals */}
      {showNew && <ProductFormModal mode="create" />}
      {editing && (
        <ProductFormModal
          mode="edit"
          product={{
            id: editing.id,
            name: editing.name,
            sku: editing.sku,
            description: editing.description,
            category: editing.category,
            unit: editing.unit,
            unit_price: Number(editing.unit_price),
            tax_rate: Number(editing.tax_rate),
            is_active: editing.is_active,
          }}
        />
      )}
    </div>
  );
}