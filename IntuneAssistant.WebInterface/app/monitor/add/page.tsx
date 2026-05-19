'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Shield, ArrowRight, CheckCircle, Loader2, AlertCircle, Clock,
    LaptopIcon, Search, X, ChevronDown, ChevronRight, Sparkles,
    Wand2, BookTemplate, Filter, Crown, Layers, ChevronLeft,
    Activity, Camera, FileText, Package,
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { useCustomer } from '@/contexts/CustomerContext';
import {
    MONITOR_CONFIGURATION_SNAPSHOTS,
    MONITOR_CONFIGURATION_ENDPOINT,
    MONITOR_SNAPSHOTS_JOB_BY_ID,
    MONITOR_SNAPSHOT_BY_ID,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type TemplateCategory = 'all' | 'intune' | 'entra' | 'exchange' | 'custom';
type WizardStep = 'gallery' | 'configure' | 'creating' | 'polling' | 'review' | 'submitting' | 'success' | 'error';

interface MonitorTemplate {
    id: string;
    title: string;
    description: string;
    category: Exclude<TemplateCategory, 'all' | 'custom'>;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    accentColor: string;
    resources: string[];
    comingSoon?: boolean;
}

interface SnapshotJob {
    id: string;
    displayName: string;
    description: string;
    tenantId: string;
    status: 'notStarted' | 'inProgress' | 'succeeded' | 'partiallySuccessful' | 'failed';
    resources: string[];
    createdDateTime: string;
    completedDateTime: string | null;
    expirationDateTime: string | null;
    snapshotId: string | null;
    resourceLocation: string | null;
    createdBy: { user: { id: string; displayName: string } } | null;
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

interface ApiEnvelope<T> { status: number; message: string; data: T; }

// ─── Resource categories for custom monitors ──────────────────────────────────

const CUSTOM_RESOURCE_CATEGORIES = [
    {
        name: 'compliance', displayName: 'Compliance Policies',
        resources: [
            'microsoft.intune.devicecompliancepolicyandroid',
            'microsoft.intune.devicecompliancepolicyandroiddeviceowner',
            'microsoft.intune.devicecompliancepolicyandroidworkprofile',
            'microsoft.intune.devicecompliancepolicyios',
            'microsoft.intune.devicecompliancepolicymacos',
            'microsoft.intune.devicecompliancepolicywindows10',
        ],
    },
    {
        name: 'configuration', displayName: 'Configuration Policies',
        resources: [
            'microsoft.intune.deviceconfigurationcustompolicywindows10',
            'microsoft.intune.deviceconfigurationendpointprotectionpolicywindows10',
            'microsoft.intune.deviceconfigurationdeliveryoptimizationpolicywindows10',
            'microsoft.intune.deviceconfigurationadministrativetemplatepolicywindows10',
            'microsoft.intune.deviceconfigurationpolicywindows10',
            'microsoft.intune.deviceconfigurationcustompolicyios',
            'microsoft.intune.deviceconfigurationcustompolicymacos',
            'microsoft.intune.deviceconfigurationcustompolicyandroid',
        ],
    },
    {
        name: 'settings', displayName: 'Settings Catalog',
        resources: ['microsoft.intune.devicemanagementconfigurationpolicy'],
    },
    {
        name: 'enrollment', displayName: 'Enrollment',
        resources: [
            'microsoft.intune.deviceenrollmentstatuspagewindows10',
            'microsoft.intune.deviceenrollmentplatformrestriction',
        ],
    },
    {
        name: 'security', displayName: 'Security & Roles',
        resources: [
            'microsoft.intune.roleassignment',
            'microsoft.intune.deviceandappmanagementassignmentfilter',
        ],
    },
    {
        name: 'scripts', displayName: 'Scripts & Remediations',
        resources: [
            'microsoft.intune.devicemanagementscript',
            'microsoft.intune.devicehealthscript',
        ],
    },
];

function fmtResource(r: string) {
    return r
        .replace(/^microsoft\.(intune|exchange|entra)\./i, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace(/\s+/g, ' ')
        .trim();
}

function fmtPropValue(v: unknown): string {
    if (v === null || v === undefined) return '—';
    if (Array.isArray(v)) return v.join(', ') || '(empty)';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
}

// ─── Template Definitions ─────────────────────────────────────────────────────

const MONITOR_TEMPLATES: MonitorTemplate[] = [
    {
        id: 'compliance-policies', title: 'Compliance Policies',
        description: 'Monitor device compliance policies across Android, iOS, macOS, and Windows.',
        category: 'intune', icon: Shield, gradient: 'from-blue-500 to-cyan-500', accentColor: 'blue',
        resources: [
            'microsoft.intune.devicecompliancepolicyandroid',
            'microsoft.intune.devicecompliancepolicyandroiddeviceowner',
            'microsoft.intune.devicecompliancepolicyandroidworkprofile',
            'microsoft.intune.devicecompliancepolicyios',
            'microsoft.intune.devicecompliancepolicymacos',
            'microsoft.intune.devicecompliancepolicywindows10',
        ],
    },
    {
        id: 'windows10-config-policies', title: 'Windows Configuration Policies',
        description: 'Monitor all device configuration policies for Windows platforms.',
        category: 'intune', icon: LaptopIcon, gradient: 'from-amber-500 to-yellow-500', accentColor: 'amber',
        resources: [
            'microsoft.intune.deviceconfigurationadministrativetemplatepolicywindows10',
            'microsoft.intune.deviceconfigurationcustompolicywindows10',
            'microsoft.intune.deviceconfigurationdefenderforendpointonboardingpolicywindows10',
            'microsoft.intune.deviceconfigurationdeliveryoptimizationpolicywindows10',
            'microsoft.intune.deviceconfigurationdomainjoinpolicywindows10',
            'microsoft.intune.deviceconfigurationemailprofilepolicywindows10',
            'microsoft.intune.deviceconfigurationendpointprotectionpolicywindows10',
            'microsoft.intune.deviceconfigurationfirmwareinterfacepolicywindows10',
            'microsoft.intune.deviceconfigurationkioskpolicywindows10',
            'microsoft.intune.deviceconfigurationpolicywindows10',
            'microsoft.intune.deviceconfigurationvpnpolicywindows10',
        ],
    },
    {
        id: 'role-assignments', title: 'Role Assignments',
        description: 'Monitor Intune role assignments and administrative permissions.',
        category: 'intune', icon: Shield, gradient: 'from-lime-500 to-green-500', accentColor: 'green',
        resources: ['microsoft.intune.roleassignment'],
    },
    {
        id: 'assignment-filters', title: 'Assignment Filters',
        description: 'Monitor Intune assignment filters for policy targeting.',
        category: 'intune', icon: Filter, gradient: 'from-purple-500 to-pink-500', accentColor: 'purple',
        resources: ['microsoft.intune.deviceandappmanagementassignmentfilter'],
    },
    {
        id: 'enrollment-status-page', title: 'Enrollment Status Page',
        description: 'Monitor Windows 10 Enrollment Status Page configurations.',
        category: 'intune', icon: Activity, gradient: 'from-blue-500 to-indigo-500', accentColor: 'indigo',
        resources: ['microsoft.intune.deviceenrollmentstatuspagewindows10'],
    },
    {
        id: 'enrollment-platform-restrictions', title: 'Platform Restrictions',
        description: 'Monitor device enrollment platform restriction policies.',
        category: 'intune', icon: Layers, gradient: 'from-cyan-500 to-teal-500', accentColor: 'teal',
        resources: ['microsoft.intune.deviceenrollmentplatformrestriction'],
    },
    {
        id: 'entra-conditional-access', title: 'Conditional Access Policies',
        description: 'Monitor Entra ID conditional access policies for drift.',
        category: 'entra', icon: Shield, gradient: 'from-violet-500 to-purple-500', accentColor: 'violet',
        resources: [], comingSoon: true,
    },
    {
        id: 'entra-groups', title: 'Group Memberships',
        description: 'Track changes to Entra ID security and M365 group memberships.',
        category: 'entra', icon: Activity, gradient: 'from-fuchsia-500 to-pink-500', accentColor: 'fuchsia',
        resources: [], comingSoon: true,
    },
    {
        id: 'exchange-transport-rules', title: 'Transport Rules',
        description: 'Monitor Exchange Online transport/mail flow rules for changes.',
        category: 'exchange', icon: Shield, gradient: 'from-orange-500 to-red-500', accentColor: 'orange',
        resources: [], comingSoon: true,
    },
];

const CATEGORY_META: Record<TemplateCategory, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    all:      { label: 'All Templates', icon: Layers },
    intune:   { label: 'Intune',        icon: LaptopIcon },
    entra:    { label: 'Entra ID',      icon: Shield },
    exchange: { label: 'Exchange',      icon: Activity },
    custom:   { label: 'Custom',        icon: Wand2 },
};

const POLLING_INTERVAL = 10000;

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
    { label: 'Template' },
    { label: 'Configure' },
    { label: 'Snapshot' },
    { label: 'Review' },
    { label: 'Done' },
];

function stepIndex(s: WizardStep): number {
    switch (s) {
        case 'gallery':    return 0;
        case 'configure':  return 1;
        case 'creating':
        case 'polling':    return 2;
        case 'review':
        case 'submitting': return 3;
        case 'success':    return 4;
        case 'error':      return 2;
        default:           return 0;
    }
}

function StepIndicator({ step }: { step: WizardStep }) {
    const cur = stepIndex(step);
    return (
        <div className="flex items-center gap-1">
            {STEPS.map((s, idx) => {
                const done = idx < cur;
                const current = idx === cur;
                return (
                    <React.Fragment key={idx}>
                        <div className={cn(
                            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all whitespace-nowrap',
                            done    && 'bg-primary/10 text-primary',
                            current && 'bg-primary text-primary-foreground shadow-sm',
                            !done && !current && 'text-muted-foreground',
                        )}>
                            {done
                                ? <CheckCircle className="h-3 w-3 shrink-0" />
                                : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px] shrink-0">{idx + 1}</span>
                            }
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className={cn('flex-1 h-px min-w-4 max-w-10', done ? 'bg-primary/40' : 'bg-border')} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Resource property table ──────────────────────────────────────────────────

function PropertyTable({ properties }: { properties: Record<string, unknown> }) {
    const entries = Object.entries(properties);
    if (entries.length === 0) return <p className="text-xs text-muted-foreground italic">No properties</p>;
    return (
        <table className="w-full text-xs border-collapse">
            <tbody>
                {entries.map(([key, val]) => (
                    <tr key={key} className="border-b last:border-0 border-border/50">
                        <td className="py-1 pr-3 font-medium text-muted-foreground w-2/5 align-top">{key}</td>
                        <td className="py-1 font-mono break-all text-foreground/80">{fmtPropValue(val)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// ─── Resource group row ───────────────────────────────────────────────────────

function ResourceGroup({ resourceType, items }: { resourceType: string; items: SnapshotResource[] }) {
    const [open, setOpen] = useState(false);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Group header */}
            <button
                className="w-full flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                onClick={() => setOpen(o => !o)}
            >
                <div className="p-1.5 rounded bg-primary/10">
                    <Package className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{fmtResource(resourceType)}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{resourceType}</p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">{items.length} item{items.length !== 1 ? 's' : ''}</Badge>
                {open
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                }
            </button>

            {/* Resource rows */}
            {open && (
                <div className="divide-y divide-border/50">
                    {items.map((item, idx) => (
                        <div key={idx} className="bg-card">
                            <button
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors text-left"
                                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                            >
                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="flex-1 text-sm truncate">{item.displayName}</span>
                                <span className="text-[10px] text-muted-foreground shrink-0 mr-1">
                                    {Object.keys(item.properties).length} props
                                </span>
                                {expandedIdx === idx
                                    ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                }
                            </button>

                            {/* Properties panel */}
                            {expandedIdx === idx && (
                                <div className="px-4 pb-3 pt-1 bg-muted/10 border-t border-border/40">
                                    <PropertyTable properties={item.properties} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AddMonitorPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();
    const router = useRouter();
    const { customerData } = useCustomer();

    const hasEnterpriseLicense = useMemo(() =>
        customerData?.licenses?.some(l => l.licenseType === 2 && l.isActive) ?? false,
    [customerData]);

    // ── Wizard state ─────────────────────────────────────────────────────────
    const [step, setStep] = useState<WizardStep>('gallery');
    const [selectedTemplate, setSelectedTemplate] = useState<MonitorTemplate | null>(null);
    const [isCustom, setIsCustom] = useState(false);

    // ── Gallery filters ───────────────────────────────────────────────────────
    const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // ── Configure form ────────────────────────────────────────────────────────
    const [monitorName, setMonitorName] = useState('');
    const [monitorDescription, setMonitorDescription] = useState('');

    // ── Custom resource picker ────────────────────────────────────────────────
    const [customResources, setCustomResources] = useState<string[]>([]);
    const [resourceSearch, setResourceSearch] = useState('');
    const [expandedCats, setExpandedCats] = useState<string[]>(['compliance', 'configuration']);

    // ── Creation / polling ────────────────────────────────────────────────────
    const [snapshotStatus, setSnapshotStatus] = useState('');
    const [pollingAttempts, setPollingAttempts] = useState(0);
    const [countdown, setCountdown] = useState(10);

    // ── Review step ───────────────────────────────────────────────────────────
    const [currentSnapshot, setCurrentSnapshot] = useState<Snapshot | null>(null);
    const [currentJob, setCurrentJob] = useState<SnapshotJob | null>(null);
    const [reviewSearch, setReviewSearch] = useState('');

    // ── Result ────────────────────────────────────────────────────────────────
    const [createdMonitorId, setCreatedMonitorId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ── Existing monitors ─────────────────────────────────────────────────────
    const [existingMonitors, setExistingMonitors] = useState<Array<{ id: string; displayName: string; description: string }>>([]);
    const [loadingMonitors, setLoadingMonitors] = useState(true);

    useEffect(() => {
        if (accounts.length === 0) { setLoadingMonitors(false); return; }
        (async () => {
            try {
                const r = await request<ApiEnvelope<Array<{ id: string; displayName: string; description: string }>>>(
                    MONITOR_CONFIGURATION_ENDPOINT, { method: 'GET' }
                );
                if (r?.data?.data) {
                    const d = r.data.data;
                    setExistingMonitors(Array.isArray(d) ? d : [d]);
                }
            } finally { setLoadingMonitors(false); }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]);

    const monitorExistsForTemplate = useCallback((id: string) =>
        existingMonitors.find(m =>
            m.displayName === MONITOR_TEMPLATES.find(t => t.id === id)?.title &&
            m.description?.includes('(IntuneAssistant)')
        ),
    [existingMonitors]);

    // ── Gallery filtering ─────────────────────────────────────────────────────

    const filteredTemplates = useMemo(() => {
        let list = MONITOR_TEMPLATES;
        if (activeCategory !== 'all' && activeCategory !== 'custom')
            list = list.filter(t => t.category === activeCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.resources.some(r => r.toLowerCase().includes(q))
            );
        }
        return list;
    }, [activeCategory, searchQuery]);

    // ── Custom resource picker helpers ────────────────────────────────────────

    const filteredResourceCats = useMemo(() => {
        if (!resourceSearch) return CUSTOM_RESOURCE_CATEGORIES;
        const q = resourceSearch.toLowerCase();
        return CUSTOM_RESOURCE_CATEGORIES.map(c => ({
            ...c,
            resources: c.resources.filter(r => r.toLowerCase().includes(q) || fmtResource(r).toLowerCase().includes(q)),
        })).filter(c => c.resources.length > 0);
    }, [resourceSearch]);

    const toggleResource = (r: string) =>
        setCustomResources(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

    const toggleCatAll = (resources: string[]) => {
        const all = resources.every(r => customResources.includes(r));
        setCustomResources(prev => all
            ? prev.filter(r => !resources.includes(r))
            : [...new Set([...prev, ...resources])]
        );
    };

    // ── Name helpers ──────────────────────────────────────────────────────────

    const sanitizeName = (n: string) => n.replace(/[^a-zA-Z0-9 ]/g, '').trim().substring(0, 32);
    const validateName = (n: string): string | null => {
        const s = sanitizeName(n);
        if (s.length < 8) return 'Name must be at least 8 characters';
        return null;
    };

    // ── Review: group snapshot resources by resourceType ──────────────────────

    const groupedResources = useMemo(() => {
        if (!currentSnapshot) return {};
        const q = reviewSearch.toLowerCase();
        const filtered = q
            ? currentSnapshot.resources.filter(r =>
                r.displayName.toLowerCase().includes(q) ||
                r.resourceType.toLowerCase().includes(q) ||
                fmtResource(r.resourceType).toLowerCase().includes(q)
            )
            : currentSnapshot.resources;

        return filtered.reduce<Record<string, SnapshotResource[]>>((acc, res) => {
            const key = res.resourceType;
            if (!acc[key]) acc[key] = [];
            acc[key].push(res);
            return acc;
        }, {});
    }, [currentSnapshot, reviewSearch]);

    // ── Wizard handlers ───────────────────────────────────────────────────────

    const handleSelectTemplate = (template: MonitorTemplate) => {
        setSelectedTemplate(template);
        setIsCustom(false);
        const base = sanitizeName(template.title);
        setMonitorName(base.length >= 8 ? base : `${base} Monitor`.substring(0, 32));
        setMonitorDescription(template.description);
        setStep('configure');
    };

    const handleStartCustom = () => {
        setSelectedTemplate(null);
        setIsCustom(true);
        setCustomResources([]);
        setMonitorName('');
        setMonitorDescription('');
        setStep('configure');
    };

    const handleCreateSnapshot = async () => {
        const resources = isCustom ? customResources : (selectedTemplate?.resources ?? []);
        if (!monitorName || !resources.length) return;
        const validErr = validateName(monitorName);
        if (validErr) { setError(validErr); setStep('error'); return; }

        const safeName = sanitizeName(monitorName);
        setStep('creating');
        setError(null);

        try {
            const resp = await request<ApiEnvelope<SnapshotJob>>(
                MONITOR_CONFIGURATION_SNAPSHOTS,
                { method: 'POST', body: JSON.stringify({ displayName: safeName, description: monitorDescription, resources }) }
            );
            const job = resp?.data?.data;
            if (!job?.id) throw new Error('No snapshot job ID returned');
            setCurrentJob(job);
            setSnapshotStatus(job.status);
            setStep('polling');
            startPolling(job.id);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create snapshot');
            setStep('error');
        }
    };

    const startPolling = (jobId: string) => {
        const maxAttempts = 60;
        let attempts = 0;

        const poll = async () => {
            attempts++;
            setPollingAttempts(attempts);
            setCountdown(10);

            try {
                const r = await request<ApiEnvelope<SnapshotJob>>(MONITOR_SNAPSHOTS_JOB_BY_ID(jobId), { method: 'GET' });
                const job = r?.data?.data;
                if (!job) throw new Error('No job data returned');

                setSnapshotStatus(job.status);
                setCurrentJob(job);

                if ((job.status === 'succeeded' || job.status === 'partiallySuccessful') && job.snapshotId) {
                    // Fetch the snapshot from /monitor/snapshots/{snapshotId} and go to review
                    await fetchSnapshotForReview(job.snapshotId);
                } else if (job.status === 'failed') {
                    throw new Error(job.error ? String(job.error) : 'Snapshot creation failed');
                } else if (attempts >= maxAttempts) {
                    throw new Error('Snapshot creation timed out after 10 minutes');
                } else {
                    // Count down and re-poll
                    let s = 10;
                    const iv = setInterval(() => { s--; setCountdown(s); if (s <= 0) clearInterval(iv); }, 1000);
                    setTimeout(() => { clearInterval(iv); poll(); }, POLLING_INTERVAL);
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Polling failed');
                setStep('error');
            }
        };

        poll();
    };

    /**
     * Fetch the completed snapshot from /monitor/snapshots/{snapshotId} and navigate
     * to the review step so the user can see exactly what was captured.
     */
    const fetchSnapshotForReview = async (snapshotId: string) => {
        try {
            const r = await request<ApiEnvelope<Snapshot>>(
                MONITOR_SNAPSHOT_BY_ID(snapshotId),
                { method: 'GET' }
            );
            const snap = r?.data?.data;
            if (!snap) throw new Error('Could not load snapshot data');
            setCurrentSnapshot(snap);
            setStep('review');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load snapshot');
            setStep('error');
        }
    };

    /**
     * User has reviewed the snapshot resources and clicked "Create Monitor".
     * POST to /monitor/configuration with the snapshot as baseline.
     */
    const handleConfirmCreateMonitor = async () => {
        if (!currentSnapshot) return;
        setStep('submitting');

        try {
            const processed = currentSnapshot.resources.map(res => ({
                ...res,
                displayName: res.displayName.substring(0, 128),
            }));

            const monitorResp = await request<ApiEnvelope<{ id: string }>>(
                MONITOR_CONFIGURATION_ENDPOINT,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        displayName: sanitizeName(monitorName),
                        description: `(IntuneAssistant) ${monitorDescription}`,
                        baseline: {
                            displayName: currentSnapshot.displayName,
                            description: currentSnapshot.description,
                            resources: processed,
                        },
                    }),
                }
            );

            const mid = monitorResp?.data?.data?.id;
            if (!mid) throw new Error('No monitor ID returned');
            setCreatedMonitorId(mid);
            setStep('success');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create monitor');
            setStep('error');
        }
    };

    const resetToGallery = () => {
        setStep('gallery');
        setSelectedTemplate(null);
        setIsCustom(false);
        setError(null);
        setPollingAttempts(0);
        setCustomResources([]);
        setCurrentSnapshot(null);
        setCurrentJob(null);
        setReviewSearch('');
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Camera className="h-6 w-6" />
                        Create Configuration Monitor
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track configuration drift using templates or a fully custom setup.
                    </p>
                </div>
                {step !== 'gallery' && step !== 'submitting' && step !== 'success' && (
                    <Button variant="ghost" size="sm" onClick={resetToGallery} className="shrink-0">
                        <ChevronLeft className="h-4 w-4 mr-1" />Back to gallery
                    </Button>
                )}
            </div>

            {/* Step indicator */}
            <StepIndicator step={step} />

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* STEP 1: Gallery                                                */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {step === 'gallery' && (
                <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Category tabs */}
                        <div className="flex items-center gap-1 flex-wrap">
                            {(['all','intune','entra','exchange'] as TemplateCategory[]).map(cat => {
                                const meta = CATEGORY_META[cat];
                                const Icon = meta.icon;
                                return (
                                    <Button key={cat} variant={activeCategory === cat ? 'default' : 'outline'}
                                        size="sm" onClick={() => setActiveCategory(cat)} className="gap-1.5">
                                        <Icon className="h-3.5 w-3.5" />
                                        {meta.label}
                                        {cat !== 'all' && cat !== 'custom' && (
                                            <Badge variant={activeCategory === cat ? 'secondary' : 'outline'} className="ml-1 text-[10px] px-1.5 py-0 h-4">
                                                {MONITOR_TEMPLATES.filter(t => t.category === cat).length}
                                            </Badge>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                        {/* Search */}
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search templates…" value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-9 h-9" />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {loadingMonitors && accounts.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                            {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted" />)}
                        </div>
                    )}

                    {!loadingMonitors && (
                        <>
                            {filteredTemplates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                                    <Search className="h-10 w-10 opacity-30" />
                                    <p className="font-medium">No templates found for &ldquo;{searchQuery}&rdquo;</p>
                                    <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>Clear search</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredTemplates.map(template => {
                                        const Icon = template.icon;
                                        const existing = monitorExistsForTemplate(template.id);
                                        const disabled = !!existing || !!template.comingSoon;
                                        return (
                                            <Card key={template.id} className={cn(
                                                'group relative overflow-hidden transition-all duration-200 border',
                                                !disabled && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
                                                disabled && 'opacity-60 cursor-default',
                                            )} onClick={() => !disabled && handleSelectTemplate(template)}>
                                                <div className={cn('h-1 w-full bg-gradient-to-r', template.gradient)} />
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className={cn('p-2.5 rounded-lg bg-gradient-to-br text-white shadow-sm', template.gradient)}>
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex gap-1.5 flex-wrap justify-end">
                                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">{template.category}</Badge>
                                                            {template.comingSoon && <Badge className="bg-muted text-muted-foreground text-[10px]">Coming soon</Badge>}
                                                            {existing && (
                                                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-[10px] gap-1">
                                                                    <CheckCircle className="h-3 w-3" />Active
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <CardTitle className="text-base mt-2">{template.title}</CardTitle>
                                                    <CardDescription className="text-sm leading-relaxed">{template.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="pb-4 space-y-3">
                                                    {template.resources.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {template.resources.slice(0, 3).map((r, i) => (
                                                                <Badge key={i} variant="secondary" className="text-[10px] font-mono">
                                                                    {r.split('.').pop()?.substring(0, 22)}…
                                                                </Badge>
                                                            ))}
                                                            {template.resources.length > 3 && (
                                                                <Badge variant="secondary" className="text-[10px]">+{template.resources.length - 3}</Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                    {existing ? (
                                                        <Button size="sm" variant="outline" className="w-full text-green-600 border-green-200 hover:bg-green-50"
                                                            onClick={e => { e.stopPropagation(); router.push(`/monitor/details/${existing.id}`); }}>
                                                            View Monitor <ArrowRight className="h-3 w-3 ml-1.5" />
                                                        </Button>
                                                    ) : template.comingSoon ? (
                                                        <div className="text-xs text-muted-foreground text-center py-1">More templates coming soon</div>
                                                    ) : (
                                                        <Button size="sm" className={cn('w-full bg-gradient-to-r text-white opacity-0 group-hover:opacity-100 transition-opacity', template.gradient)}>
                                                            Use Template <ArrowRight className="h-3 w-3 ml-1.5" />
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Enterprise: Custom Monitor */}
                            {(activeCategory === 'all' || activeCategory === 'custom') && !searchQuery && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Enterprise</span>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>
                                    <Card className={cn(
                                        'relative overflow-hidden border-2 transition-all duration-200',
                                        hasEnterpriseLicense
                                            ? 'border-amber-200 dark:border-amber-800 cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-amber-400'
                                            : 'border-dashed border-muted opacity-60 cursor-not-allowed',
                                    )} onClick={() => hasEnterpriseLicense && handleStartCustom()}>
                                        <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-yellow-500" />
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-sm">
                                                    <Wand2 className="h-5 w-5" />
                                                </div>
                                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 gap-1 text-[10px]">
                                                    <Crown className="h-3 w-3" />Enterprise
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-base mt-2">Custom Monitor</CardTitle>
                                            <CardDescription>
                                                {hasEnterpriseLicense
                                                    ? 'Pick any combination of resource types and build a monitor tailored to your exact needs.'
                                                    : 'Upgrade to Enterprise to create fully custom monitors with any resource type combination.'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-4">
                                            {hasEnterpriseLicense ? (
                                                <Button size="sm" className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white">
                                                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />Build Custom Monitor
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="outline" disabled className="w-full">
                                                    <Crown className="h-3.5 w-3.5 mr-1.5" />Enterprise Required
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* STEP 2: Configure                                              */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {step === 'configure' && (
                <div className="max-w-3xl mx-auto">
                    <div className={cn('grid gap-6', isCustom ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1')}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    {isCustom
                                        ? <><Wand2 className="h-5 w-5 text-amber-500" />Custom Monitor</>
                                        : <><BookTemplate className="h-5 w-5" />{selectedTemplate?.title}</>
                                    }
                                </CardTitle>
                                <CardDescription>Configure the details for your new monitor.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="mname">Monitor Name <span className="text-destructive">*</span></Label>
                                    <Input id="mname" value={monitorName} onChange={e => setMonitorName(e.target.value)}
                                        placeholder="e.g. Compliance Baseline Monitor" maxLength={32} />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span className={sanitizeName(monitorName).length < 8 ? 'text-destructive' : 'text-green-600'}>
                                            {sanitizeName(monitorName).length}/32 chars {sanitizeName(monitorName).length < 8 && '(min 8)'}
                                        </span>
                                        <span>Letters, numbers & spaces only</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="mdesc">Description</Label>
                                    <Textarea id="mdesc" value={monitorDescription} onChange={e => setMonitorDescription(e.target.value)}
                                        placeholder="Optional description" rows={3} />
                                </div>

                                {!isCustom && selectedTemplate && (
                                    <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            {selectedTemplate.resources.length} Resource Types
                                        </p>
                                        <div className="space-y-1 max-h-40 overflow-y-auto">
                                            {selectedTemplate.resources.map((r, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                                                    <span className="font-mono text-muted-foreground truncate">{r}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {isCustom && (
                                    <div className={cn('rounded-lg border p-3 text-sm flex items-center gap-2',
                                        customResources.length === 0
                                            ? 'border-destructive/30 bg-destructive/5 text-destructive'
                                            : 'border-green-200 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400')}>
                                        {customResources.length === 0
                                            ? <><AlertCircle className="h-4 w-4 shrink-0" />Select at least one resource type on the right.</>
                                            : <><CheckCircle className="h-4 w-4 shrink-0" />{customResources.length} resource type{customResources.length !== 1 ? 's' : ''} selected.</>
                                        }
                                    </div>
                                )}

                                <div className="flex gap-3 pt-1">
                                    <Button variant="outline" className="flex-1" onClick={() => setStep('gallery')}>
                                        <ChevronLeft className="h-4 w-4 mr-1" />Back
                                    </Button>
                                    <Button className="flex-1"
                                        disabled={!monitorName.trim() || !!validateName(monitorName) || (isCustom && customResources.length === 0)}
                                        onClick={handleCreateSnapshot}>
                                        Create Snapshot & Review
                                        <ArrowRight className="h-4 w-4 ml-1.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Custom resource picker */}
                        {isCustom && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        Resource Types
                                        <Badge variant="secondary">{customResources.length} selected</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input placeholder="Search resources…" value={resourceSearch}
                                            onChange={e => setResourceSearch(e.target.value)} className="pl-9 pr-8 h-8 text-sm" />
                                        {resourceSearch && (
                                            <button onClick={() => setResourceSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    {customResources.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 p-2 border rounded-lg bg-muted/30 max-h-20 overflow-y-auto">
                                            {customResources.map(r => (
                                                <Badge key={r} variant="default" className="cursor-pointer text-[10px] gap-1" onClick={() => toggleResource(r)}>
                                                    {fmtResource(r).substring(0, 24)}<X className="h-2.5 w-2.5" />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <div className="border rounded-lg divide-y max-h-72 overflow-y-auto">
                                        {filteredResourceCats.map(cat => {
                                            const expanded = expandedCats.includes(cat.name);
                                            const selCount = cat.resources.filter(r => customResources.includes(r)).length;
                                            return (
                                                <div key={cat.name}>
                                                    <div className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-muted/50"
                                                        onClick={() => setExpandedCats(p => p.includes(cat.name) ? p.filter(c => c !== cat.name) : [...p, cat.name])}>
                                                        {expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                                                        <Checkbox checked={selCount === cat.resources.length && cat.resources.length > 0}
                                                            onCheckedChange={() => toggleCatAll(cat.resources)} onClick={e => e.stopPropagation()} className="h-4 w-4" />
                                                        <span className="text-sm font-medium flex-1">{cat.displayName}</span>
                                                        <Badge variant="outline" className="text-[10px]">{selCount}/{cat.resources.length}</Badge>
                                                    </div>
                                                    {expanded && (
                                                        <div className="bg-muted/20 divide-y">
                                                            {cat.resources.map(r => (
                                                                <div key={r} className="flex items-center gap-2 pl-8 pr-3 py-2 hover:bg-muted/50 cursor-pointer" onClick={() => toggleResource(r)}>
                                                                    <Checkbox checked={customResources.includes(r)} onCheckedChange={() => toggleResource(r)} className="h-3.5 w-3.5" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-medium">{fmtResource(r)}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-mono truncate">{r}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* STEP 3a: Creating snapshot (initial POST)                     */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {step === 'creating' && (
                <div className="max-w-lg mx-auto">
                    <Card>
                        <CardContent className="pt-12 pb-12 flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Creating Snapshot</h3>
                                <p className="text-sm text-muted-foreground mt-1">Submitting snapshot job to the API…</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* STEP 3b: Polling for snapshot completion                      */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {step === 'polling' && (
                <div className="max-w-lg mx-auto">
                    <Card>
                        <CardContent className="pt-12 pb-12 flex flex-col items-center gap-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">Processing Snapshot</h3>
                                <p className="text-sm text-muted-foreground">
                                    The API is capturing your configuration resources.
                                </p>
                                <div className="pt-1">
                                    <Badge variant="outline">{snapshotStatus}</Badge>
                                </div>
                            </div>
                            <div className="w-full space-y-2">
                                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Check {pollingAttempts} / 60</span>
                                    <span>·</span>
                                    <span>Next in <strong className="text-foreground">{countdown}s</strong></span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000"
                                        style={{ width: `${(pollingAttempts / 60) * 100}%` }} />
                                </div>
                                <p className="text-xs text-muted-foreground">Max wait time: 10 minutes</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* STEP 4: Review snapshot resources                             */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {(step === 'review' || step === 'submitting') && currentSnapshot && (
                <div className="space-y-4 max-w-4xl mx-auto">
                    {/* Header banner */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-5 pb-5">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="p-3 rounded-full bg-primary/10 shrink-0">
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg">Snapshot captured successfully</h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        <strong>{currentSnapshot.resources.length}</strong> resource{currentSnapshot.resources.length !== 1 ? 's' : ''} captured
                                        across <strong>{Object.keys(groupedResources).length}</strong> resource type{Object.keys(groupedResources).length !== 1 ? 's' : ''}.
                                        Review the baseline below, then confirm to create your monitor.
                                    </p>
                                </div>
                                {/* Monitor name chip */}
                                <div className="shrink-0 text-right hidden sm:block">
                                    <p className="text-xs text-muted-foreground">Monitor name</p>
                                    <p className="font-semibold text-sm">{sanitizeName(monitorName)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job metadata */}
                    {currentJob && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            {[
                                { label: 'Snapshot ID', value: currentSnapshot.id.substring(0, 8) + '…' },
                                { label: 'Resources requested', value: currentJob.resources?.length ?? 0 },
                                { label: 'Items captured', value: currentSnapshot.resources.length },
                                { label: 'Resource types', value: Object.keys(groupedResources).length },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-lg border bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="font-semibold mt-0.5">{value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Resource browser */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <CardTitle className="text-base">Baseline Resources</CardTitle>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input placeholder="Filter resources…" value={reviewSearch}
                                        onChange={e => setReviewSearch(e.target.value)} className="pl-9 pr-8 h-8 text-sm" />
                                    {reviewSearch && (
                                        <button onClick={() => setReviewSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {reviewSearch && (
                                <CardDescription className="text-xs">
                                    Showing filtered results — {Object.values(groupedResources).flat().length} of {currentSnapshot.resources.length} items
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Object.keys(groupedResources).length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No resources match &ldquo;{reviewSearch}&rdquo;</p>
                                </div>
                            ) : (
                                Object.entries(groupedResources).map(([resourceType, items]) => (
                                    <ResourceGroup key={resourceType} resourceType={resourceType} items={items} />
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setStep('configure')} disabled={step === 'submitting'}>
                            <ChevronLeft className="h-4 w-4 mr-1" />Back
                        </Button>
                        <Button onClick={handleConfirmCreateMonitor} disabled={step === 'submitting'} className="min-w-36">
                            {step === 'submitting'
                                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating monitor…</>
                                : <>Create Monitor <ArrowRight className="h-4 w-4 ml-1.5" /></>
                            }
                        </Button>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* STEP 5: Success                                                */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {step === 'success' && (
                <div className="max-w-lg mx-auto">
                    <Card className="border-green-200 dark:border-green-800 overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
                        <CardContent className="pt-12 pb-12 flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <CheckCircle className="h-9 w-9 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Monitor Created!</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Your configuration monitor is now active and will track drift against the baseline you reviewed.
                                </p>
                            </div>
                            <div className="flex gap-3 mt-2">
                                <Button variant="outline" onClick={() => router.push('/monitor/monitors')}>All Monitors</Button>
                                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                    onClick={() => createdMonitorId && router.push(`/monitor/details/${createdMonitorId}`)}>
                                    View Monitor <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Error                                                          */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {step === 'error' && (
                <div className="max-w-lg mx-auto">
                    <Card className="border-destructive/40">
                        <CardContent className="pt-12 pb-12 flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertCircle className="h-9 w-9 text-destructive" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Something went wrong</h3>
                                <p className="text-sm text-destructive mt-1 max-w-sm">{error}</p>
                            </div>
                            <div className="flex gap-3 mt-2">
                                <Button variant="outline" onClick={resetToGallery}>Start Over</Button>
                                <Button onClick={() => setStep('configure')} disabled={!selectedTemplate && !isCustom}>
                                    Try Again
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
