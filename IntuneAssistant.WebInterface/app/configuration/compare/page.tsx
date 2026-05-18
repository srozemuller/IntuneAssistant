'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfigurationCompareRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/compare/configuration');
    }, [router]);
    return null;
}
