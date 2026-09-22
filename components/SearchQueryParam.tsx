// components/SearchQueryParam.tsx
'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function Reader({ onQuery, param }: { onQuery: (value: string) => void; param: string }) {
    const searchParams = useSearchParams();
    const q = searchParams.get(param);
    useEffect(() => {
        if (q) onQuery(q);
    }, [q, onQuery]);
    return null;
}

/**
 * Reads `?q=` once and hands it to the page's search state. `useSearchParams` must sit under a Suspense boundary
 * or `next build` fails the page's static prerender, hence the wrapper.
 */
export function SearchQueryParam({ onQuery, param = 'q' }: { onQuery: (value: string) => void; param?: string }) {
    return (
        <Suspense fallback={null}>
            <Reader onQuery={onQuery} param={param} />
        </Suspense>
    );
}
