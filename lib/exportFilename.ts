import { format } from 'date-fns';

/**
 * Builds the download filename shared by every export/backup feature in the app.
 * Format: {tenantId}-{featureSlug}-{yyyyMMdd}-{HHmmss}.{extension}
 * The timestamp guarantees uniqueness across repeated same-day downloads.
 */
export function buildExportFilename(
    tenantId: string | null | undefined,
    featureSlug: string,
    extension: string
): string {
    const tenantSegment = tenantId || 'unknown-tenant';
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    return `${tenantSegment}-${featureSlug}-${timestamp}.${extension}`;
}
