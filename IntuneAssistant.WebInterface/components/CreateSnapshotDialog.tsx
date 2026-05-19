'use client';

import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Search, X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

interface ResourceCategory {
    name: string;
    displayName: string;
    resources: string[];
}

const RESOURCE_CATEGORIES: ResourceCategory[] = [
    {
        name: 'compliance',
        displayName: 'Compliance Policies',
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
        name: 'configuration',
        displayName: 'Configuration Policies',
        resources: [
            'microsoft.intune.deviceconfigurationcustompolicywindows10',
            'microsoft.intune.deviceconfigurationendpointprotectionpolicywindows10',
            'microsoft.intune.deviceconfigurationdeliveryoptimizationpolicywindows10',
            'microsoft.intune.deviceconfigurationadministrativetemplatepolicywindows10',
            'microsoft.intune.deviceconfigurationcustompolicyios',
            'microsoft.intune.deviceconfigurationcustompolicymacos',
            'microsoft.intune.deviceconfigurationcustompolicyandroid',
        ],
    },
    {
        name: 'settings',
        displayName: 'Settings Catalog',
        resources: [
            'microsoft.intune.devicemanagementconfigurationpolicy',
        ],
    },
    {
        name: 'apps',
        displayName: 'Applications',
        resources: [
            'microsoft.intune.manageddevicemobileappconfigurationpolicy',
            'microsoft.intune.targetedmanagedappconfiguration',
            'microsoft.intune.managedapppolicy',
        ],
    },
    {
        name: 'scripts',
        displayName: 'Scripts & Remediations',
        resources: [
            'microsoft.intune.devicemanagementscript',
            'microsoft.intune.devicehealthscript',
        ],
    },
    {
        name: 'security',
        displayName: 'Security & Endpoint',
        resources: [
            'microsoft.intune.windowsautopilotdeploymentprofile',
            'microsoft.intune.deviceenrollmentconfiguration',
            'microsoft.intune.roledefinition',
        ],
    },
];

function formatResourceName(resource: string): string {
    return resource
        .replace(/^microsoft\.intune\./i, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/policy/gi, 'Policy')
        .replace(/windows(\d+)/gi, 'Windows $1')
        .split(/(?=[A-Z])/)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, c => c.toUpperCase());
}

interface CreateSnapshotDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: { displayName: string; description: string; resources: string[] }) => Promise<void>;
    isSubmitting?: boolean;
}

export function CreateSnapshotDialog({ open, onOpenChange, onSubmit, isSubmitting }: CreateSnapshotDialogProps) {
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedResources, setSelectedResources] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['compliance', 'configuration']);

    const isValidDisplayName = (name: string) => {
        const clean = name.replace(/[^a-zA-Z0-9 ]/g, '');
        return clean.length >= 3 && clean.length <= 64;
    };

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return RESOURCE_CATEGORIES;
        const q = searchQuery.toLowerCase();
        return RESOURCE_CATEGORIES.map(cat => ({
            ...cat,
            resources: cat.resources.filter(r =>
                r.toLowerCase().includes(q) || formatResourceName(r).toLowerCase().includes(q)
            ),
        })).filter(cat => cat.resources.length > 0);
    }, [searchQuery]);

    const toggleCategory = (name: string) =>
        setExpandedCategories(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);

    const toggleResource = (r: string) =>
        setSelectedResources(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

    const toggleAllInCategory = (resources: string[]) => {
        const allSelected = resources.every(r => selectedResources.includes(r));
        if (allSelected) {
            setSelectedResources(prev => prev.filter(r => !resources.includes(r)));
        } else {
            setSelectedResources(prev => [...new Set([...prev, ...resources])]);
        }
    };

    const handleReset = () => {
        setDisplayName('');
        setDescription('');
        setSelectedResources([]);
        setSearchQuery('');
        setExpandedCategories(['compliance', 'configuration']);
    };

    const handleCancel = () => {
        handleReset();
        onOpenChange(false);
    };

    const handleSubmit = async () => {
        if (!isValidDisplayName(displayName) || selectedResources.length === 0) return;
        await onSubmit({ displayName: displayName.trim(), description: description.trim(), resources: selectedResources });
        handleReset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Create Configuration Snapshot
                    </DialogTitle>
                    <DialogDescription>
                        Capture a point-in-time snapshot of selected Intune configuration resources.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-5 py-2 pr-1">
                    {/* Display Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="snap-name">Display Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="snap-name"
                            placeholder="e.g., Production Baseline May 2026"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            className={displayName && !isValidDisplayName(displayName) ? 'border-destructive' : ''}
                        />
                        {displayName && !isValidDisplayName(displayName) && (
                            <p className="text-xs text-destructive">Must be 3–64 characters (letters, numbers, spaces).</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="snap-desc">Description</Label>
                        <Input
                            id="snap-desc"
                            placeholder="Optional description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <Separator />

                    {/* Resource Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Resources <span className="text-destructive">*</span></Label>
                            <Badge variant="secondary">{selectedResources.length} selected</Badge>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search resources…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Selected summary */}
                        {selectedResources.length > 0 && (
                            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">Selected Resources</p>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedResources([])}>Clear all</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                                    {selectedResources.map(r => (
                                        <Badge key={r} variant="default" className="cursor-pointer" onClick={() => toggleResource(r)}>
                                            {formatResourceName(r)}
                                            <X className="h-3 w-3 ml-1" />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Category list */}
                        <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
                            {filteredCategories.map(cat => {
                                const isExpanded = expandedCategories.includes(cat.name);
                                const selCount = cat.resources.filter(r => selectedResources.includes(r)).length;
                                const allSelected = selCount === cat.resources.length;

                                return (
                                    <div key={cat.name} className="bg-card">
                                        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50" onClick={() => toggleCategory(cat.name)}>
                                            <div className="flex items-center gap-2 flex-1">
                                                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                                <Checkbox
                                                    checked={allSelected}
                                                    onCheckedChange={() => toggleAllInCategory(cat.resources)}
                                                    onClick={e => e.stopPropagation()}
                                                />
                                                <span className="font-medium text-sm">{cat.displayName}</span>
                                                <Badge variant="outline" className="text-xs">{selCount}/{cat.resources.length}</Badge>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="px-3 pb-3 space-y-1">
                                                {cat.resources.map(r => (
                                                    <div key={r} className="flex items-center gap-3 pl-8 py-1.5 hover:bg-muted/50 rounded cursor-pointer" onClick={() => toggleResource(r)}>
                                                        <Checkbox checked={selectedResources.includes(r)} onCheckedChange={() => toggleResource(r)} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">{formatResourceName(r)}</p>
                                                            <p className="text-xs text-muted-foreground font-mono truncate">{r}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {filteredCategories.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No resources match &ldquo;{searchQuery}&rdquo;
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isValidDisplayName(displayName) || selectedResources.length === 0}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</>
                        ) : (
                            <><Camera className="h-4 w-4 mr-2" />Create Snapshot</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

