'use client';

import React, {useState, useCallback, useRef} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import {Badge} from '@/components/ui/badge';
import {
    Download,
    Monitor,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Smartphone,
    Laptop,
    HardDrive,
    Cpu,
    Shield,
    Users,
    RefreshCw,
    CheckCircle,
    Calendar,
    Wifi,
    Battery,
    ChevronUp,
    ChevronDown,
    X,
    Search,
    Plus,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import {useMsal} from '@azure/msal-react';
import {DEVICES_STATS_ENDPOINT, GROUPS_ENDPOINT, ITEMS_PER_PAGE} from '@/lib/constants';
import {apiScope} from "@/lib/msalConfig";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useApiRequest} from '@/hooks/useApiRequest';
import {ConsentDialog} from "@/components/ConsentDialog";

import {UserMember} from "@/hooks/useGroupDetails";
interface ApiResponse {
    status: number;
    message: string;
    details: unknown[];
    data: {
        data: DeviceStats[];
        totalCount: number;
        pageSize: number;
        currentPage: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        nextPageToken: string | null;
    };
}


interface GroupDetails {
    id: string;
    displayName: string;
    description: string | null;
    membershipRule: string | null;
    createdDateTime: string;
    groupCount: {
        userCount: number;
        deviceCount: number;
        groupCount: number;
    } | null;
    members: UserMember[] | null;
}

interface DeviceHardwareInfo {
    serialNumber: string;
    totalStorageSpace: number;
    freeStorageSpace: number;
    imei?: string | null;
    meid?: string | null;
    manufacturer: string;
    model: string;
    phoneNumber?: string | null;
    subscriberCarrier?: string | null;
    cellularTechnology?: string | null;
    wifiMac?: string | null;
    operatingSystemLanguage: string;
    isSupervised: boolean;
    isEncrypted: boolean;
    batterySerialNumber?: string | null;
    batteryHealthPercentage: number;
    batteryChargeCycles: number;
    isSharedDevice: boolean;
    tpmSpecificationVersion: string;
    operatingSystemEdition: string;
    deviceFullQualifiedDomainName?: string | null;
    deviceGuardVirtualizationBasedSecurityHardwareRequirementState: string;
    deviceGuardVirtualizationBasedSecurityState: string;
    deviceGuardLocalSystemAuthorityCredentialGuardState: string;
    osBuildNumber?: string | null;
    operatingSystemProductType: number;
    ipAddressV4?: string | null;
    subnetAddress?: string | null;
    esimIdentifier?: string | null;
    systemManagementBIOSVersion: string;
    tpmManufacturer: string;
    tpmVersion: string;
    wiredIPv4Addresses: string[];
    batteryLevelPercentage?: number | null;
    residentUsersCount?: number | null;
    productName?: string | null;
    deviceLicensingStatus: string;
    deviceLicensingLastErrorCode: number;
    deviceLicensingLastErrorDescription?: string | null;
}

interface DeviceStats {
    id: string;
    deviceName: string;
    userDisplayName: string;
    userPrincipalName: string;
    userId: string;
    azureAdDeviceId: string;
    platform: string;
    operatingSystem: string;
    osVersion: string;
    complianceState: 'Compliant' | 'Noncompliant' | 'Unknown';
    managementState: 'Managed' | 'Unmanaged' | 'Unknown';
    enrolledDateTime: string;
    lastSyncDateTime: string;
    serialNumber: string;
    manufacturer: string;
    model: string;
    totalStorageSpaceInBytes: number;
    freeStorageSpaceInBytes: number;
    totalPhysicalMemoryInBytes: number;
    processorArchitecture: string;
    deviceRegistrationState: string;
    isEncrypted: boolean;
    isSupervised: boolean;
    ethernetMacAddress: string;
    wiFiMacAddress: string;
    hardwareInfo: DeviceHardwareInfo;
    processedAt: string;
    batchIndex?: number | null;
    status: string;
    [key: string]: unknown;
}

interface DeviceFilters {
    platform?: string;
    complianceState?: string;
    managementState?: string;
    manufacturer?: string;
    encryptionStatus?: boolean;
    lastSyncDays?: number;
}

interface GroupSearchResult {
    id: string;
    displayName: string;
    description?: string;
    membershipRule?: string | null;
    groupCount?: {
        totalMembers: number;
        deviceMembers: number;
        userMembers: number;
    };
}

interface AddMembersResult {
    status: number;
    message: string;
    data: {
        totalRequested: number;
        totalSuccessful: number;
        totalFailed: number;
        successfulDeviceIds: string[];
        failedDeviceIds: string[];
        errors: { [deviceId: string]: string };
        failureDetails?: Array<{
            deviceId: string;
            error: string;
        }>;
    };
}

interface FilterOption {
    label: string;
    value: string | boolean | number;
    count: number;
}

