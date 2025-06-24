import React, { useEffect, useState, useMemo, useCallback } from 'react';
import '@/styles/roadmap.css';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoadmapItem {
    id: string;
    title: string;
    state: string;
    priority?: string;
    labels: string[];
    createdAt: string;
    dueDate?: string | null;
    description?: string;
    iteration?: {
        title: string;
        startDate: string;
        duration: number;
    } | null;
}

interface RoadmapProps {
    owner: string;          // GitHub username or organization
    projectNumber: number;  // GitHub project number
    repo?: string;          // Optional: GitHub repository name if not using user/org projects
}

type StatusPriorities = {
    'DONE': number;
    'IN_PROGRESS': number;
    'TODO': number;
    'PLANNED': number;
    [key: string]: number;
};

const Roadmap: React.FC<RoadmapProps> = ({ owner, projectNumber, repo = "" }) => {
    const [items, setItems] = useState<RoadmapItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const [labelFilter, setLabelFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showDone, setShowDone] = useState<boolean>(false);

    const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
    const [cacheExpiry] = useState<number>(5 * 60 * 1000); // 5 minutes cache

    const fetchRoadmapData = useCallback(async (forceRefresh = false) => {
        try {
            if (
                !forceRefresh &&
                lastFetchTime &&
                Date.now() - lastFetchTime < cacheExpiry
            ) {
                // If we already have data and the cache is still valid, do nothing
                return;
            }

            setLoading(true);

            const query = `query GetFilteredRoadmap($owner: String!, $repo: String!, $projectNumber: Int!) {
    repository(owner: $owner, name: $repo) {
      projectV2(number: $projectNumber) {
        items(first: 100) {
          nodes {
            content {
              __typename
              ... on Issue {
                number
                title
                url
                labels(first: 10) { nodes { name } }
              }
              ... on PullRequest {
                number
                title
                url
                labels(first: 10) { nodes { name } }
              }
            }
            fieldValues(first: 20) {
              nodes {
                __typename
                ... on ProjectV2ItemFieldValueCommon {
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                }
                ... on ProjectV2ItemFieldIterationValue {
                  title
                  startDate
                  duration
                }
              }
            }
          }
        }
      }
    }
  }`;

            const response = await fetch('/api/github', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        owner,
                        repo,
                        projectNumber
                    }
                })
            });

            const data = await response.json();

            if (data.errors) {
                throw new Error(data.errors[0].message);
            }

            const projectItems = data.data?.repository?.projectV2?.items?.nodes || [];

            const formattedItems = projectItems.map((item: any) => {
                // Find due date field if it exists
                const dueDateField = item.fieldValues.nodes.find(
                    (field: any) => field.field?.name === 'Due Date' && field.date
                );

                // Find status field if it exists
                const statusField = item.fieldValues.nodes.find(
                    (field: any) => field.field?.name === 'Status' && field.name
                );

                // Find priority field if it exists
                const priorityField = item.fieldValues.nodes.find(
                    (field: any) => field.field?.name === 'Priority' && field.name
                );

                // Find iteration field if it exists
                const iterationField = item.fieldValues.nodes.find(
                    (field: any) => field.__typename === 'ProjectV2ItemFieldIterationValue' && field.title
                );

                // Extract labels
                const labels = item.content?.labels?.nodes?.map((label: any) => label.name) || [];

                return {
                    id: item.id,
                    title: item.content.title,
                    state: statusField?.name || 'PLANNED',
                    priority: priorityField?.name || 'Normal',
                    labels: labels,
                    createdAt: item.content.createdAt || new Date().toISOString(),
                    dueDate: dueDateField?.date || null,
                    description: item.content.body || '',
                    iteration: iterationField ? {
                        title: iterationField.title,
                        startDate: iterationField.startDate,
                        duration: iterationField.duration
                    } : null
                };
            });

            // Sort by status and due date
            const statusPriority: StatusPriorities = {
                'DONE': 3,
                'IN_PROGRESS': 2,
                'TODO': 1,
                'PLANNED': 0
            };

            formattedItems.sort((a: RoadmapItem, b: RoadmapItem) => {
                // First by status priority
                const priorityA = statusPriority[a.state] || 0;
                const priorityB = statusPriority[b.state] || 0;

                if (priorityB !== priorityA) return priorityB - priorityA;

                // Then by due date
                if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                if (a.dueDate) return -1;
                if (b.dueDate) return 1;

                return 0;
            });

            setItems(formattedItems);
            setLastFetchTime(Date.now());

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [owner, projectNumber, repo, lastFetchTime, cacheExpiry, items.length]);

    useEffect(() => {
        fetchRoadmapData();

        // Optional: Set up a refresh interval
        const intervalId = setInterval(() => {
            fetchRoadmapData(true);
        }, cacheExpiry);

        return () => clearInterval(intervalId);
    }, [fetchRoadmapData]);

    const groupByIteration = (items: RoadmapItem[]) => {
        const groupedItems: Record<string, {
            iteration: RoadmapItem['iteration'],
            items: RoadmapItem[],
            startDate?: Date,
        }> = {};

        // First, group all items by iteration title, excluding unscheduled items
        items.forEach(item => {
            // Skip items without an iteration
            if (!item.iteration) return;

            const iterationKey = item.iteration.title;

            if (!groupedItems[iterationKey]) {
                groupedItems[iterationKey] = {
                    iteration: item.iteration,
                    items: [],
                    startDate: item.iteration.startDate ? new Date(item.iteration.startDate) : undefined
                };
            }

            groupedItems[iterationKey].items.push(item);
        });

        // Convert to array and sort by start date
        return Object.entries(groupedItems)
            .map(([title, data]) => ({
                title,
                ...data
            }))
            .sort((a, b) => {
                // Sort by start date if available
                if (a.startDate && b.startDate) {
                    return a.startDate.getTime() - b.startDate.getTime();
                }
                // Put items without dates at the end
                if (!a.startDate && b.startDate) return 1;
                if (a.startDate && !b.startDate) return -1;
                return 0;
            });
    };

    // Replace the current getStatusBadgeVariant function
    const getStatusBadgeVariant = (status: string): React.CSSProperties => {
        const normalizedStatus = status.toLowerCase();
        switch(normalizedStatus) {
            case 'done':
                return { backgroundColor: `rgb(var(--green))` };
            case 'in_progress':
                return { backgroundColor: `rgb(var(--grey))` };
            case 'todo':
                return { backgroundColor: `rgb(var(--grey))` };
            case 'planned':
                return { backgroundColor: `rgb(var(--green))` };
            case 'ready':
                return { backgroundColor: `rgb(var(--orange))` };
            case 'onhold':
            case 'on hold':
                return { backgroundColor: `rgb(var(--red))` };
            default:
                return {};
        }
    };


    const getPriorityBadgeVariant = (priority: string): "default" | "secondary" | "outline" | "destructive" => {
        switch(priority.toLowerCase()) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'secondary'; // Changed from 'warning' which is not a valid variant
            case 'low':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getLabelBadgeVariant = (label: string): "default" | "secondary" | "outline" | "destructive" => {
        // You can customize label colors based on common GitHub labels
        switch(label.toLowerCase()) {
            case 'bug':
                return 'destructive';
            case 'enhancement':
                return 'secondary';
            case 'documentation':
                return 'outline';
            case 'feature':
                return 'default';
            default:
                return 'default';
        }
    };

    // Reset all filters
    const resetFilters = () => {
        setStatusFilter(null);
        setPriorityFilter(null);
        setLabelFilter(null);
        setSearchQuery("");
    };

    // Filter logic
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Filter out "Done" items if showDone is false
            if (!showDone && item.state.toLowerCase() === 'done') {
                return false;
            }

            // Apply status filter
            if (statusFilter && item.state !== statusFilter) {
                return false;
            }

            // Apply priority filter
            if (priorityFilter && item.priority !== priorityFilter) {
                return false;
            }

            // Apply label filter
            if (labelFilter && !item.labels.includes(labelFilter)) {
                return false;
            }

            // Apply search query
            if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }, [items, statusFilter, priorityFilter, labelFilter, searchQuery, showDone]);

    // Get counts for the card description
    const totalVisibleCount = useMemo(() =>
            items.filter(item => showDone || item.state.toLowerCase() !== 'done').length,
        [items, showDone]);

    if (loading) return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Project Roadmap</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6">
                <div className="text-center text-muted-foreground">Loading roadmap...</div>
            </CardContent>
        </Card>
    );

    if (error) return (
        <Card>
            <CardHeader>
                <CardTitle>Project Roadmap</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6">
                <div className="text-center text-destructive">Error: {error}</div>
            </CardContent>
        </Card>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Project Roadmap</CardTitle>
                        <CardDescription>
                            Viewing {filteredItems.length} of {totalVisibleCount} items from project
                        </CardDescription>
                    </div>
                    <button
                        onClick={() => fetchRoadmapData(true)}
                        disabled={loading}
                        className="px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {groupByIteration(filteredItems).map((group) => {
                        const startDate = group.startDate;
                        const endDate = startDate && group.iteration?.duration
                            ? new Date(startDate.getTime() + (group.iteration.duration * 24 * 60 * 60 * 1000))
                            : undefined;

                        const dateRange = startDate
                            ? `${startDate.toLocaleDateString()} - ${endDate?.toLocaleDateString() || 'Ongoing'}`
                            : '';

                        return (
                            <div key={group.title} className="roadmap-iteration">
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <span>{group.title}</span>
                                        {startDate && (
                                            <Badge variant="outline" className="ml-2">
                                                {dateRange}
                                            </Badge>
                                        )}

                                    {/* Add visual timeline indicator */}
                                    {group !== groupByIteration(filteredItems)[groupByIteration(filteredItems).length - 1] && (
                                        <div className="flex justify-center my-6 relative">
                                            {group.startDate && (
                                                <div className="flex items-center">
                                                    <div className="relative">
                                                        {(() => {
                                                            const now = new Date();
                                                            const startDate = group.startDate as Date;
                                                            const endDate = group.iteration?.duration
                                                                ? new Date(startDate.getTime() + (group.iteration.duration * 24 * 60 * 60 * 1000))
                                                                : new Date(startDate.getTime() + (14 * 24 * 60 * 60 * 1000));

                                                            const totalDuration = endDate.getTime() - startDate.getTime();
                                                            const elapsed = now.getTime() - startDate.getTime();
                                                            const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

                                                            let statusText = "Upcoming";
                                                            if (now > endDate) statusText = "Completed";
                                                            else if (now >= startDate) statusText = `In progress (${Math.round(progress)}%)`;

                                                            return (
                                                                <div className="ml-2 flex flex-col gap-1">
                                                                    <span className="text-xs text-muted-foreground">{statusText}</span>
                                                                    {now >= startDate && now <= endDate && (
                                                                        <div className="w-32 h-2 bg-gray-200 rounded overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-primary"
                                                                                style={{ width: `${progress}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    </h3>
                                </div>

                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50%]">Title</TableHead>
                                                <TableHead className="w-[15%]">Status</TableHead>
                                                <TableHead className="w-[15%]">Priority</TableHead>
                                                <TableHead className="w-[20%]">Labels</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {group.items.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center h-16 text-muted-foreground">
                                                        No items in this iteration
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                group.items.map(item => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium w-[50%]">{item.title}</TableCell>
                                                        <TableCell className="w-[15%]">
                                                            <Badge style={getStatusBadgeVariant(item.state)}>
                                                                {item.state}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="w-[15%]">
                                                            <Badge variant={getPriorityBadgeVariant(item.priority || '')}>
                                                                {item.priority || 'Normal'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="w-[20%]">
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.labels.map(label => (
                                                                    <Badge key={label} variant={getLabelBadgeVariant(label)}>
                                                                        {label}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>


                            </div>
                        );
                    })}

                    {groupByIteration(filteredItems).length === 0 && (
                        <div className="text-center p-12 border rounded-md text-muted-foreground">
                            No items match your filters
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default Roadmap;