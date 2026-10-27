// Types and pure helpers for the deprecation radar (GET v1/analyzer/deprecations*).

export interface DeprecationConsumer {
    kind: 'policy' | 'app' | 'conditionalAccessPolicy';
    id: string;
    name: string;
    resourceType?: string | null;
    platform?: string | null;
    role: 'assigned' | 'excluded' | 'included' | 'usesFilter';
    via: 'direct' | 'nested';
    viaGroupId?: string | null;
    viaGroupName?: string | null;
    targetName?: string | null;
}

export interface DeprecationFinding {
    ruleId: string;
    ruleTitle: string;
    deadline?: string | null;
    daysRemaining?: number | null;
    objectType: 'group' | 'filter';
    objectId: string;
    objectName: string;
    evidence?: string | null;
    referencedGroupIds: string[];
    replacement?: string | null;
    infoUrl?: string | null;
    consumers: DeprecationConsumer[];
}

export interface DeprecationWarning { code: string; message: string }

export interface DeprecationFindings {
    findings: DeprecationFinding[];
    warnings: DeprecationWarning[];
    generatedAt: string;
}

export interface DeprecatedGroup {
    groupId: string;
    groupName: string;
    ruleId: string;
    title: string;
    deadline?: string | null;
    daysRemaining?: number | null;
    message: string;
    infoUrl?: string | null;
}

export interface DeprecatedGroups { groups: DeprecatedGroup[]; warnings: DeprecationWarning[] }

export const CONSUMER_KIND_LABEL: Record<DeprecationConsumer['kind'], string> = {
    policy: 'Policy',
    app: 'App',
    conditionalAccessPolicy: 'Conditional Access',
};

export const CONSUMER_ROLE_LABEL: Record<DeprecationConsumer['role'], string> = {
    assigned: 'Assigned',
    excluded: 'Excluded',
    included: 'Included',
    usesFilter: 'Uses filter',
};

export const OBJECT_TYPE_LABEL: Record<DeprecationFinding['objectType'], string> = {
    group: 'Dynamic group',
    filter: 'Assignment filter',
};

/** "in 7 days", "tomorrow", "today", "3 days ago". */
export function describeDays(daysRemaining: number): string {
    if (daysRemaining === 0) return 'today';
    if (daysRemaining === 1) return 'tomorrow';
    if (daysRemaining === -1) return 'yesterday';
    return daysRemaining > 0 ? `in ${daysRemaining} days` : `${-daysRemaining} days ago`;
}

/** How the consumer was reached: "Direct" or "Via <parent group>". */
export function describeReach(consumer: DeprecationConsumer): string {
    return consumer.via === 'nested' ? `Via ${consumer.viaGroupName ?? 'a parent group'}` : 'Direct';
}

function csvCell(value: string) {
    // Leading = + - @ would run as a formula in Excel; quote everything and neutralise those.
    const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
}

export const DEPRECATION_CSV_HEADER = [
    'Rule', 'Object type', 'Object', 'Object id', 'Deadline', 'Days remaining',
    'Consumer type', 'Consumer', 'Resource type', 'Platform', 'Role', 'Reached', 'Rule text',
];

/** One row per finding and consumer; a finding nobody uses still gets one row so it is not lost from the worklist. */
export function buildDeprecationCsv(findings: DeprecationFinding[]): string {
    const rows: string[][] = [DEPRECATION_CSV_HEADER];
    for (const f of findings) {
        const head = [
            f.ruleTitle, OBJECT_TYPE_LABEL[f.objectType], f.objectName, f.objectId,
            f.deadline ?? '', f.daysRemaining == null ? '' : String(f.daysRemaining),
        ];
        const evidence = f.evidence ?? '';
        if (f.consumers.length === 0) {
            rows.push([...head, '', '', '', '', '', '', evidence]);
            continue;
        }
        for (const c of f.consumers)
            rows.push([...head, CONSUMER_KIND_LABEL[c.kind], c.name, c.resourceType ?? '', c.platform ?? '',
                CONSUMER_ROLE_LABEL[c.role], describeReach(c), evidence]);
    }
    return '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n');
}
