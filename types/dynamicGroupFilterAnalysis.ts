export type FilterConvertibility = 'NotDynamic' | 'NoMappableProperties' | 'PartialConvertible' | 'FullyConvertible';
export type FilterMatchType = 'Exact' | 'Partial';

export interface MatchingExistingFilter {
    id: string;
    displayName: string;
    rule: string | null;
    platform: string | null;
    matchType: FilterMatchType;
}

export interface DynamicGroupFilterAnalysis {
    groupId: string;
    groupDisplayName: string;
    isDynamic: boolean;
    membershipRule: string | null;
    filterConvertibility: FilterConvertibility;
    unmappableProperties: string[];
    mappableProperties: string[];
    suggestedFilterRule: string | null;
    matchingExistingFilters: MatchingExistingFilter[];
    notes: string[];
}
