'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function ReprintButton({ receiptId }: { receiptId: string }) {
    function handleReprint() {
        window.open(`/api/receipts/${receiptId}/pdf`, '_blank');
    }

    return (
        <Button variant="outline" onClick={handleReprint}>
            <Printer className="h-4 w-4 mr-2" />
            Reprint
        </Button>
    );
}