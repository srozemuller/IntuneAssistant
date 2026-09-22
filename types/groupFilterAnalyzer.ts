export type FilterConvertibility = 'NotDynamic' | 'NoMappableProperties' | 'PartialConvertible' | 'FullyConvertible';
export type FilterMatchType = 'Exact' | 'Partial';

export interface MatchingExistingFilter {
    id: string;
    displayName: string;
    rule: string | null;
    platform: string | null;
    matchType: FilterMatchType;
}

export interface GroupFilterAnalysisSummaryDto {
    groupId: string;
    groupDisplayName: string;
    membershipRule: string;
    filterConvertibility: FilterConvertibility;
    mappableProperties: string[];
    unmappableProperties: string[];
    suggestedFilterRule: string | null;
    matchingExistingFilters: MatchingExistingFilter[];
}
