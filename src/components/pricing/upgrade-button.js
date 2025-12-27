'use client';

import { Button } from '@/components/ui/button';
import { handleSubscription } from '@/lib/payment-utils';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function UpgradeButton({ children, className }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        await handleSubscription(router);
        setLoading(false);
    };

    return (
        <Button
            onClick={handleClick}
            disabled={loading}
            className={className}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
        </Button>
    );
}
