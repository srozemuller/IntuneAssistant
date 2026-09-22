'use client';

import { AuditEventsProvider } from '@/contexts/AuditEventsContext';

// Scoped to this route segment (rather than the root ClientLayout) since Audit Events is the only
// feature that needs this context — keeps it out of the bundle/render path for every other page.
export default function AuditEventsLayout({ children }: { children: React.ReactNode }) {
    return <AuditEventsProvider>{children}</AuditEventsProvider>;
}
