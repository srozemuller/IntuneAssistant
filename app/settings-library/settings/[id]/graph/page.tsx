'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApiRequest } from '@/hooks/useApiRequest';
import { SETTINGS_LIBRARY_SETTING_BY_DEFINITION_ENDPOINT, SETTINGS_LIBRARY_SETTING_DETAIL_ENDPOINT } from '@/lib/constants';
import { isGuid, settingHref } from '@/lib/settingsLibraryGraph';
import { ArrowLeft, Loader2, Share2 } from 'lucide-react';

// three.js / WebGL — client only.
const DependencyWeb = dynamic(() => import('@/components/settings-library/DependencyWeb'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[560px] text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading the 3D web…
        </div>
    ),
});

interface ApiEnvelope<T> { status: string; message?: string | null; data: T }
interface SettingHead { id: string; graphDefinitionId: string; canonicalName: string | null; currentRevision: { displayName: string | null } | null }

export default function SettingDependencyWebPage() {
    const params = useParams<{ id: string }>();
    const { request } = useApiRequest();
    const [head, setHead] = useState<SettingHead | null>(null);
    const [loading, setLoading] = useState(true);
    // useApiRequest aborts the previous request when a new one starts; Strict Mode double-fires
    // this effect in dev, so a superseded run must not write "not found" over the live one.
    const runRef = useRef(0);

    // The route accepts a catalog GUID or a Graph definition id (what dependencies are expressed in).
    useEffect(() => {
        const run = ++runRef.current;
        (async () => {
            setLoading(true);
            try {
                const routeId = decodeURIComponent(params.id);
                const url = isGuid(routeId)
                    ? SETTINGS_LIBRARY_SETTING_DETAIL_ENDPOINT(routeId)
                    : SETTINGS_LIBRARY_SETTING_BY_DEFINITION_ENDPOINT(routeId);
                const response = await request<ApiEnvelope<SettingHead>>(url);
                if (run !== runRef.current) return;
                setHead(response?.data?.data ?? null);
            } finally {
                if (run === runRef.current) setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    if (loading) {
        return <div className="p-6 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading setting…</div>;
    }
    if (!head) {
        return (
            <div className="p-6 space-y-4">
                <Link href="/settings-library" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Back to Settings Library</Link>
                <div className="text-sm text-muted-foreground">Setting not found.</div>
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col gap-4 h-[calc(100vh-2rem)] min-h-[640px]">
            <div className="flex items-start justify-between gap-4 flex-wrap shrink-0">
                <div>
                    <Link href={settingHref(head.id)} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-1">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to the setting
                    </Link>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <Share2 className="h-6 w-6" /> {head.currentRevision?.displayName ?? head.canonicalName ?? head.graphDefinitionId}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Every setting this one depends on, contains, or is part of — and theirs. Click a node to inspect it, right-click (or “Expand connections”) to pull in its neighbourhood, drag to rotate, scroll to zoom, or switch to Walk mode and fly through it.
                    </p>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <DependencyWeb seedSettingId={head.id} />
            </div>
        </div>
    );
}