export default function DeviceStatsPage() {
    const {instance, accounts} = useMsal();
    const { request } = useApiRequest();
    // Consent dialog state when not enough permissions
    const [showConsentDialog, setShowConsentDialog] = useState(false);
    const [consentUrl, setConsentUrl] = useState('');

    // Device fetching states
    const [totalDeviceCount, setTotalDeviceCount] = useState(0);
    const [hasMoreDevices, setHasMoreDevices] = useState(false);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [fetchPageSize, setFetchPageSize] = useState(100);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // State management
    const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
    const [filteredStats, setFilteredStats] = useState<DeviceStats[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<DeviceFilters>({});

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(ITEMS_PER_PAGE);

    // Device details dialog
    const [selectedDevice, setSelectedDevice] = useState<DeviceStats | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Pagination logic
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = filteredStats.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredStats.length / itemsPerPage);

    const [groups, setGroups] = useState<GroupDetails[]>([]);
    const [groupCreationMode, setGroupCreationMode] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [showCreateGroupOption, setShowCreateGroupOption] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [createGroupError, setCreateGroupError] = useState<string | null>(null);

    const [activeFilters, setActiveFilters] = useState<{ [key: string]: string | boolean | number }>({});
    const [filterHierarchy, setFilterHierarchy] = useState<string[]>([]);
    const [availableFilterTypes, setAvailableFilterTypes] = useState<string[]>([]);

    // Add devices to group constants
    const [showAddToGroupDialog, setShowAddToGroupDialog] = useState(false);
    const [searchedGroup, setSearchedGroup] = useState<GroupSearchResult | null>(null);

    const [groupSearchInput, setGroupSearchInput] = useState(''); // Change this line
    const [groupSearchLoading, setGroupSearchLoading] = useState(false);
    const [addMembersLoading, setAddMembersLoading] = useState(false);
    const [groupSearchError, setGroupSearchError] = useState<string | null>(null);
    const [addMembersError, setAddMembersError] = useState<string | null>(null);
    const [addToGroupStep, setAddToGroupStep] = useState(1);
    const [addMembersResult, setAddMembersResult] = useState<AddMembersResult | null>(null);
    const [allGroups, setAllGroups] = useState<GroupSearchResult[]>([]);
    const [filteredGroups, setFilteredGroups] = useState<GroupSearchResult[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [groupsError, setGroupsError] = useState<string | null>(null);

    const deviceColumns = [
        {
            key: 'deviceName',
            label: 'Device',
            minWidth: 200,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceStats;
                return (
                    <div className="flex items-center gap-2">
                        {device.platform === 'Windows' ? (
                            <Laptop className="h-4 w-4 text-blue-500" />
                        ) : device.platform === 'iOS' || device.platform === 'Android' ? (
                            <Smartphone className="h-4 w-4 text-green-500" />
                        ) : (
                            <Monitor className="h-4 w-4 text-gray-500" />
                        )}
                        <div>
                            <div className="font-medium max-w-xs truncate" title={device.deviceName}>
                                {device.deviceName}
                            </div>
                            <div className="text-xs text-gray-500">
                                {device.manufacturer} {device.model}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'userDisplayName',
            label: 'User',
            minWidth: 180,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceStats;
                return (
                    <div>
                        <div className="max-w-xs truncate" title={device.userDisplayName}>
                            {device.userDisplayName}
                        </div>
                        <div className="text-xs text-gray-500 max-w-xs truncate" title={device.userPrincipalName}>
                            {device.userPrincipalName}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'platform',
            label: 'Platform',
            minWidth: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceStats;
                return (
                    <Badge variant="outline">
                        {device.platform} {device.osVersion}
                    </Badge>
                );
            }
        },
        {
            key: 'complianceState',
            label: 'Compliance',
            minWidth: 140,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceStats;
                return (
                    <Badge variant={
                        device.complianceState === 'Compliant' ? 'default' :
                            device.complianceState === 'Noncompliant' ? 'destructive' : 'secondary'
                    }>
                        {device.complianceState === 'Compliant' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {device.complianceState === 'Noncompliant' && <XCircle className="h-3 w-3 mr-1" />}
                        {device.complianceState === 'Unknown' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {device.complianceState}
                    </Badge>
                );
            }
        },
        {
            key: 'managementState',
            label: 'Management',
            minWidth: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceStats;
                return (
                    <Badge variant={device.managementState === 'Managed' ? 'default' : 'secondary'}>
                        {device.managementState}
                    </Badge>
                );
            }
        },
        {
            key: 'lastSyncDateTime',
            label: 'Last Sync',
            minWidth: 150,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceStats;
                return (
                    <div>
                        <div className="text-sm">{formatDate(device.lastSyncDateTime)}</div>
                        <div className="text-xs text-gray-500">
                            {getDaysSinceLastSync(device.lastSyncDateTime)} days ago
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'totalStorageSpaceInBytes',
            label: 'Storage',
            minWidth: 150,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceStats;
                return (
                    <div>
                        <div className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                            {formatBytes(device.totalStorageSpaceInBytes - device.freeStorageSpaceInBytes)} / {formatBytes(device.totalStorageSpaceInBytes)}
                        </span>
                        </div>
                        {device.isEncrypted && (
                            <div className="flex items-center gap-1 text-green-600">
                                <Shield className="h-3 w-3" />
                                <span className="text-xs">Encrypted</span>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            minWidth: 120,
            sortable: false,
            searchable: false,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceStats;
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => showDeviceDetails(device)}
                    >
                        View Details
                    </Button>
                );
            }
        }
    ];


    const createNewGroup = async () => {
        if (!newGroupName.trim()) return;

        setIsCreatingGroup(true);
        setCreateGroupError(null);

        try {
            const responseData = await request<{status: string, message: string, data?: GroupSearchResult}>(
                `${GROUPS_ENDPOINT}/create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        displayName: newGroupName.trim(),
                        description: newGroupDescription.trim() || undefined
                    })
                }
            );

            if (!responseData) {
                throw new Error('No response received from API');
            }

            // Check if this is a consent required error with proper type checking
            if (responseData.status === 'Error' &&
                responseData.message === 'User challenge required' &&
                typeof responseData.data === 'object' &&
                responseData.data !== null &&
                'url' in responseData.data &&
                typeof responseData.data.url === 'string') {

                setConsentUrl(responseData.data.url);
                setShowConsentDialog(true);
                setIsCreatingGroup(false);
                return;
            }

            if (responseData.message === "Group already exists") {
                // Show subtle warning and switch to search mode
                setCreateGroupError("Group already exists");
                // Auto-switch to search mode and filter by the attempted group name
                setTimeout(() => {
                    setShowCreateGroupOption(false);
                    setGroupSearchInput(newGroupName.trim());
                    filterGroups(newGroupName.trim());
                    setCreateGroupError(null);
                    setNewGroupName('');
                    setNewGroupDescription('');
                }, 2000); // Show warning for 2 seconds then switch
            } else if (responseData.status === 'Error' && responseData.data) {
                const newGroup = responseData.data;
                setSearchedGroup(newGroup);
                setAddToGroupStep(2);
                // Reset create form
                setNewGroupName('');
                setNewGroupDescription('');
                setShowCreateGroupOption(false);
            } else {
                throw new Error(responseData.message || 'Failed to create group');
            }
        } catch (error) {
            console.error('Failed to create group:', error);
            setCreateGroupError(error instanceof Error ? error.message : 'Failed to create group');
        } finally {
            setIsCreatingGroup(false);
        }
    };


    const fetchAllGroups = async () => {
        if (!accounts.length) return;

        setLoadingGroups(true);
        setGroupsError(null);

        try {
            const response = await request<{status: number, data: GroupSearchResult[]}>(
                `${GROUPS_ENDPOINT}/list`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response) {
                throw new Error('No response received from API');
            }

            if (response.status === 0 && response.data) {
                const groups = Array.isArray(response.data) ? response.data : [response.data];
                setAllGroups(groups);
                setFilteredGroups(groups);
            } else {
                throw new Error('Failed to fetch groups');
            }
        } catch (error) {
            console.error('Failed to fetch groups:', error);
            setGroupsError(error instanceof Error ? error.message : 'Failed to fetch groups');
            setAllGroups([]);
            setFilteredGroups([]);
        } finally {
            setLoadingGroups(false);
        }
    };



    const filterGroups = (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setFilteredGroups(allGroups);
            return;
        }

        const filtered = allGroups.filter(group => {
            const searchLower = searchTerm.toLowerCase();
            return (
                group.displayName.toLowerCase().includes(searchLower) ||
                group.id.toLowerCase().includes(searchLower) ||
                (group.description && group.description.toLowerCase().includes(searchLower))
            );
        });

        setFilteredGroups(filtered);
    };

// Update your default collapsed state
    const [filtersExpanded, setFiltersExpanded] = useState(false);

// Update the group search input handler
    const handleGroupSearchChange = (value: string) => {
        setGroupSearchInput(value);
        filterGroups(value);
    };
    const handleConsentComplete = async () => {
        setShowConsentDialog(false);
        setConsentUrl('');
        // Retry the migration after consent is complete
        await fetchDeviceStats();
    };

// Update the group selection function
    const selectGroup = (group: GroupSearchResult) => {
        setSearchedGroup(group);
        setAddToGroupStep(2);
    };
    // Enhanced function to apply dynamic filtering
    const getFilteredDevicesForProperty = (excludeProperty?: string) => {
        let filtered = [...deviceStats];

        // Apply all active filters except the one we're calculating options for
        Object.entries(activeFilters).forEach(([property, value]) => {
            if (property !== excludeProperty) {
                filtered = filtered.filter(device => {
                    const propertyValue = getNestedProperty(device, property);
                    return propertyValue === value;
                });
            }
        });

        return filtered;
    };
    const getAllAvailableFilters = () => {
        const baseFilters = [
            'platform',
            'complianceState',
            'managementState',
            'manufacturer',
            'isEncrypted',
            'isSupervised',
            'deviceRegistrationState',
            'hardwareInfo.operatingSystemLanguage',
            'hardwareInfo.tpmSpecificationVersion',
            'hardwareInfo.tpmManufacturer',
            'hardwareInfo.tpmVersion',
            'hardwareInfo.systemManagementBIOSVersion',
            'hardwareInfo.operatingSystemEdition',
            'hardwareInfo.deviceLicensingStatus',
            'hardwareInfo.cellularTechnology',
            'hardwareInfo.subscriberCarrier',
            'operatingSystem',
            'processorArchitecture'
        ];

        // Add computed filters
        const computedFilters = [
            'storageUsage',
            'batteryHealth',
            'syncStatus',
            'memorySize',
            'deviceAge'
        ];

        return [...baseFilters, ...computedFilters];
    };
// Enhanced function to get filtered devices for drill-down
    const getFilteredDevicesForDrillDown = (excludeProperty?: string) => {
        let filtered = [...deviceStats];

        // Apply all active filters except the one we're calculating options for
        Object.entries(activeFilters).forEach(([property, value]) => {
            if (property !== excludeProperty) {
                filtered = filtered.filter(device => {
                    return matchesFilter(device, property, value);
                });
            }
        });

        return filtered;
    };

    // Enhanced matching function for all filter types
    const matchesFilter = (device: DeviceStats, property: string, value: string | boolean | number): boolean => {
        switch (property) {
            case 'storageUsage':
                const storagePercent = ((device.totalStorageSpaceInBytes - device.freeStorageSpaceInBytes) / device.totalStorageSpaceInBytes) * 100;
                switch (value) {
                    case 'high':
                        return storagePercent > 80;
                    case 'medium':
                        return storagePercent > 50 && storagePercent <= 80;
                    case 'low':
                        return storagePercent <= 50;
                    default:
                        return false;
                }
            case 'batteryHealth':
                const batteryHealth = device.hardwareInfo?.batteryHealthPercentage;
                if (!batteryHealth) return false;
                switch (value) {
                    case 'excellent':
                        return batteryHealth >= 90;
                    case 'good':
                        return batteryHealth >= 80 && batteryHealth < 90;
                    case 'fair':
                        return batteryHealth >= 60 && batteryHealth < 80;
                    case 'poor':
                        return batteryHealth < 60;
                    default:
                        return false;
                }
            case 'syncStatus':
                const daysSinceSync = getDaysSinceLastSync(device.lastSyncDateTime);
                switch (value) {
                    case 'recent':
                        return daysSinceSync <= 1;
                    case 'current':
                        return daysSinceSync > 1 && daysSinceSync <= 7;
                    case 'stale':
                        return daysSinceSync > 7 && daysSinceSync <= 30;
                    case 'very-stale':
                        return daysSinceSync > 30;
                    default:
                        return false;
                }
            case 'memorySize':
                const memoryGB = device.totalPhysicalMemoryInBytes / (1024 * 1024 * 1024);
                switch (value) {
                    case 'low':
                        return memoryGB < 8;
                    case 'medium':
                        return memoryGB >= 8 && memoryGB < 16;
                    case 'high':
                        return memoryGB >= 16 && memoryGB < 32;
                    case 'very-high':
                        return memoryGB >= 32;
                    default:
                        return false;
                }
            case 'deviceAge':
                const enrolledDate = new Date(device.enrolledDateTime);
                const monthsOld = (new Date().getTime() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
                switch (value) {
                    case 'new':
                        return monthsOld < 3;
                    case 'recent':
                        return monthsOld >= 3 && monthsOld < 12;
                    case 'mature':
                        return monthsOld >= 12 && monthsOld < 24;
                    case 'old':
                        return monthsOld >= 24;
                    default:
                        return false;
                }
            default:
                const propertyValue = getNestedProperty(device, property);
                return propertyValue === value;
        }
    };

// Enhanced function to get available options for a specific filter
    const getAvailableFilterOptions = (filterType: string): FilterOption[] => {
        const filteredDevices = getFilteredDevicesForDrillDown(filterType);

        switch (filterType) {
            case 'storageUsage':
                return [
                    {
                        label: 'High Usage (>80%)',
                        value: 'high',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'high')).length
                    },
                    {
                        label: 'Medium Usage (50-80%)',
                        value: 'medium',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'medium')).length
                    },
                    {
                        label: 'Low Usage (≤50%)',
                        value: 'low',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'low')).length
                    }
                ];
            case 'batteryHealth':
                return [
                    {
                        label: 'Excellent (≥90%)',
                        value: 'excellent',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'excellent')).length
                    },
                    {
                        label: 'Good (80-89%)',
                        value: 'good',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'good')).length
                    },
                    {
                        label: 'Fair (60-79%)',
                        value: 'fair',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'fair')).length
                    },
                    {
                        label: 'Poor (<60%)',
                        value: 'poor',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'poor')).length
                    }
                ];
            case 'syncStatus':
                return [
                    {
                        label: 'Recent (≤1 day)',
                        value: 'recent',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'recent')).length
                    },
                    {
                        label: 'Current (1-7 days)',
                        value: 'current',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'current')).length
                    },
                    {
                        label: 'Stale (7-30 days)',
                        value: 'stale',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'stale')).length
                    },
                    {
                        label: 'Very Stale (>30 days)',
                        value: 'very-stale',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'very-stale')).length
                    }
                ];
            case 'memorySize':
                return [
                    {
                        label: 'Low (<8GB)',
                        value: 'low',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'low')).length
                    },
                    {
                        label: 'Medium (8-16GB)',
                        value: 'medium',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'medium')).length
                    },
                    {
                        label: 'High (16-32GB)',
                        value: 'high',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'high')).length
                    },
                    {
                        label: 'Very High (≥32GB)',
                        value: 'very-high',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'very-high')).length
                    }
                ];
            case 'deviceAge':
                return [
                    {
                        label: 'New (<3 months)',
                        value: 'new',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'new')).length
                    },
                    {
                        label: 'Recent (3-12 months)',
                        value: 'recent',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'recent')).length
                    },
                    {
                        label: 'Mature (1-2 years)',
                        value: 'mature',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'mature')).length
                    },
                    {
                        label: 'Old (>2 years)',
                        value: 'old',
                        count: filteredDevices.filter(d => matchesFilter(d, filterType, 'old')).length
                    }
                ];
            default:
                const uniqueValues = [...new Set(filteredDevices.map(device => getNestedProperty(device, filterType)))]
                    .filter(value => value !== null && value !== undefined)
                    .filter(value => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean');

                return uniqueValues.map(value => ({
                    label: String(value),
                    value: value as string | number | boolean,
                    count: filteredDevices.filter(device => getNestedProperty(device, filterType) === value).length
                }));
        }
    };

// Function to get human-readable filter names
    const getFilterDisplayName = (filterType: string): string => {
        const displayNames: { [key: string]: string } = {
            'platform': 'Platform',
            'complianceState': 'Compliance State',
            'managementState': 'Management State',
            'manufacturer': 'Manufacturer',
            'isEncrypted': 'Encryption Status',
            'isSupervised': 'Supervision Status',
            'deviceRegistrationState': 'Registration State',
            'hardwareInfo.operatingSystemLanguage': 'OS Language',
            'hardwareInfo.tpmSpecificationVersion': 'TPM Specification',
            'hardwareInfo.tpmManufacturer': 'TPM Manufacturer',
            'hardwareInfo.tpmVersion': 'TPM Version',
            'hardwareInfo.systemManagementBIOSVersion': 'BIOS Version',
            'hardwareInfo.operatingSystemEdition': 'OS Edition',
            'hardwareInfo.deviceLicensingStatus': 'Licensing Status',
            'hardwareInfo.cellularTechnology': 'Cellular Technology',
            'hardwareInfo.subscriberCarrier': 'Carrier',
            'operatingSystem': 'Operating System',
            'processorArchitecture': 'Processor Architecture',
            'storageUsage': 'Storage Usage',
            'batteryHealth': 'Battery Health',
            'syncStatus': 'Sync Status',
            'memorySize': 'Memory Size',
            'deviceAge': 'Device Age'
        };

        return displayNames[filterType] || filterType;
    };


    const addMembersToGroup = async () => {
        if (!searchedGroup || selectedDevices.length === 0) return;

        setAddMembersLoading(true);
        setAddMembersError(null);

        try {
            const selectedDeviceObjects = deviceStats.filter(device =>
                selectedDevices.includes(device.id)
            );

            const data = await request<AddMembersResult>(
                `${GROUPS_ENDPOINT}/${searchedGroup.id}/members/devices`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        deviceIds: selectedDevices.map(deviceId => {
                            const device = deviceStats.find(d => d.id === deviceId);
                            return device?.azureAdDeviceId;
                        }).filter(Boolean)
                    })
                }
            );

            // Handle the case where data might be undefined (consent required)
            if (!data) {
                return;
            }

            if (data.status === 0) {
                // Store the result and move to step 3
                setAddMembersResult(data);
                setAddToGroupStep(3);

                // Only clear selection if all devices were successful
                if (data.data.totalSuccessful === selectedDevices.length) {
                    setSelectedDevices([]);
                }
            } else {
                throw new Error(data.message || 'Failed to add devices to group');
            }
        } catch (error) {
            console.error('Error adding members:', error);
            setAddMembersError("Unable to add devices to the group. Please try again.");
        } finally {
            setAddMembersLoading(false);
        }
    };

    const resetAddToGroupDialog = () => {
        setShowAddToGroupDialog(false);
        setAddToGroupStep(1);
        setSearchedGroup(null);
        setGroupSearchInput('');
        setGroupSearchError(null);
        setAddMembersError(null);
        setAddMembersResult(null);
        setAllGroups([]);
        setFilteredGroups([]);
        setGroupsError(null);
        setShowCreateGroupOption(false);
        setNewGroupName('');
        setNewGroupDescription('');
        setCreateGroupError(null);
    };

// Fetch groups when dialog opens
    React.useEffect(() => {
        if (showAddToGroupDialog && addToGroupStep === 1) {
            fetchAllGroups();
        }
    }, [showAddToGroupDialog, addToGroupStep]);


    // Enhanced device selection function
    const selectDevicesByProperty = (propertyPath: string, value: string | boolean | number) => {
        const newFilters = {...activeFilters, [propertyPath]: value};
        setActiveFilters(newFilters);

        // Get devices that match ALL active filters
        const matchingDevices = deviceStats.filter(device => {
            return Object.entries(newFilters).every(([filterProperty, filterValue]) => {
                const propertyValue = getNestedProperty(device, filterProperty);
                return propertyValue === filterValue;
            });
        }).map(device => device.id);

        setSelectedDevices(matchingDevices);
    };

    // Function to clear a specific filter
    const clearFilter = (propertyPath: string) => {
        const newFilters = {...activeFilters};
        delete newFilters[propertyPath];
        setActiveFilters(newFilters);

        // Recalculate selected devices based on remaining filters
        if (Object.keys(newFilters).length === 0) {
            setSelectedDevices([]);
        } else {
            const matchingDevices = deviceStats.filter(device => {
                return Object.entries(newFilters).every(([filterProperty, filterValue]) => {
                    return matchesFilter(device, filterProperty, filterValue);
                });
            }).map(device => device.id);
            setSelectedDevices(matchingDevices);
        }
    };

    // Function to clear all filters
    const clearAllFilters = () => {
        setActiveFilters({});
        setSelectedDevices([]);
    };

    const getCountForPropertyValue = (propertyPath: string, value: string | boolean | number) => {
        const filteredDevices = getFilteredDevicesForProperty(propertyPath);
        return filteredDevices.filter(device => {
            const propertyValue = getNestedProperty(device, propertyPath);
            return propertyValue === value;
        }).length;
    };
    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    // Add this function to create an Entra ID group


    const getNestedProperty = (obj: DeviceStats | Record<string, unknown>, path: string): unknown => {
        return path.split('.').reduce((current: unknown, key: string) => {
            if (current && typeof current === 'object' && key in current) {
                return (current as Record<string, unknown>)[key];
            }
            return undefined;
        }, obj as Record<string, unknown>);
    };


// Add this function to get unique values from nested properties
    const getUniqueNestedValues = (propertyPath: string) => {
        const values = deviceStats.map(device => getNestedProperty(device, propertyPath))
            .filter(value => value !== null && value !== undefined);
        return [...new Set(values)];
    };

    // Fetch device statistics
    // Update the fetchDeviceStats function
    const fetchDeviceStats = async (pageSize: number = 100, skipToken?: string, append: boolean = false) => {
        if (!accounts.length) return;

        if (append) {
            setIsFetchingMore(true);
        } else {
            setLoading(true);
            setDeviceStats([]);
            setFilteredStats([]);
            setNextPageToken(null);
        }
        setError(null);

        try {
            const params = new URLSearchParams({
                pageSize: pageSize.toString()
            });

            if (skipToken) {
                params.append('skipToken', skipToken);
            }

            const response = await request<ApiResponse>(
                `${DEVICES_STATS_ENDPOINT}?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response) {
                throw new Error('No response received from API');
            }

            if (!response.data?.data || !Array.isArray(response.data.data)) {
                throw new Error('Invalid data format received from API');
            }

            const newDevices = response.data.data;

            if (append) {
                setDeviceStats(prev => [...prev, ...newDevices]);
                setFilteredStats(prev => [...prev, ...newDevices]);
            } else {
                setDeviceStats(newDevices);
                setFilteredStats(newDevices);
            }

            setTotalDeviceCount(response.data.totalCount);
            setHasMoreDevices(response.data.hasNextPage);
            setNextPageToken(response.data.nextPageToken);

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch device statistics');
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

// Add function to load more devices
    const loadMoreDevices = () => {
        if (nextPageToken && hasMoreDevices && !isFetchingMore) {
            fetchDeviceStats(fetchPageSize, nextPageToken, true);
        }
    };

// Add function to reset and fetch with different page size
    const fetchWithPageSize = (newPageSize: number) => {
        setFetchPageSize(newPageSize);
        fetchDeviceStats(newPageSize);
    };

    // Apply filters
    const applyFilters = useCallback(() => {
        let filtered = [...deviceStats];

        if (filters.platform) {
            filtered = filtered.filter(device => device.platform === filters.platform);
        }

        if (filters.complianceState) {
            filtered = filtered.filter(device => device.complianceState === filters.complianceState);
        }

        if (filters.managementState) {
            filtered = filtered.filter(device => device.managementState === filters.managementState);
        }

        if (filters.manufacturer) {
            filtered = filtered.filter(device => device.manufacturer === filters.manufacturer);
        }

        if (filters.encryptionStatus !== undefined) {
            filtered = filtered.filter(device => device.isEncrypted === filters.encryptionStatus);
        }

        if (filters.lastSyncDays) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - filters.lastSyncDays);
            filtered = filtered.filter(device => {
                const lastSync = new Date(device.lastSyncDateTime);
                return lastSync >= cutoffDate;
            });
        }
        if (Object.keys(activeFilters).length > 0) {
            filtered = filtered.filter(device => {
                return Object.entries(activeFilters).every(([filterProperty, filterValue]) => {
                    return matchesFilter(device, filterProperty, filterValue);
                });
            });
        }

        setFilteredStats(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [deviceStats, filters, activeFilters]);

    // Apply filters when filters change
    React.useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Format bytes to human readable
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get days since last sync
    const getDaysSinceLastSync = (lastSyncDateTime: string): number => {
        const lastSync = new Date(lastSyncDateTime);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastSync.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Show device details
    const showDeviceDetails = (device: DeviceStats) => {
        setSelectedDevice(device);
        setIsDialogOpen(true);
    };

    // Export selected devices
    const exportSelectedDevices = () => {
        const selected = deviceStats.filter(device => selectedDevices.includes(device.id));
        if (selected.length === 0) {
            alert('No devices selected for export');
            return;
        }

        const csvContent = [
            // CSV headers
            'Device Name,User,Platform,OS Version,Compliance State,Management State,Enrolled Date,Last Sync,Manufacturer,Model,Serial Number,Encrypted,Storage Used,Battery Level',
            // CSV rows
            ...selected.map(device => [
                device.deviceName,
                device.userDisplayName,
                device.platform,
                device.osVersion,
                device.complianceState,
                device.managementState,
                formatDate(device.enrolledDateTime),
                formatDate(device.lastSyncDateTime),
                device.manufacturer,
                device.model,
                device.serialNumber,
                device.isEncrypted ? 'Yes' : 'No',
                formatBytes(device.totalStorageSpaceInBytes - device.freeStorageSpaceInBytes),
                device.hardwareInfo?.batteryLevelPercentage ? `${device.hardwareInfo.batteryLevelPercentage}%` : 'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], {type: 'text/csv'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `device-statistics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    // Get unique values for filter dropdowns
    const getUniqueValues = (key: keyof DeviceStats) => {
        return [...new Set(deviceStats.map(device => device[key] as string))].filter(Boolean);
    };

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Device Statistics</h1>
                    <p className="text-gray-600 mt-2">
                        Monitor and analyze device information
                        {totalDeviceCount > 0 && (
                            <span className="ml-2 text-sm font-medium">
                    ({deviceStats.length} of {totalDeviceCount} devices loaded)
                </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    {/* Page Size Selector */}
                    {deviceStats.length === 0 && !loading && (
                        <select
                            value={fetchPageSize}
                            onChange={(e) => setFetchPageSize(Number(e.target.value))}
                            className="border rounded-md px-3 py-2 text-sm"
                        >
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                            <option value={250}>250 per page</option>
                            <option value={500}>500 per page</option>
                        </select>
                    )}

                    <Button
                        onClick={() => setShowAddToGroupDialog(true)}
                        disabled={selectedDevices.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                        <Users className="mr-2 h-4 w-4"/>
                        Add to Group ({selectedDevices.length})
                    </Button>
                    <Button onClick={exportSelectedDevices} variant="outline" disabled={selectedDevices.length === 0}>
                        <Download className="h-4 w-4 mr-2"/>
                        Export Selected ({selectedDevices.length})
                    </Button>
                    <Button onClick={() => fetchDeviceStats(fetchPageSize)} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}/>
                        {loading ? 'Loading...' : deviceStats.length > 0 ? 'Refresh' : 'Fetch Devices'}
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <X className="h-5 w-5" />
                            <span className="font-medium">Error:</span>
                            <span>{error}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Error occurred while fetching settings. Please try again.
                        </p>
                        <Button onClick={() => fetchDeviceStats(fetchPageSize)} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Show welcome card when no device stats are loaded and not loading */}
            {deviceStats.length === 0 && !loading && !error && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-6">
                                <Monitor className="h-16 w-16 mx-auto"/>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-4">
                                Ready to view your device overview
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Click the &quot;Fetch Devices&quot; button to load device information from your Intune environment.
                            </p>

                            {/* Page Size Selection */}
                            <div className="mb-6 flex flex-col items-center gap-3">
                                <Label className="text-sm font-medium">Devices per page:</Label>
                                <select
                                    value={fetchPageSize}
                                    onChange={(e) => setFetchPageSize(Number(e.target.value))}
                                    className="border rounded-md px-4 py-2 text-sm w-48"
                                >
                                    <option value={50}>50</option>
                                    <option value={100}>100 (recommended)</option>
                                    <option value={250}>250</option>
                                    <option value={500}>500</option>
                                </select>
                            </div>

                            <Button onClick={() => fetchDeviceStats(fetchPageSize)} className="flex items-center gap-2 mx-auto" size="lg">
                                <Monitor className="h-5 w-5"/>
                                Fetch Devices
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}


            {loading && deviceStats.length === 0 && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4"/>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Loading Device Data
                            </h3>
                            <p className="text-gray-600">
                                Fetching device information and statistics from your Intune environment...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Stats */}
            {(deviceStats.length > 0 || loading) && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{filteredStats.length}</div>
                            <div className="text-sm text-gray-600">Total Devices</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {filteredStats.filter(d => d.complianceState === 'Compliant').length}
                            </div>
                            <div className="text-sm text-gray-600">Compliant</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {filteredStats.filter(d => d.complianceState === 'Noncompliant').length}
                            </div>
                            <div className="text-sm text-gray-600">Non-compliant</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {filteredStats.filter(d => d.isEncrypted).length}
                            </div>
                            <div className="text-sm text-gray-600">Encrypted</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {filteredStats.filter(d => getDaysSinceLastSync(d.lastSyncDateTime) > 7).length}
                            </div>
                            <div className="text-sm text-gray-600">Stale (7+ days)</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Enhanced Quick Select with Drill-Down */}
            {deviceStats.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-lg">Advanced Device Filtering</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                                    className="h-8 w-8 p-0"
                                >
                                    {filtersExpanded ? (
                                        <ChevronUp className="h-4 w-4"/>
                                    ) : (
                                        <ChevronDown className="h-4 w-4"/>
                                    )}
                                </Button>
                                {!filtersExpanded && Object.keys(activeFilters).length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                        {Object.keys(activeFilters).length} filters active
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {Object.keys(activeFilters).length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllFilters}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Clear All Filters
                                    </Button>
                                )}
                                <Badge variant="secondary">
                                    {selectedDevices.length} selected
                                </Badge>
                            </div>
                        </div>
                        {!filtersExpanded && Object.keys(activeFilters).length > 0 && (
                            <div className="mt-3 border rounded-lg p-3 bg-blue-50">
                                <div className="text-sm font-medium text-blue-800 mb-2">Active Filters:</div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(activeFilters).map(([property, value]) => (
                                        <Badge
                                            key={property}
                                            variant="default"
                                            className="flex items-center gap-1 text-xs"
                                        >
                                            {getFilterDisplayName(property)}: {String(value)}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearFilter(property);
                                                }}
                                                className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3"/>
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardHeader>

                    {filtersExpanded && (
                        <CardContent className="space-y-6">
                            {/* Filter Breadcrumb */}
                            {Object.keys(activeFilters).length > 0 && (
                                <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <div className="text-sm font-medium text-blue-800 mb-3">Active Filter Chain:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(activeFilters).map(([property, value], index) => (
                                            <div key={property} className="flex items-center">
                                                {index > 0 && <span className="mx-2 text-blue-600">→</span>}
                                                <Badge variant="default" className="flex items-center gap-2">
                                                    <span
                                                        className="text-xs opacity-75">{getFilterDisplayName(property)}:</span>
                                                    <span className="font-medium">{String(value)}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            clearFilter(property);
                                                        }}
                                                        className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                                                    >
                                                        <X className="h-3 w-3"/>
                                                    </button>
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 text-sm text-blue-700">
                                        Showing {getFilteredDevicesForDrillDown().length} devices matching all criteria
                                    </div>
                                </div>
                            )}

                            {/* Available Filters */}
                            <div className="space-y-4">
                                <div className="text-lg font-semibold text-gray-800">Available Filters</div>

                                {/* Basic Device Properties */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-700 mb-3">Basic Properties</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {['platform', 'manufacturer', 'operatingSystem', 'processorArchitecture'].map(filterType => {
                                            if (activeFilters[filterType]) return null;
                                            const options = getAvailableFilterOptions(filterType);
                                            if (options.length === 0) return null;

                                            return (
                                                <div key={filterType}>
                                                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                                                        {getFilterDisplayName(filterType)}
                                                    </label>
                                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                                        {options.slice(0, 8).map(option => (
                                                            <Button
                                                                key={String(option.value)}
                                                                variant="outline"
                                                                size="sm"
                                                                className={`w-full justify-between text-xs ${option.count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                onClick={() => selectDevicesByProperty(filterType, option.value)}
                                                                disabled={option.count === 0}
                                                            >
                                                                <span className="truncate">{option.label}</span>
                                                                <Badge variant="secondary" className="text-xs ml-2">
                                                                    {option.count}
                                                                </Badge>
                                                            </Button>
                                                        ))}
                                                        {options.length > 8 && (
                                                            <p className="text-xs text-gray-500 px-2">+{options.length - 8} more
                                                                options</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Security & Compliance */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-700 mb-3">Security & Compliance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        {['complianceState', 'managementState', 'isEncrypted', 'isSupervised', 'deviceRegistrationState'].map(filterType => {
                                            if (activeFilters[filterType]) return null;
                                            const options = getAvailableFilterOptions(filterType);
                                            if (options.length === 0) return null;

                                            return (
                                                <div key={filterType}>
                                                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                                                        {getFilterDisplayName(filterType)}
                                                    </label>
                                                    <div className="space-y-1">
                                                        {options.map(option => (
                                                            <Button
                                                                key={String(option.value)}
                                                                variant="outline"
                                                                size="sm"
                                                                className={`w-full justify-between text-xs ${option.count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                onClick={() => selectDevicesByProperty(filterType, option.value)}
                                                                disabled={option.count === 0}
                                                            >
                                                    <span className="flex items-center gap-1">
                                                        {filterType === 'isEncrypted' && <Shield className="h-3 w-3"/>}
                                                        {filterType === 'complianceState' && option.value === 'Compliant' &&
                                                            <CheckCircle2 className="h-3 w-3 text-green-600"/>}
                                                        {filterType === 'complianceState' && option.value === 'Noncompliant' &&
                                                            <XCircle className="h-3 w-3 text-red-600"/>}
                                                        <span className="truncate">{String(option.label)}</span>
                                                    </span>
                                                                <Badge variant="secondary" className="text-xs ml-2">
                                                                    {option.count}
                                                                </Badge>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* TPM & Hardware Security */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-700 mb-3">TPM & Hardware Security</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {['hardwareInfo.tpmSpecificationVersion', 'hardwareInfo.tpmManufacturer', 'hardwareInfo.tpmVersion', 'hardwareInfo.systemManagementBIOSVersion'].map(filterType => {
                                            if (activeFilters[filterType]) return null;
                                            const options = getAvailableFilterOptions(filterType);
                                            if (options.length === 0) return null;

                                            return (
                                                <div key={filterType}>
                                                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                                                        {getFilterDisplayName(filterType)}
                                                    </label>
                                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                                        {options.slice(0, 6).map(option => (
                                                            <Button
                                                                key={String(option.value)}
                                                                variant="outline"
                                                                size="sm"
                                                                className={`w-full justify-between text-xs ${option.count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                onClick={() => selectDevicesByProperty(filterType, option.value)}
                                                                disabled={option.count === 0}
                                                            >
                                                    <span className="flex items-center gap-1">
                                                        {filterType.includes('tpm') && <Shield className="h-3 w-3"/>}
                                                        {filterType.includes('BIOS') && <Cpu className="h-3 w-3"/>}
                                                        <span className="truncate">
                                                            {String(option.label).length > 15
                                                                ? String(option.label).substring(0, 15) + '...'
                                                                : String(option.label)
                                                            }
                                                        </span>
                                                    </span>
                                                                <Badge variant="secondary" className="text-xs ml-2">
                                                                    {option.count}
                                                                </Badge>
                                                            </Button>
                                                        ))}
                                                        {options.length > 6 && (
                                                            <p className="text-xs text-gray-500 px-2">+{options.length - 6} more
                                                                versions</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Performance & Usage Metrics */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-700 mb-3">Performance & Usage</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {['storageUsage', 'memorySize', 'batteryHealth', 'syncStatus'].map(filterType => {
                                            if (activeFilters[filterType]) return null;
                                            const options = getAvailableFilterOptions(filterType);
                                            if (options.length === 0) return null;

                                            return (
                                                <div key={filterType}>
                                                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                                                        {getFilterDisplayName(filterType)}
                                                    </label>
                                                    <div className="space-y-1">
                                                        {options.map(option => (
                                                            <Button
                                                                key={String(option.value)}
                                                                variant="outline"
                                                                size="sm"
                                                                className={`w-full justify-between text-xs ${option.count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                onClick={() => selectDevicesByProperty(filterType, option.value)}
                                                                disabled={option.count === 0}
                                                            >
                                                    <span className="flex items-center gap-1">
                                                        {filterType === 'storageUsage' &&
                                                            <HardDrive className="h-3 w-3"/>}
                                                        {filterType === 'batteryHealth' &&
                                                            <Battery className="h-3 w-3"/>}
                                                        {filterType === 'syncStatus' &&
                                                            <RefreshCw className="h-3 w-3"/>}
                                                        {filterType === 'memorySize' && <Cpu className="h-3 w-3"/>}
                                                        <span className="truncate">{option.label}</span>
                                                    </span>
                                                                <Badge variant="secondary" className="text-xs ml-2">
                                                                    {option.count}
                                                                </Badge>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* System Configuration */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-700 mb-3">System Configuration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {['hardwareInfo.operatingSystemLanguage', 'hardwareInfo.operatingSystemEdition', 'hardwareInfo.deviceLicensingStatus', 'deviceAge'].map(filterType => {
                                            if (activeFilters[filterType]) return null;
                                            const options = getAvailableFilterOptions(filterType);
                                            if (options.length === 0) return null;

                                            return (
                                                <div key={filterType}>
                                                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                                                        {getFilterDisplayName(filterType)}
                                                    </label>
                                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                                        {options.slice(0, 8).map(option => (
                                                            <Button
                                                                key={String(option.value)}
                                                                variant="outline"
                                                                size="sm"
                                                                className={`w-full justify-between text-xs ${option.count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                onClick={() => selectDevicesByProperty(filterType, option.value)}
                                                                disabled={option.count === 0}
                                                            >
                                                    <span className="flex items-center gap-1">
                                                        {filterType === 'deviceAge' && <Calendar className="h-3 w-3"/>}
                                                        <span className="truncate">{option.label}</span>
                                                    </span>
                                                                <Badge variant="secondary" className="text-xs ml-2">
                                                                    {option.count}
                                                                </Badge>
                                                            </Button>
                                                        ))}
                                                        {options.length > 8 && (
                                                            <p className="text-xs text-gray-500 px-2">+{options.length - 8} more
                                                                options</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}


            {/* Device List */}
            {filteredStats.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle>Device List</CardTitle>
                                {Object.keys(activeFilters).length > 0 && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        Filtered View ({filteredStats.length} of {deviceStats.length})
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const currentPageDeviceIds = paginatedResults.map(d => d.id);
                                    const allSelected = currentPageDeviceIds.every(id => selectedDevices.includes(id));

                                    if (allSelected) {
                                        setSelectedDevices(prev => prev.filter(id => !currentPageDeviceIds.includes(id)));
                                    } else {
                                        const newSelection = [...new Set([...selectedDevices, ...currentPageDeviceIds])];
                                        setSelectedDevices(newSelection);
                                    }
                                }}
                            >
                                {selectedDevices.length === paginatedResults.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={filteredStats}
                            columns={deviceColumns}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            showPagination={true}
                            showSearch={true}
                            searchPlaceholder="Search devices..."
                            selectedRows={selectedDevices}
                            onSelectionChange={setSelectedDevices}
                            onRowClick={(row) => showDeviceDetails(row as unknown as DeviceStats)}
                        />
                    </CardContent>
                </Card>
            )}

            {deviceStats.length > 0 && hasMoreDevices && (
                <Card className="mt-4">
                    <CardContent className="p-6 text-center">
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600">
                                Showing {deviceStats.length} of {totalDeviceCount} devices
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full transition-all"
                                        style={{width: `${(deviceStats.length / totalDeviceCount) * 100}%`}}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={loadMoreDevices}
                                disabled={isFetchingMore}
                                className="w-full sm:w-auto"
                            >
                                {isFetchingMore ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin"/>
                                        Loading More...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRight className="mr-2 h-4 w-4"/>
                                        Load More Devices ({Math.min(fetchPageSize, totalDeviceCount - deviceStats.length)})
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Device Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="!w-[90vw] !max-w-[90vw] h-[75vh] max-h-none overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5"/>
                            Device Details - {selectedDevice?.deviceName}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedDevice && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Device ID</label>
                                            <p className="text-sm font-mono break-all">{selectedDevice.id}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Device Name</label>
                                            <p className="text-sm font-semibold">{selectedDevice.deviceName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">User Display
                                                Name</label>
                                            <p className="text-sm">{selectedDevice.userDisplayName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">User Principal
                                                Name</label>
                                            <p className="text-sm font-mono">{selectedDevice.userPrincipalName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Platform</label>
                                            <p className="text-sm">{selectedDevice.platform}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Operating
                                                System</label>
                                            <p className="text-sm">{selectedDevice.operatingSystem}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">OS Version</label>
                                            <p className="text-sm">{selectedDevice.osVersion}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Processor
                                                Architecture</label>
                                            <p className="text-sm">{selectedDevice.processorArchitecture}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status and Compliance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Status & Compliance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Compliance
                                                State</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                {selectedDevice.complianceState === 'Compliant' &&
                                                    <CheckCircle2 className="h-4 w-4 text-green-600"/>}
                                                {selectedDevice.complianceState === 'Noncompliant' &&
                                                    <XCircle className="h-4 w-4 text-red-600"/>}
                                                {selectedDevice.complianceState === 'Unknown' &&
                                                    <AlertTriangle className="h-4 w-4 text-yellow-600"/>}
                                                <Badge
                                                    variant={selectedDevice.complianceState === 'Compliant' ? 'default' :
                                                        selectedDevice.complianceState === 'Noncompliant' ? 'destructive' : 'secondary'}>
                                                    {selectedDevice.complianceState}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Management
                                                State</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                    variant={selectedDevice.managementState === 'Managed' ? 'default' : 'secondary'}>
                                                    {selectedDevice.managementState}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Device Registration
                                                State</label>
                                            <p className="text-sm">{selectedDevice.deviceRegistrationState}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Status</label>
                                            <p className="text-sm">{selectedDevice.status}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Is Encrypted</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Shield
                                                    className={`h-4 w-4 ${selectedDevice.isEncrypted ? 'text-green-600' : 'text-red-600'}`}/>
                                                <Badge variant={selectedDevice.isEncrypted ? 'default' : 'destructive'}>
                                                    {selectedDevice.isEncrypted ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Is Supervised</label>
                                            <Badge variant={selectedDevice.isSupervised ? 'default' : 'secondary'}>
                                                {selectedDevice.isSupervised ? 'Yes' : 'No'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Hardware Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Hardware Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Manufacturer</label>
                                            <p className="text-sm">{selectedDevice.manufacturer}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Model</label>
                                            <p className="text-sm">{selectedDevice.model}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Serial Number</label>
                                            <p className="text-sm font-mono">{selectedDevice.serialNumber}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Total Storage</label>
                                            <p className="text-sm">{formatBytes(selectedDevice.totalStorageSpaceInBytes)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Free Storage</label>
                                            <p className="text-sm">{formatBytes(selectedDevice.freeStorageSpaceInBytes)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Used Storage</label>
                                            <p className="text-sm">{formatBytes(selectedDevice.totalStorageSpaceInBytes - selectedDevice.freeStorageSpaceInBytes)}
                                                ({Math.round(((selectedDevice.totalStorageSpaceInBytes - selectedDevice.freeStorageSpaceInBytes) / selectedDevice.totalStorageSpaceInBytes) * 100)}%)</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Total Physical
                                                Memory</label>
                                            <p className="text-sm">{formatBytes(selectedDevice.totalPhysicalMemoryInBytes)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Ethernet MAC</label>
                                            <p className="text-sm font-mono">{selectedDevice.ethernetMacAddress || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">WiFi MAC</label>
                                            <p className="text-sm font-mono">{selectedDevice.wiFiMacAddress || 'N/A'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detailed Hardware Info */}
                            {selectedDevice.hardwareInfo && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Detailed Hardware Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Storage & Memory */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-3">Storage & Memory</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Total
                                                        Storage</label>
                                                    <p className="text-sm">{formatBytes(selectedDevice.hardwareInfo.totalStorageSpace)}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Free
                                                        Storage</label>
                                                    <p className="text-sm">{formatBytes(selectedDevice.hardwareInfo.freeStorageSpace)}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Hardware
                                                        Serial</label>
                                                    <p className="text-sm font-mono">{selectedDevice.hardwareInfo.serialNumber}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Product
                                                        Name</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.productName || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label
                                                        className="text-sm font-medium text-gray-500">Manufacturer</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.manufacturer}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Model</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.model}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Battery Information */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                <Battery className="h-4 w-4"/>
                                                Battery Information
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Battery
                                                        Level</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.batteryLevelPercentage ? `${selectedDevice.hardwareInfo.batteryLevelPercentage}%` : 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Battery
                                                        Health</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.batteryHealthPercentage ? `${selectedDevice.hardwareInfo.batteryHealthPercentage}%` : 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Charge
                                                        Cycles</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.batteryChargeCycles || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Battery
                                                        Serial</label>
                                                    <p className="text-sm font-mono">{selectedDevice.hardwareInfo.batterySerialNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Security & TPM */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                <Shield className="h-4 w-4"/>
                                                Security & TPM
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">TPM
                                                        Specification</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.tpmSpecificationVersion}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">TPM
                                                        Version</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.tpmVersion}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">TPM
                                                        Manufacturer</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.tpmManufacturer}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Is
                                                        Encrypted</label>
                                                    <Badge
                                                        variant={selectedDevice.hardwareInfo.isEncrypted ? 'default' : 'destructive'}>
                                                        {selectedDevice.hardwareInfo.isEncrypted ? 'Yes' : 'No'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Device Guard
                                                        VBS Hardware</label>
                                                    <p className="text-xs break-words">{selectedDevice.hardwareInfo.deviceGuardVirtualizationBasedSecurityHardwareRequirementState}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Device Guard
                                                        VBS State</label>
                                                    <p className="text-xs break-words">{selectedDevice.hardwareInfo.deviceGuardVirtualizationBasedSecurityState}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Credential
                                                        Guard State</label>
                                                    <p className="text-xs break-words">{selectedDevice.hardwareInfo.deviceGuardLocalSystemAuthorityCredentialGuardState}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Operating System Details */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-3">Operating System Details</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">OS
                                                        Language</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.operatingSystemLanguage}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">OS
                                                        Edition</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.operatingSystemEdition}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">OS
                                                        Build</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.osBuildNumber || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Product
                                                        Type</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.operatingSystemProductType}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Is
                                                        Supervised</label>
                                                    <Badge
                                                        variant={selectedDevice.hardwareInfo.isSupervised ? 'default' : 'secondary'}>
                                                        {selectedDevice.hardwareInfo.isSupervised ? 'Yes' : 'No'}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">BIOS
                                                        Version</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.systemManagementBIOSVersion}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Network Information */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                <Wifi className="h-4 w-4"/>
                                                Network Information
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">WiFi
                                                        MAC</label>
                                                    <p className="text-sm font-mono">{selectedDevice.hardwareInfo.wifiMac || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">IPv4
                                                        Address</label>
                                                    <p className="text-sm font-mono">{selectedDevice.hardwareInfo.ipAddressV4 || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Subnet
                                                        Address</label>
                                                    <p className="text-sm font-mono">{selectedDevice.hardwareInfo.subnetAddress || 'N/A'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-sm font-medium text-gray-500">FQDN</label>
                                                    <p className="text-sm break-all">{selectedDevice.hardwareInfo.deviceFullQualifiedDomainName || 'N/A'}</p>
                                                </div>
                                            </div>

                                            {selectedDevice.hardwareInfo.wiredIPv4Addresses?.length > 0 && (
                                                <div className="mt-3">
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Wired
                                                        IPv4 Addresses</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedDevice.hardwareInfo.wiredIPv4Addresses.map((ip, index) => (
                                                            <Badge key={index} variant="outline" className="font-mono">
                                                                {ip}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Mobile/Cellular Information */}
                                        {(selectedDevice.hardwareInfo.imei || selectedDevice.hardwareInfo.phoneNumber || selectedDevice.hardwareInfo.subscriberCarrier) && (
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                    <Smartphone className="h-4 w-4"/>
                                                    Mobile/Cellular Information
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                                    <div>
                                                        <label
                                                            className="text-sm font-medium text-gray-500">IMEI</label>
                                                        <p className="text-sm font-mono">{selectedDevice.hardwareInfo.imei || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label
                                                            className="text-sm font-medium text-gray-500">MEID</label>
                                                        <p className="text-sm font-mono">{selectedDevice.hardwareInfo.meid || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Phone
                                                            Number</label>
                                                        <p className="text-sm">{selectedDevice.hardwareInfo.phoneNumber || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label
                                                            className="text-sm font-medium text-gray-500">Carrier</label>
                                                        <p className="text-sm">{selectedDevice.hardwareInfo.subscriberCarrier || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Cellular
                                                            Technology</label>
                                                        <p className="text-sm">{selectedDevice.hardwareInfo.cellularTechnology || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">eSIM
                                                            Identifier</label>
                                                        <p className="text-sm font-mono">{selectedDevice.hardwareInfo.esimIdentifier || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* System Information */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-3">System Information</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Is Shared
                                                        Device</label>
                                                    <Badge
                                                        variant={selectedDevice.hardwareInfo.isSharedDevice ? 'default' : 'secondary'}>
                                                        {selectedDevice.hardwareInfo.isSharedDevice ? 'Yes' : 'No'}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Resident
                                                        Users</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.residentUsersCount || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Licensing Information */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-3">Licensing Information</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Licensing
                                                        Status</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.deviceLicensingStatus}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Last Error
                                                        Code</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.deviceLicensingLastErrorCode}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Error
                                                        Description</label>
                                                    <p className="text-sm">{selectedDevice.hardwareInfo.deviceLicensingLastErrorDescription || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Timeline & Processing */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Calendar className="h-5 w-5"/>
                                        Timeline & Processing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Enrolled</label>
                                            <p className="text-sm">{formatDate(selectedDevice.enrolledDateTime)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Last Sync</label>
                                            <div>
                                                <p className="text-sm">{formatDate(selectedDevice.lastSyncDateTime)}</p>
                                                <p className="text-xs text-gray-500">
                                                    {getDaysSinceLastSync(selectedDevice.lastSyncDateTime)} days ago
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Processed At</label>
                                            <p className="text-sm">{formatDate(selectedDevice.processedAt)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Batch Index</label>
                                            <p className="text-sm">{selectedDevice.batchIndex || 'N/A'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* END Device Details Dialog */}

            {/* Group Creation Dialog */}
            <Dialog open={groupCreationMode} onOpenChange={setGroupCreationMode}>
                <DialogContent className="!w-[90vw] !max-w-[90vw] h-[75vh] max-h-none overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5"/>
                            Create Entra ID Group
                        </DialogTitle>
                    </DialogHeader>

                    {/* Enhanced Progress Bar with Icons */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            {/* Step 1: Search */}
                            <div className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                                        addToGroupStep >= 1
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'border-gray-300 text-gray-400'
                                    }`}>
                                    {addToGroupStep > 1 ? (
                                        <CheckCircle className="w-4 h-4"/>
                                    ) : (
                                        <Search className="w-4 h-4"/>
                                    )}
                                </div>
                                <div className="ml-3 hidden sm:block">
                                    <p className={`text-sm font-medium ${
                                        addToGroupStep >= 1 ? 'text-blue-600' : 'text-gray-400'
                                    }`}>
                                        Search Group
                                    </p>
                                    <p className="text-xs text-gray-500">Find existing group</p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            <div className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                                addToGroupStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
                            }`}></div>

                            {/* Step 2: Add Members */}
                            <div className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                                        addToGroupStep >= 2
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'border-gray-300 text-gray-400'
                                    }`}>
                                    {addToGroupStep > 2 ? (
                                        <CheckCircle className="w-4 h-4"/>
                                    ) : (
                                        <Users className="w-4 h-4"/>
                                    )}
                                </div>
                                <div className="ml-3 hidden sm:block">
                                    <p className={`text-sm font-medium ${
                                        addToGroupStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                                    }`}>
                                        Add Members
                                    </p>
                                    <p className="text-xs text-gray-500">Review & confirm</p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            <div className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                                addToGroupStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'
                            }`}></div>

                            {/* Step 3: Results */}
                            <div className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                                        addToGroupStep >= 3
                                            ? 'bg-green-600 border-green-600 text-white'
                                            : 'border-gray-300 text-gray-400'
                                    }`}>
                                    {addToGroupStep >= 3 ? (
                                        <CheckCircle className="w-4 h-4"/>
                                    ) : (
                                        <AlertCircle className="w-4 h-4"/>
                                    )}
                                </div>
                                <div className="ml-3 hidden sm:block">
                                    <p className={`text-sm font-medium ${
                                        addToGroupStep >= 3 ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                        Results
                                    </p>
                                    <p className="text-xs text-gray-500">View outcome</p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Progress Indicator */}
                        <div className="sm:hidden mb-4">
                            <div className="flex justify-center">
            <span className="text-sm font-medium text-blue-600">
                Step {addToGroupStep} of 3: {
                addToGroupStep === 1 ? 'Search Group' :
                    addToGroupStep === 2 ? 'Add Members' : 'Results'
            }
            </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
                                    addToGroupStep === 3 ? 'bg-green-600' : 'bg-blue-600'
                                }`}
                                style={{width: `${(addToGroupStep / 3) * 100}%`}}
                            ></div>
                        </div>
                    </div>

                </DialogContent>
            </Dialog>

            {/* Create Group Dialog */}
            {/* Create Group Dialog */}
            <Dialog open={showAddToGroupDialog} onOpenChange={setShowAddToGroupDialog}>
                <DialogContent className="!w-[90vw] !max-w-[90vw] h-[75vh] max-h-none overflow-y-auto">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-yellow-400 dark:text-yellow-400"/>
                            Add Devices to Group
                        </DialogTitle>
                        <DialogDescription>
                            Search for an existing group and add the selected devices as members.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Enhanced Progress Steps - Reduced margins */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between">
                            {[
                                {
                                    step: 1,
                                    title: "Search Group",
                                    description: "Find existing group",
                                    icon: Search
                                },
                                {
                                    step: 2,
                                    title: "Add Members",
                                    description: "Review & confirm",
                                    icon: Users
                                },
                                {
                                    step: 3,
                                    title: "Results",
                                    description: "View outcome",
                                    icon: CheckCircle2
                                }
                            ].map(({step, title, description, icon: Icon}, index) => (
                                <div key={step} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                                                addToGroupStep >= step
                                                    ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500'
                                                    : 'border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500'
                                            }`}>
                                            {addToGroupStep > step ? (
                                                <CheckCircle className="h-4 w-4"/>
                                            ) : (
                                                <Icon className="h-4 w-4"/>
                                            )}
                                        </div>

                                        <div className="mt-1 text-center max-w-[120px]">
                                            <h4 className={`text-xs font-medium transition-colors ${
                                                addToGroupStep >= step
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-gray-400 dark:text-gray-500'
                                            }`}>{title}</h4>
                                            <p className={`text-xs mt-0.5 transition-colors ${
                                                addToGroupStep >= step
                                                    ? 'text-blue-500 dark:text-blue-400'
                                                    : 'text-gray-400 dark:text-gray-500'
                                            }`}>{description}</p>
                                        </div>
                                    </div>

                                    {index < 2 && (
                                        <div className="flex-1 h-px mx-3 mt-[-25px] relative">
                                            <div className={`absolute inset-0 transition-all duration-500 ${
                                                addToGroupStep > step
                                                    ? 'bg-blue-600 dark:bg-blue-500'
                                                    : 'bg-gray-300 dark:bg-gray-600'
                                            }`}></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Compact Progress Bar */}
                        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <div
                                className={`h-1 rounded-full transition-all duration-700 ease-out ${
                                    addToGroupStep === 3
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500'
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500'
                                }`}
                                style={{
                                    width: `${(addToGroupStep / 3) * 100}%`,
                                    boxShadow: addToGroupStep > 0 ? '0 0 8px rgba(59, 130, 246, 0.4)' : 'none'
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Step 1: Search for Group - Updated with group list */}
                    {addToGroupStep === 1 && (
                        <div className="space-y-6">
                            {/* Toggle between Search and Create */}
                            <div className="flex items-center justify-center gap-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <Button
                                    variant={!showCreateGroupOption ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowCreateGroupOption(false)}
                                    className="flex-1"
                                >
                                    <Search className="mr-2 h-4 w-4"/>
                                    Search Existing
                                </Button>
                                <Button
                                    variant={showCreateGroupOption ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowCreateGroupOption(true)}
                                    className="flex-1"
                                >
                                    <Plus className="mr-2 h-4 w-4"/>
                                    Create New
                                </Button>
                            </div>

                            {/* Search Existing Groups */}
                            {!showCreateGroupOption && (
                                <div className="max-w-2xl mx-auto space-y-4">
                                    <div>
                                        <Label htmlFor="groupSearch" className="text-sm font-medium">Search Groups</Label>
                                        <div className="mt-1">
                                            <Input
                                                id="groupSearch"
                                                type="text"
                                                value={groupSearchInput}
                                                onChange={(e) => handleGroupSearchChange(e.target.value)}
                                                placeholder="Search by group name, ID, or description..."
                                                className="w-full"
                                                disabled={loadingGroups}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Search through all available groups by name, ID, or description
                                        </p>
                                    </div>

                                    {/* Loading State */}
                                    {loadingGroups && (
                                        <div className="flex items-center justify-center py-8">
                                            <RefreshCw className="h-6 w-6 animate-spin text-yellow-400 dark:text-yellow-400 mr-3"/>
                                            <span className="text-sm text-muted-foreground">Loading groups...</span>
                                        </div>
                                    )}

                                    {/* Error State */}
                                    {groupsError && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                            <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0"/>
                                                <span className="text-sm">{groupsError}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Groups List */}
                                    {!loadingGroups && !groupsError && allGroups.length > 0 && (
                                        <div className="border dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                                            <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700">
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {filteredGroups.length} of {allGroups.length} groups
                                                </div>
                                            </div>

                                            {filteredGroups.length > 0 ? (
                                                <div className="max-h-64 overflow-y-auto border dark:border-gray-700 rounded-md divide-y dark:divide-gray-700">
                                                    {filteredGroups.map(group => {
                                                        const isDynamicGroup = group.membershipRule !== null && group.membershipRule !== undefined;

                                                        return (
                                                            <div
                                                                key={group.id}
                                                                className={`p-3 transition-colors ${
                                                                    isDynamicGroup
                                                                        ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
                                                                        : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                                                                }`}
                                                                onClick={() => {
                                                                    if (!isDynamicGroup) {
                                                                        selectGroup(group);
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className={`font-medium text-sm ${
                                                                                isDynamicGroup
                                                                                    ? 'text-gray-500 dark:text-gray-400'
                                                                                    : 'text-gray-900 dark:text-gray-100'
                                                                            }`}>
                                                                                {group.displayName}
                                                                            </h4>
                                                                            {isDynamicGroup && (
                                                                                <Badge variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                                                                                    Dynamic
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        {group.description && (
                                                                            <p className={`text-xs mt-1 ${
                                                                                isDynamicGroup
                                                                                    ? 'text-gray-400 dark:text-gray-500'
                                                                                    : 'text-gray-600 dark:text-gray-400'
                                                                            }`}>
                                                                                {group.description}
                                                                            </p>
                                                                        )}
                                                                        {isDynamicGroup && (
                                                                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 italic">
                                                                                Membership managed automatically - cannot add devices manually
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {!isDynamicGroup && (
                                                                            <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    <Search className="h-8 w-8 mx-auto mb-3 text-gray-400 dark:text-gray-500"/>
                                                    <p className="text-sm">
                                                        {groupSearchInput.trim()
                                                            ? `No groups found matching "${groupSearchInput}"`
                                                            : 'Start typing to search groups'
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* No Groups Available */}
                                    {!loadingGroups && !groupsError && allGroups.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <Users className="h-8 w-8 mx-auto mb-3 text-gray-400 dark:text-gray-500"/>
                                            <p className="text-sm">No groups available</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Create New Group */}
                            {showCreateGroupOption && (
                                <div className="max-w-2xl mx-auto space-y-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400"/>
                                            <h3 className="font-medium text-blue-900 dark:text-blue-100">Create New Group</h3>
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Create a new Entra ID group and add your selected devices as members.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="newGroupName" className="text-sm font-medium">
                                                Group Name <span className="text-red-500 dark:text-red-400">*</span>
                                            </Label>
                                            <div className="mt-1">
                                                <Input
                                                    id="newGroupName"
                                                    type="text"
                                                    value={newGroupName}
                                                    onChange={(e) => setNewGroupName(e.target.value)}
                                                    placeholder="Enter group name..."
                                                    className="w-full"
                                                    disabled={isCreatingGroup}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Choose a descriptive name for your new group
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="newGroupDescription" className="text-sm font-medium">
                                                Description (Optional)
                                            </Label>
                                            <div className="mt-1">
                                                <Input
                                                    id="newGroupDescription"
                                                    type="text"
                                                    value={newGroupDescription}
                                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                                    placeholder="Enter group description..."
                                                    className="w-full"
                                                    disabled={isCreatingGroup}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Optional description to help identify this group
                                            </p>
                                        </div>

                                        {/* Preview selected devices count */}
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-md">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-gray-600 dark:text-gray-400"/>
                                                <span className="font-medium">{selectedDevices.length} devices</span>
                                                <span className="text-gray-600 dark:text-gray-400">will be added to this group</span>
                                            </div>
                                        </div>

                                        {/* Create Group Error */}
                                        {createGroupError && (
                                            <div className={`p-3 border rounded-md ${
                                                createGroupError === "Group already exists"
                                                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                                                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                            }`}>
                                                <div className={`flex items-center gap-2 ${
                                                    createGroupError === "Group already exists"
                                                        ? "text-amber-700 dark:text-amber-300"
                                                        : "text-red-800 dark:text-red-300"
                                                }`}>
                                                    {createGroupError === "Group already exists" ? (
                                                        <AlertTriangle className="h-4 w-4 flex-shrink-0"/>
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 flex-shrink-0"/>
                                                    )}
                                                    <span className="text-sm">
                                            {createGroupError === "Group already exists"
                                                ? "Group already exists. Switching to search mode..."
                                                : createGroupError
                                            }
                                        </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Create Button */}
                                        <Button
                                            onClick={createNewGroup}
                                            disabled={!newGroupName.trim() || isCreatingGroup}
                                            className="w-full"
                                        >
                                            {isCreatingGroup ? (
                                                <>
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin"/>
                                                    Creating Group...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 h-4 w-4"/>
                                                    Create Group & Continue
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 justify-center pt-4">
                                <Button variant="outline" onClick={resetAddToGroupDialog}>
                                    Cancel
                                </Button>
                                {!loadingGroups && groupsError && (
                                    <Button onClick={fetchAllGroups} variant="outline">
                                        <RefreshCw className="mr-2 h-4 w-4"/>
                                        Retry
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Add Members */}
                    {addToGroupStep === 2 && searchedGroup && (
                        <div className="space-y-6">
                            {/* Group Info */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"/>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-blue-900 dark:text-blue-100">{searchedGroup.displayName}</h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                            {searchedGroup.description || 'No description available'}
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-mono">
                                            ID: {searchedGroup.id}
                                        </p>
                                        {searchedGroup.groupCount && (
                                            <div className="flex gap-4 mt-2 text-xs text-blue-600 dark:text-blue-400">
                                                <span>{searchedGroup.groupCount.userMembers} users</span>
                                                <span>{searchedGroup.groupCount.deviceMembers} devices</span>
                                                <span>{searchedGroup.groupCount.totalMembers} total members</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Selected Devices */}
                            <div>
                                <h4 className="font-medium mb-3">Selected Devices ({selectedDevices.length})</h4>
                                <div className="max-h-48 overflow-y-auto border dark:border-gray-700 rounded-md p-3 space-y-2 bg-gray-50 dark:bg-gray-800/50">
                                    {deviceStats
                                        .filter(device => selectedDevices.includes(device.id))
                                        .map(device => (
                                            <div key={device.id} className="flex items-center gap-2 text-sm">
                                                <Monitor className="h-4 w-4 text-gray-400 dark:text-gray-500"/>
                                                <span className="font-medium">{device.deviceName}</span>
                                                <span className="text-gray-500 dark:text-gray-400">({device.platform})</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {addMembersError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                    <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                                        <AlertCircle className="h-4 w-4"/>
                                        <span className="text-sm">{addMembersError}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setAddToGroupStep(1)}
                                    disabled={addMembersLoading}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4"/>
                                    Back
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={resetAddToGroupDialog}>
                                        Cancel
                                    </Button>
                                    <Button onClick={addMembersToGroup} disabled={addMembersLoading}>
                                        {addMembersLoading ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin"/>
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-2 h-4 w-4"/>
                                                Add to Group
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Results */}
                    {addToGroupStep === 3 && addMembersResult && (
                        <div className="space-y-6">
                            {/* Results Overview */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-lg">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400"/>
                                    Operation Complete
                                </h3>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md border dark:border-gray-700 text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {addMembersResult.data.totalRequested}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Requested</div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md border dark:border-gray-700 text-center">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {addMembersResult.data.totalSuccessful}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Successful</div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md border dark:border-gray-700 text-center">
                                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {addMembersResult.data.totalFailed}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
                                    </div>
                                </div>
                            </div>

                            {/* Success Details */}
                            {addMembersResult.data.successfulDeviceIds.length > 0 && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4"/>
                                        Successfully Added ({addMembersResult.data.successfulDeviceIds.length})
                                    </h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {addMembersResult.data.successfulDeviceIds.map(azureDeviceId => {
                                            const device = deviceStats.find(d => d.azureAdDeviceId === azureDeviceId);
                                            return (
                                                <div key={azureDeviceId} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0"/>
                                                    <span className="font-medium">
                                            {device ? device.deviceName : 'Unknown Device'}
                                        </span>
                                                    <span className="text-green-600 dark:text-green-400 font-mono text-xs">
                                            ({azureDeviceId})
                                        </span>
                                                    {device && (
                                                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                - {device.userDisplayName}
                                            </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Failure Details */}
                            {addMembersResult.data.failedDeviceIds.length > 0 && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <h4 className="font-medium text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                                        <XCircle className="h-4 w-4"/>
                                        Failed to Add ({addMembersResult.data.failedDeviceIds.length})
                                    </h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {addMembersResult.data.failedDeviceIds.map(azureDeviceId => {
                                            const device = deviceStats.find(d => d.azureAdDeviceId === azureDeviceId);
                                            const error = addMembersResult.data.errors[azureDeviceId];
                                            return (
                                                <div key={azureDeviceId} className="flex items-start gap-2 text-sm">
                                                    <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"/>
                                                    <div className="flex-1">
                                            <span className="font-medium">
                                                {device ? device.deviceName : 'Unknown Device'}
                                            </span>
                                                        <span className="text-red-600 dark:text-red-400 font-mono text-xs ml-2">
                                                ({azureDeviceId})
                                            </span>
                                                        {device && (
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                                                    - {device.userDisplayName}
                                                </span>
                                                        )}
                                                        {error && (
                                                            <div className="text-red-700 dark:text-red-300 text-xs mt-1">
                                                                Error: {error}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setAddToGroupStep(1);
                                        setAddMembersResult(null);
                                    }}
                                >
                                    Add More Devices
                                </Button>
                                <Button onClick={resetAddToGroupDialog}>
                                    Done
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConsentDialog
                isOpen={showConsentDialog}
                onClose={() => setShowConsentDialog(false)}
                consentUrl={consentUrl}
                onConsentComplete={handleConsentComplete}
                clearError={true}
            />
        </div>
    );
}
