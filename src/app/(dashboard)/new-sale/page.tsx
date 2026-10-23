import { requirePermission } from '@/features/auth/guards';
import { NewSaleClient } from '@/components/pos/NewSaleClient';

export const dynamic = 'force-dynamic';

export default async function NewSalePage() {
    await requirePermission('receipts.create');
    return <NewSaleClient />;
}