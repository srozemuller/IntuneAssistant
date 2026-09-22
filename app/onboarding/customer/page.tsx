'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerOnboardingPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/onboarding/register');
    }, [router]);

    return null;
}
