'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Shield,
    ArrowRight,
    CheckCircle,
    Loader2,
    AlertCircle,
    Clock
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    MONITOR_CONFIGURATION_SNAPSHOTS,
    MONITOR_CONFIGURATION_SNAPSHOTS_JOBS,
    MONITOR_CONFIGURATION_ENDPOINT
} from '@/lib/constants';

interface MonitorTemplate {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    bgGradient: string;
    borderColor: string;
    resources: string[];
}

interface SnapshotJob {
    id: string;
    displayName: string;
    description: string;
    tenantId: string;
    status: 'notStarted' | 'inProgress' | 'succeeded' | 'partiallySuccessful' | 'failed';
    resources: string[];
    createdDateTime: string;
    completedDateTime: string;
    snapshotId: string | null;
    resourceLocation: string;
    error: unknown;
}

interface SnapshotResource {
    displayName: string;
    resourceType: string;
    properties: Record<string, unknown>;
}

interface Snapshot {
    id: string;
    displayName: string;
    description: string;
    parameters: unknown[];
    resources: SnapshotResource[];
}

interface ApiResponse<T> {
    status: number;
    message: string;
    details: unknown[];
    data: T;
}

const POLLING_INTERVAL = 10000; // 10 seconds

export default function AddMonitorPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();
    const router = useRouter();

    const [selectedTemplate, setSelectedTemplate] = useState<MonitorTemplate | null>(null);
    const [step, setStep] = useState<'select' | 'configure' | 'creating' | 'polling' | 'success' | 'error'>('select');

    const [monitorName, setMonitorName] = useState('');
    const [monitorDescription, setMonitorDescription] = useState('');

    const [snapshotJobId, setSnapshotJobId] = useState<string | null>(null);
    const [snapshotStatus, setSnapshotStatus] = useState<string>('');
    const [pollingAttempts, setPollingAttempts] = useState(0);
    const [countdown, setCountdown] = useState(10);
    const [createdMonitorId, setCreatedMonitorId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // State for existing monitors
    const [existingMonitors, setExistingMonitors] = useState<Array<{
        id: string;
        displayName: string;
        description: string;
    }>>([]);
    const [loadingMonitors, setLoadingMonitors] = useState(true);

    // Fetch existing monitors on mount - only if user is authenticated
    useEffect(() => {
        const fetchExistingMonitors = async () => {
            // Don't fetch if no accounts are available (not authenticated)
            if (accounts.length === 0) {
                setLoadingMonitors(false);
                return;
            }

            try {
                setLoadingMonitors(true);
                const response = await request<ApiResponse<Array<{ id: string; displayName: string; description: string }> | { id: string; displayName: string; description: string }>>(
                    MONITOR_CONFIGURATION_ENDPOINT,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                if (response?.data) {
                    // Handle both array response and single object response
                    const monitorsArray = Array.isArray(response.data) ? response.data : [response.data];

                    // Store monitors with just id, displayName, and description
                    // We'll check by displayName instead of resource types
                    setExistingMonitors(monitorsArray);
                }
            } catch (err) {
                console.error('Failed to fetch existing monitors:', err);
            } finally {
                setLoadingMonitors(false);
            }
        };

        fetchExistingMonitors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]); // Re-run when authentication state changes

    // Define templates first
    const monitorTemplates: MonitorTemplate[] = [
        {
            id: 'compliance-policies',
            title: 'Compliance Policies Monitor',
            description: 'Monitor all device compliance policies across Android, iOS, macOS, and Windows platforms.',
            icon: Shield,
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            resources: [
                'microsoft.intune.devicecompliancepolicyandroid',
                'microsoft.intune.devicecompliancepolicyandroiddeviceowner',
                'microsoft.intune.devicecompliancepolicyandroidworkprofile',
                'microsoft.intune.devicecompliancepolicyios',
                'microsoft.intune.devicecompliancepolicymacos',
                'microsoft.intune.devicecompliancepolicywindows10'
            ]
        },
        {
            id: 'role-assignments',
            title: 'Role Assignments Monitor',
            description: 'Monitor Intune role assignments and administrative permissions.',
            icon: Shield,
            gradient: 'from-lime-500 to-green-500',
            bgGradient: 'from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20',
            borderColor: 'border-lime-200 dark:border-lime-800',
            resources: [
                'microsoft.intune.roleassignment'
            ]
        },
        {
            id: 'assignment-filters',
            title: 'Assignment Filters Monitor',
            description: 'Monitor Intune assignment filters.',
            icon: Shield,
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
            borderColor: 'border-purple-200 dark:border-purple-800',
            resources: [
                'microsoft.intune.deviceandappmanagementassignmentfilter'
            ]
        },
        {
            id: 'enrollment-status-page',
            title: 'Enrollment Status Page Monitor',
            description: 'Monitor Windows 10 Enrollment Status Page configurations.',
            icon: Shield,
            gradient: 'from-blue-500 to-indigo-500',
            bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            resources: [
                'microsoft.intune.deviceenrollmentstatuspagewindows10'
            ]
        },
        {
            id: 'enrollment-platform-restrictions',
            title: 'Platform Restrictions Monitor',
            description: 'Monitor device enrollment platform restriction policies.',
            icon: Shield,
            gradient: 'from-cyan-500 to-teal-500',
            bgGradient: 'from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20',
            borderColor: 'border-cyan-200 dark:border-cyan-800',
            resources: [
                'microsoft.intune.deviceenrollmentplatformrestriction'
            ]
        }
    ];

    // Memoize monitor existence checks
    const monitorExistenceMap = useMemo(() => {
        const map = new Map<string, { exists: boolean; monitor?: { id: string; displayName: string; description: string } }>();

        monitorTemplates.forEach(template => {
            const existingMonitor = existingMonitors.find(monitor =>
                monitor.displayName === template.title &&
                monitor.description?.includes('(IntuneAssistant)')
            );

            map.set(template.id, {
                exists: !!existingMonitor,
                monitor: existingMonitor
            });
        });

        return map;
    }, [existingMonitors]);

    // Check if a monitor with matching displayName and IntuneAssistant description already exists
    const checkMonitorExists = (template: MonitorTemplate): boolean => {
        return monitorExistenceMap.get(template.id)?.exists ?? false;
    };

    // Find the existing monitor with matching displayName and IntuneAssistant description
    const findExistingMonitor = (template: MonitorTemplate) => {
        return monitorExistenceMap.get(template.id)?.monitor;
    };

    const createSnapshot = async (template: MonitorTemplate, name: string, description: string) => {
        try {
            setStep('creating');
            setError(null);

            const snapshotBody = {
                displayName: name,
                description: description,
                resources: template.resources
            };

            const response = await request<ApiResponse<SnapshotJob>>(
                MONITOR_CONFIGURATION_SNAPSHOTS,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(snapshotBody)
                }
            );

            if (response?.data?.id) {
                setSnapshotJobId(response.data.id);
                setSnapshotStatus(response.data.status);
                setStep('polling');
                startPolling(response.data.id);
            } else {
                throw new Error('Failed to create snapshot - no job ID returned');
            }
        } catch (err) {
            console.error('Error creating snapshot:', err);
            setError(err instanceof Error ? err.message : 'Failed to create snapshot');
            setStep('error');
        }
    };

    const startPolling = async (jobId: string) => {
        const maxAttempts = 60; // 10 minutes maximum (60 * 10 seconds)
        let attempts = 0;

        const poll = async () => {
            try {
                attempts++;
                setPollingAttempts(attempts);
                setCountdown(10); // Reset countdown

                const response = await request<ApiResponse<SnapshotJob>>(
                    `${MONITOR_CONFIGURATION_SNAPSHOTS_JOBS}/${jobId}`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                if (response?.data) {
                    setSnapshotStatus(response.data.status);

                    if ((response.data.status === 'succeeded' || response.data.status === 'partiallySuccessful') && response.data.snapshotId) {
                        // Snapshot completed successfully or partially successfully
                        await fetchSnapshotAndCreateMonitor(response.data.snapshotId, monitorName, monitorDescription);
                    } else if (response.data.status === 'failed') {
                        const errorMsg = response.data.error ? String(response.data.error) : 'Snapshot creation failed';
                        throw new Error(errorMsg);
                    } else if (attempts >= maxAttempts) {
                        throw new Error('Snapshot creation timed out');
                    } else {
                        // Start countdown and continue polling after 10 seconds
                        let secondsLeft = 10;
                        const countdownInterval = setInterval(() => {
                            secondsLeft--;
                            setCountdown(secondsLeft);
                            if (secondsLeft <= 0) {
                                clearInterval(countdownInterval);
                            }
                        }, 1000);

                        setTimeout(() => {
                            clearInterval(countdownInterval);
                            poll();
                        }, POLLING_INTERVAL);
                    }
                }
            } catch (err) {
                console.error('Polling error:', err);
                setError(err instanceof Error ? err.message : 'Polling failed');
                setStep('error');
            }
        };

        poll();
    };

    const fetchSnapshotAndCreateMonitor = async (snapshotId: string, name: string, description: string) => {
        try {
            // Fetch the complete snapshot data
            const snapshotResponse = await request<ApiResponse<Snapshot>>(
                `${MONITOR_CONFIGURATION_SNAPSHOTS}/${snapshotId}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (snapshotResponse?.data) {
                // Create monitor using the snapshot data
                await createMonitor(snapshotResponse.data, name, description);
            } else {
                throw new Error('Failed to fetch snapshot data');
            }
        } catch (err) {
            console.error('Error fetching snapshot:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch snapshot');
            setStep('error');
        }
    };

    const createMonitor = async (snapshot: Snapshot, name: string, description: string) => {
        try {
            // Truncate resource displayNames to meet API requirements (max 128 chars)
            const processedResources = snapshot.resources.map(resource => ({
                ...resource,
                displayName: resource.displayName.length > 128
                    ? resource.displayName.substring(0, 128)
                    : resource.displayName
            }));

            // Prefix description with (IntuneAssistant) to mark as created by this app
            const prefixedDescription = `(IntuneAssistant) ${description}`;

            const monitorBody = {
                displayName: name,
                description: prefixedDescription,
                baseline: {
                    displayName: snapshot.displayName,
                    description: snapshot.description,
                    resources: processedResources
                }
            };

            console.log('Creating monitor with body:', JSON.stringify(monitorBody, null, 2));

            const response = await request<ApiResponse<{
                id: string;
                displayName: string;
                description: string;
                [key: string]: unknown;
            }>>(
                MONITOR_CONFIGURATION_ENDPOINT,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(monitorBody)
                }
            );

            console.log('Full API Response:', response);
            console.log('Response status:', response?.status);
            console.log('Response message:', response?.message);
            console.log('Response data:', response?.data);

            // Check if we have a response with data
            if (response?.data) {
                // The data object should contain the id property
                const responseData = response.data as Record<string, unknown>;
                const monitorId = typeof responseData.id === 'string' ? responseData.id : null;

                if (monitorId) {
                    console.log('Monitor created successfully with ID:', monitorId);
                    setCreatedMonitorId(monitorId);
                    setStep('success');
                } else {
                    console.error('No ID found in response.data. Full data object:', responseData);
                    console.error('Available keys in data:', Object.keys(responseData));
                    throw new Error(`Failed to create monitor - no ID returned. Response message: ${response.message || 'Unknown'}`);
                }
            } else {
                console.error('No data property in response. Full response:', response);
                throw new Error('Failed to create monitor - no data in response');
            }
        } catch (err) {
            console.error('Error creating monitor:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create monitor';
            setError(errorMessage);
            setStep('error');
        }
    };

    const sanitizeDisplayName = (name: string): string => {
        // Remove special characters, keep only alphanumeric and spaces
        const sanitized = name.replace(/[^a-zA-Z0-9 ]/g, '');
        // Trim and limit to 32 characters
        return sanitized.trim().substring(0, 32);
    };

    const validateDisplayName = (name: string): string | null => {
        const sanitized = sanitizeDisplayName(name);
        if (sanitized.length < 8) {
            return 'Display name must be at least 8 characters long';
        }
        if (sanitized.length > 32) {
            return 'Display name must be at most 32 characters long';
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(sanitized)) {
            return 'Display name can only contain letters, numbers, and spaces';
        }
        return null;
    };

    const handleTemplateSelect = (template: MonitorTemplate) => {
        setSelectedTemplate(template);
        // Create a valid display name (no special characters, 8-32 chars)
        const baseName = template.title.replace(/[^a-zA-Z0-9 ]/g, '');
        // Use just the base name without date to keep it clean
        // User can modify it in the configure step if needed
        const displayName = baseName.substring(0, 32);
        setMonitorName(displayName);
        setMonitorDescription(template.description);
        setStep('configure');
    };

    const handleCreateMonitor = () => {
        if (!selectedTemplate || !monitorName) return;

        // Validate display name
        const validationError = validateDisplayName(monitorName);
        if (validationError) {
            setError(validationError);
            setStep('error');
            return;
        }

        // Sanitize the display name to ensure it meets API requirements
        const sanitizedName = sanitizeDisplayName(monitorName);
        createSnapshot(selectedTemplate, sanitizedName, monitorDescription);
    };

    const handleViewMonitor = () => {
        if (createdMonitorId) {
            router.push(`/monitor/details/${createdMonitorId}`);
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Add Configuration Monitor
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Create a new monitor to track configuration drift in your Intune environment
                </p>
            </div>

            {/* Step 1: Select Template */}
            {step === 'select' && (
                <>
                    {/* Show message if not authenticated */}
                    {accounts.length === 0 && !loadingMonitors && (
                        <Card className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-800">
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        Authentication Required
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Please sign in to create monitors
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {loadingMonitors && accounts.length > 0 && (
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        Loading Available Monitors
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Checking existing monitors...
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!loadingMonitors && accounts.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {monitorTemplates.map((template) => {
                                const Icon = template.icon;
                                const alreadyExists = checkMonitorExists(template);
                                const existingMonitor = findExistingMonitor(template);

                                return (
                                    <Card
                                        key={template.id}
                                        className={`border-l-4 ${template.borderColor} bg-white dark:bg-gray-800 ${
                                            alreadyExists 
                                                ? 'opacity-75 cursor-not-allowed' 
                                                : 'cursor-pointer hover:shadow-lg'
                                        }`}
                                        onClick={() => !alreadyExists && handleTemplateSelect(template)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${template.gradient} text-white shadow-lg`}>
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <Badge variant="outline" className="font-medium">
                                                        TEMPLATE
                                                    </Badge>
                                                </div>
                                                {alreadyExists && (
                                                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
                                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                                            EXISTS
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <CardTitle className="text-xl">{template.title}</CardTitle>
                                            <CardDescription className="text-base">
                                                {template.description}
                                            </CardDescription>
                                        </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 mb-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Monitors {template.resources.length} resource types:
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {template.resources.slice(0, 3).map((resource, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                    {resource.split('.').pop()?.replace('devicecompliancepolicy', '')}
                                                </Badge>
                                            ))}
                                            {template.resources.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{template.resources.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {alreadyExists && existingMonitor ? (
                                        <div className="space-y-3">
                                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                                <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                                                    <strong>Existing Monitor:</strong>
                                                </p>
                                                <p className="text-sm text-green-600 dark:text-green-400">
                                                    {existingMonitor.displayName}
                                                </p>
                                            </div>
                                            <Button
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/monitor/details/${existingMonitor.id}`);
                                                }}
                                            >
                                                View Existing Monitor
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button className={`w-full bg-gradient-to-r ${template.gradient} text-white`}>
                                            Select Template
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                        </div>
                    )}
                </>
            )}

            {/* Step 2: Configure Monitor */}
            {step === 'configure' && selectedTemplate && (
                <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle>Configure {selectedTemplate.title}</CardTitle>
                        <CardDescription>
                            Provide details for your new configuration monitor
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="monitorName">Monitor Name *</Label>
                            <Input
                                id="monitorName"
                                value={monitorName}
                                onChange={(e) => setMonitorName(e.target.value)}
                                placeholder="Enter monitor name (8-32 characters)"
                                maxLength={32}
                            />
                            <div className="flex items-center justify-between text-xs">
                                <span className={`${
                                    sanitizeDisplayName(monitorName).length < 8 
                                        ? 'text-red-500' 
                                        : sanitizeDisplayName(monitorName).length > 32 
                                        ? 'text-red-500' 
                                        : 'text-green-500'
                                }`}>
                                    {sanitizeDisplayName(monitorName).length}/32 characters
                                    {sanitizeDisplayName(monitorName).length < 8 && ' (minimum 8)'}
                                </span>
                                <span className="text-gray-500">
                                    Only letters, numbers, and spaces
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="monitorDescription">Description</Label>
                            <Textarea
                                id="monitorDescription"
                                value={monitorDescription}
                                onChange={(e) => setMonitorDescription(e.target.value)}
                                placeholder="Enter description"
                                rows={4}
                            />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                Resources to Monitor
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                {selectedTemplate.resources.map((resource, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        {resource}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStep('select');
                                    setSelectedTemplate(null);
                                }}
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleCreateMonitor}
                                disabled={!monitorName.trim() || validateDisplayName(monitorName) !== null}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                            >
                                Create Monitor
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Creating Snapshot */}
            {step === 'creating' && (
                <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <Loader2 className="h-16 w-16 mx-auto text-blue-500 animate-spin mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Creating Snapshot
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Initializing configuration snapshot...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Polling for Completion */}
            {step === 'polling' && (
                <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center py-12 space-y-6">
                            <Loader2 className="h-16 w-16 mx-auto text-yellow-500 animate-spin" />
                            <div>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    Processing Snapshot
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Status: <Badge variant="outline">{snapshotStatus}</Badge>
                                </p>
                                <div className="flex flex-col items-center justify-center gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <Clock className="h-4 w-4" />
                                        <span>Check {pollingAttempts} of 60</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-yellow-500">
                                                    {countdown}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-300">
                                            seconds until next check
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="max-w-md mx-auto">
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-1000"
                                        style={{ width: `${(pollingAttempts / 60) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Maximum wait time: 10 minutes
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 5: Success */}
            {step === 'success' && (
                <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Monitor Created Successfully!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Your configuration monitor has been created and is now active.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/monitor/global-overview')}
                                >
                                    View All Monitors
                                </Button>
                                <Button
                                    onClick={handleViewMonitor}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                >
                                    View Monitor Details
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 6: Error */}
            {step === 'error' && (
                <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Error Creating Monitor
                            </h3>
                            <p className="text-red-600 dark:text-red-400 mb-6">
                                {error}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setStep('select');
                                        setError(null);
                                        setSelectedTemplate(null);
                                    }}
                                >
                                    Start Over
                                </Button>
                                <Button
                                    onClick={() => setStep('configure')}
                                    disabled={!selectedTemplate}
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
