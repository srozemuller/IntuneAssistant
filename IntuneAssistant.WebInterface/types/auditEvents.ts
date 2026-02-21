// types/auditEvents.ts

export interface AuditEvent {
    id: string;
    displayName: string;
    componentName: string;
    activity: string;
    activityDateTime: string;
    activityType: string;
    actorUserId: string;
    actorUserPrincipalName: string;
    category: string;
    activityResult: string;
    resources?: AuditResource[];
    processedAt: string;
}

export interface AuditResource {
    resourceId: string;
    displayName: string;
    type: string;
    modifiedProperties?: ModifiedProperty[];
}

export interface ModifiedProperty {
    displayName: string;
    oldValue: string;
    newValue: string;
}

export interface AuditEventPageResponse {
    status: number;
    message: string;
    data: {
        items: AuditEvent[];
        totalCount?: number;
        pageNumber?: number;
        pageSize?: number;
        totalPages?: number;
    };
}

export interface AuditStatistics {
    totalEvents: number;
    oldestEvent: string;
    newestEvent: string;
    eventsByCategory: Record<string, number>;
    eventsByActivityType: Record<string, number>;
    eventsByComponent: Record<string, number>;
    eventsByActor: Record<string, number>;
    eventsByResult: Record<string, number>;
    topActivities: Array<{ activity: string; category: string; count: number }>;
    mostActiveUsers: Array<{
        userPrincipalName: string;
        userId: string;
        eventCount: number;
        topActivities: string[];
    }>;
    timeline: {
        eventsByDay: Record<string, number>;
        eventsByHour: Record<string, number>;
    };
}

export interface AuditStatisticsResponse {
    status: number;
    message: string;
    data: AuditStatistics;
}

export interface AuditMetadata {
    categories: string[];
    activities: string[];
    components: string[];
    actors: string[];
}

export interface AuditMetadataResponse {
    status: number;
    message: string;
    data: AuditMetadata;
}

export interface AuditFilterRequest {
    dateFrom?: string;
    dateTo?: string;
    categories?: string[];
    activities?: string[];
    components?: string[];
    actors?: string[];
    results?: Array<'Success' | 'Failure' | 'Warning'>;
    searchText?: string;
    pageNumber?: number;
    pageSize?: number;
}

export type FilterPreset = {
    id: string;
    name: string;
    filters: AuditFilterRequest;
};
