// lib/baselineCoverage.ts — tenant coverage of Microsoft security baselines (mirrors BaselineCoverage*Dto)

export type BaselineCoverageStatus = 'Matching' | 'Different' | 'Missing' | 'NotComparable';

export interface BaselineCoverageSummary {
    familyId: string;
    displayName: string | null;
    platforms: string | null;
    version: number;
    displayVersion: string | null;
    total: number;
    matching: number;
    different: number;
    missing: number;
    notComparable: number;
    configured: number;
    /** How the tenant relates to this baseline — decides whether a gap means anything. */
    relevance: BaselineRelevance;
    relevanceReason: string | null;
    adoptedPolicyNames: string[];
    configuredViaBaselinePolicy: number;
    configuredViaOwnPolicies: number;
}

export type BaselineRelevance = 'Adopted' | 'OwnPolicies' | 'NotFollowed';

export const RELEVANCE_META: Record<BaselineRelevance, { label: string; className: string; hint: string }> = {
    Adopted: { label: 'Adopted', className: 'border-emerald-500/50 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10', hint: 'A policy in your tenant is built from this baseline.' },
    OwnPolicies: { label: 'Via own policies', className: 'border-sky-500/50 text-sky-700 dark:text-sky-300 bg-sky-500/10', hint: 'No baseline policy, but your own Settings Catalog policies configure a meaningful share of it — a deliberate, common way to follow a baseline.' },
    NotFollowed: { label: 'Not followed', className: 'border-border text-muted-foreground bg-muted', hint: 'Nothing in your tenant is built from this baseline and hardly any of it matches. Any overlap is incidental; it raises no findings.' },
};

export interface BaselineCoveragePolicy {
    policyId: string; policyName: string; isAssigned: boolean;
    configuredRaw: string | null; configuredDisplay: string | null; matchesRecommendation: boolean;
}

export interface BaselineCoverageSetting {
    definitionId: string;
    displayName: string | null;
    categoryDisplayName: string | null;
    status: BaselineCoverageStatus;
    recommendedRaw: string | null;
    recommendedDisplay: string | null;
    children: BaselineCoverageSetting[];
    policies: BaselineCoveragePolicy[];
}

export interface BaselineCoverage {
    summary: BaselineCoverageSummary;
    harvestedAt: string | null;
    settings: BaselineCoverageSetting[];
}

export const COVERAGE_STATUS: Record<BaselineCoverageStatus, { label: string; className: string }> = {
    Matching:      { label: 'Matches',        className: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30' },
    Different:     { label: 'Differs',        className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30' },
    Missing:       { label: 'Not configured', className: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30' },
    NotComparable: { label: 'Configured',     className: 'bg-muted text-muted-foreground border-transparent' },
};
