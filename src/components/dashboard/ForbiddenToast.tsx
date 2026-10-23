'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

export function ForbiddenToast() {
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (params.get('error') === 'forbidden') {
            toast.error('You do not have access to that page');
            const next = new URLSearchParams(params.toString());
            next.delete('error');
            router.replace(`${pathname}?${next.toString()}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}