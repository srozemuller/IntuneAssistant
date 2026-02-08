'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Settings, Computer, Blocks } from 'lucide-react';

interface AssignmentFilter {
    id: string;
    createdDateTime: string;
    lastModifiedDateTime: string;
    displayName: string;
    description: string;
    platform: number;
    rule: string;
    assignmentFilterManagementType: number;
    payloads: unknown[];
    roleScopeTags: string[];
    additionalData: Record<string, unknown>;
    backingStore: Record<string, unknown>;
    odataType: string | null;
}

interface FilterDetailsDialogProps {
    filter: AssignmentFilter | null;
    isOpen: boolean;
    onClose: () => void;
}

export function FilterDetailsDialog({ filter, isOpen, onClose }: FilterDetailsDialogProps) {
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        if (isOpen && typeof window !== 'undefined') {
            setScrollPosition(window.scrollY);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const handleScroll = () => {
                const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
                if (dialog) {
                    const scrollY = window.scrollY;
                    const viewportHeight = window.innerHeight;
                    dialog.style.position = 'fixed';
                    dialog.style.top = `${viewportHeight / 2}px`;
                    dialog.style.left = '50%';
                    dialog.style.transform = 'translate(-50%, -50%)';
                }
            };

            handleScroll();
            window.addEventListener('scroll', handleScroll, true);

            return () => {
                window.removeEventListener('scroll', handleScroll, true);
            };
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const mainContent = document.querySelector('main');

            if (mainContent) {
                mainContent.style.filter = 'blur(8px)';
                mainContent.style.transition = 'filter 0.2s';
            }

            return () => {
                if (mainContent) {
                    mainContent.style.filter = '';
                }
            };
        }
    }, [isOpen]);

    const getPlatformName = (platform: number): string => {
        switch (platform) {
            case 0: return 'All';
            case 1: return 'Android';
            case 2: return 'iOS';
            case 3: return 'macOS';
            case 4: return 'Windows';
            default: return `Platform ${platform}`;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
            <DialogContent
                className="max-w-[1400px] max-h-[80vh] overflow-y-auto absolute left-1/2 -translate-x-1/2"
                style={{
                    top: `${scrollPosition + 450}px`,
                    position: 'absolute'
                }}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {filter?.displayName || 'Filter Details'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-300">
                        {filter?.description || 'Assignment filter information and rules'}
                    </DialogDescription>
                </DialogHeader>

                {filter ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Filter ID</label>
                                <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">{filter.id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Management Type</label>
                                <div className="flex items-center gap-2">
                                    {filter.assignmentFilterManagementType === 0 ? (
                                        <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700">
                                            <Computer className="h-3 w-3 mr-1" />
                                            Devices
                                        </Badge>
                                    ) : (
                                        <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700">
                                            <Blocks className="h-3 w-3 mr-1" />
                                            Apps
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Platform</label>
                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                    {getPlatformName(filter.platform)}
                                </p>
            </div>
                        </div>

                        {filter.description && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Description</label>
                                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                    <code className="whitespace-pre-wrap break-all">
                                        {filter.description}
                                    </code>
                                </pre>
                            </div>
                        )}

                        {filter.rule && (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Filter Rule</label>
                                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                    <code className="whitespace-pre-wrap break-all">{filter.rule}</code>
                                </pre>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Created</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(filter.createdDateTime).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Modified</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(filter.lastModifiedDateTime).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Role Scope Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {filter.roleScopeTags && filter.roleScopeTags.length > 0 ? (
                                        filter.roleScopeTags.map((tag, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">No role scope tags</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">Filter not found</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}