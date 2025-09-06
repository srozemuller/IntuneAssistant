export interface Assignments {
    resourceType: string;
    assignmentType: string;
    platform: string | null;
    isAssigned: boolean;
    targetId: string | null;
    targetName: string;
    resourceId: string;
    resourceName: string | null;
    filterId: string | null;
    filterType: string;
    filter?: any;
    group?: any;
}
