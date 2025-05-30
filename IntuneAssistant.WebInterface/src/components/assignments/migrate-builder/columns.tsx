"use client"

import { type ColumnDef } from "@tanstack/react-table"
import {
    assignmentMigrationSchema,
    type AssignmentsMigrationModel,
    groupsSchema,
    assignmentFilterSchema
} from "@/components/assignments/migrate/schema"
import {DataTableColumnHeader} from "@/components/data-table-column-header.tsx";
import {migrationNeeded, readyForMigration, filterType} from "@/components/assignments/migrate/fixed-values.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {CheckCircle, TriangleAlert, BicepsFlexed} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {useEffect, useState} from "react";
import {z} from "zod";
import { SingleSelect } from '@/components/ui/single-select';
import {Switch} from "@/components/ui/switch.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";


export const columns = (groups: z.infer<typeof groupsSchema>[], filters: z.infer<typeof assignmentFilterSchema>[], setTableData: React.Dispatch<React.SetStateAction<AssignmentsMigrationModel[]>>) :ColumnDef<AssignmentsMigrationModel>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => {
            const isReadyForMigration = row.original.isReadyForMigration;
            return (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                    disabled={!isReadyForMigration}
                />
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'sourcePolicy.policyType',
        header: 'Policy Type',
    },
    {
        accessorKey: 'sourcePolicy.name',
        header: 'Source Policy',
        cell: ({ row }) => {
            const sourcePolicyName = row.original.sourcePolicy?.name;
            const sourcePolicyId = row.original.sourcePolicy?.id;

            if (!sourcePolicyName) {
                return <em>Policy does not exist</em>;
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <span>{sourcePolicyName}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{sourcePolicyId}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: 'sourcePolicy.assignments',
        header: 'Assignments',
        cell: ({ row }) => {
            const assignments = row.original.sourcePolicyGroups;
            const groupToMigrate = row.original.groupToMigrate;

            if (!assignments || assignments.length === 0) {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex w-[100px] items-center">
                                    <TriangleAlert className={`h-5 w-5 text-orange-500`} />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>No assignments, is migration needed?</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }

            return (
                <div>
                    {assignments.map((assignment, index) => (
                        <span
                            key={index}
                            className={assignment === groupToMigrate ? 'text-primary' : ''}
                        >
                            {assignment}
                            {index < assignments.length - 1 && ', '}
                        </span>
                    ))}
                </div>
            );
        },
    },
    {
        id: "excludeOrRemoveGroup",
        header: () => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <span>Remove/Exclude</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Select to exclude or remove the group from the source policy</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
        cell: ({ row }) => {
            const [isExcluded, setIsExcluded] = useState(row.original.excludeGroupFromSource);

            const handleSwitchChange = (checked: boolean) => {
                setIsExcluded(checked);
                row.original.excludeGroupFromSource = checked;
                row.original.removeGroupFromSource = !checked;
            };

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <Switch
                                    checked={isExcluded}
                                    onCheckedChange={handleSwitchChange}
                                    className={`custom-switch ${isExcluded ? 'text-orange-500' : 'text-red-500'}`}
                                    style={{ backgroundColor: `rgb(var(${isExcluded ? '--orange' : '--red'}) / var(--tw-bg-opacity, 1))` }}
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isExcluded ? 'Exclude' : 'Remove'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'destinationPolicy.name',
        header: 'Destination Policy',
        cell: ({ row }) => {
            const policyName = row.original.destinationPolicy?.name;
            const policyId = row.original.destinationPolicy?.id;

            if (!policyName) {
                return <em>Policy does not exist</em>;
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <span>{policyName}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{policyId}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: 'destinationPolicy.assignments',
        header: 'Current Assignments',
        cell: ({ row }) => {
            const [assignments, setAssignments] = useState(row.original.destinationPolicyGroups);

            useEffect(() => {
                setAssignments(row.original.destinationPolicyGroups);
            }, [row.original.destinationPolicyGroups]);

            return (
                <div>
                    {assignments?.map((assignment, index) => (
                        <span
                            key={index}
                            className={assignment === row.original.groupToMigrate ? 'text-primary' : ''}
                        >
                        {assignment}
                            {index < assignments.length - 1 && ', '}
                    </span>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: 'groupToMigrate',
        header: 'Group to Migrate',
        cell: ({ row }) => {
            const groupToMigrate = row.getValue('groupToMigrate') as string;
            const initialSelectedGroup = groups.find(group => group.displayName === groupToMigrate)?.id;

            const [selectedGroup, setSelectedGroup] = useState<{ id: string; createdDateTime: string; description: string; displayName: string; } | null>(() => {
                const initialGroup = groups.find(group => group.id === initialSelectedGroup);
                return initialGroup || null;
            });

            useEffect(() => {
                const updatedGroupToMigrate = row.getValue('groupToMigrate') as string;
                const updatedSelectedGroup = groups.find(group => group.id === updatedGroupToMigrate) || null;
                setSelectedGroup(updatedSelectedGroup);
            }, [row.getValue('groupToMigrate')]);

            const handleGroupChange = (selectedOption: string) => {
                const selectedGroup = groups.find(group => group.id === selectedOption) || null;
                setSelectedGroup(selectedGroup);
                if (selectedGroup) {
                    row.original.groupToMigrate = selectedGroup.displayName;
                    row.original.assignmentId = selectedGroup.id;
                    const task = assignmentMigrationSchema.parse(row.original);
                    task.groupToMigrate = selectedGroup.displayName;
                    task.assignmentId = selectedGroup.id;
                    setTableData(prevData => prevData.map(item => item.id === row.original.id ? task : item));
                }
            };

            const options = groups.map((group) => ({
                value: group.id,
                label: group.displayName,
            }));

            return (
                <SingleSelect
                    options={options}
                    onValueChange={handleGroupChange}
                    value={selectedGroup?.id || ''}
                    defaultValue={initialSelectedGroup || ''}
                    placeholder="Select group"
                />
            );
        },
    },
    {
        accessorKey: 'assignmentType',
        header: 'Include/Exclude',
        cell: ({ row }) => {
            const [isEnabled, setIsEnabled] = useState(row.original.assignmentType === filterType[0].value);
            const [isGroupSelected, setIsGroupSelected] = useState(!!row.original.groupToMigrate);

            useEffect(() => {
                setIsEnabled(row.original.assignmentType === filterType[0].value);
                setIsGroupSelected(!!row.original.groupToMigrate);
            }, [row.original.assignmentType, row.original.groupToMigrate]);

            const handleSwitchChange = (checked: boolean) => {
                setIsEnabled(checked);
                row.original.assignmentType = checked ? filterType[0].value : filterType[1].value;
                const task = assignmentMigrationSchema.parse(row.original);
                task.assignmentType = row.original.assignmentType;
                setTableData(prevData => prevData.map(item => item.id === row.original.id ? task : item));
            };

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <Switch
                                    checked={isEnabled}
                                    onCheckedChange={handleSwitchChange}
                                    className={`custom-switch ${isEnabled ? 'text-green-500' : 'text-red-500'}`}
                                    style={{ backgroundColor: `rgb(var(${isEnabled ? '--green' : '--red'}) / var(--tw-bg-opacity, 1))` }}
                                    disabled={!isGroupSelected} // Disable the switch if no group is selected
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isEnabled ? filterType[0].label : filterType[1].label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: 'filterToMigrate',
        header: 'Filter',
        cell: ({ row }) => {
            const filterToMigrate = row.original.filterToMigrate;
            const initialSelectedFilter = filters.find(filter => filter.displayName === filterToMigrate?.displayName) || null;

            const [selectedFilter, setSelectedFilter] = useState<{ id: string; displayName: string; } | null>(initialSelectedFilter);

            useEffect(() => {
                const updatedFilterToMigrate = row.original.filterToMigrate;
                const updatedSelectedFilter = filters.find(filter => filter.displayName === updatedFilterToMigrate?.displayName) || null;
                setSelectedFilter(updatedSelectedFilter);
            }, [row.original.filterToMigrate]);

            const handleFilterChange = (selectedOption: string) => {
                const selectedFilter = filters.find(filter => filter.id === selectedOption) || null;
                setSelectedFilter(selectedFilter);
                if (selectedFilter) {
                    row.original.filterToMigrate = selectedFilter;
                    const task = assignmentMigrationSchema.parse(row.original);
                    task.filterToMigrate = selectedFilter;
                    setTableData(prevData => prevData.map(item => item.id === row.original.id ? task : item));
                }
            };

            const options = filters.map((filter) => ({
                value: filter.id,
                label: filter.displayName,
            }));

            return (
                <SingleSelect
                    options={options}
                    onValueChange={handleFilterChange}
                    value={selectedFilter?.id || ''}
                    defaultValue={initialSelectedFilter?.id || ''}
                    placeholder="Select filter"
                />
            );
        },
    },
    {
        accessorKey: 'filterType',
        header: 'Type',
        cell: ({ row }) => {
            const [selectedFilterType, setSelectedFilterType] = useState(row.original.filterType || 'none');
            const [isGroupSelected, setIsGroupSelected] = useState(!!row.original.groupToMigrate);

            useEffect(() => {
                setIsGroupSelected(!!row.original.groupToMigrate);
            }, [row.original.groupToMigrate]);

            const handleFilterTypeChange = (value: string) => {
                setSelectedFilterType(value);
                row.original.filterType = value === 'none' ? null : value;
                const task = assignmentMigrationSchema.parse(row.original);
                task.filterType = row.original.filterType;
                setTableData(prevData => prevData.map(item => item.id === row.original.id ? task : item));
            };

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <Select
                                    value={selectedFilterType}
                                    onValueChange={handleFilterTypeChange}
                                    disabled={!isGroupSelected} // Disable the select if no group is selected
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value={filterType[0].value}>{filterType[0].label}</SelectItem>
                                        <SelectItem value={filterType[1].value}>{filterType[1].label}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{selectedFilterType === 'none' ? 'None' : selectedFilterType === filterType[0].value ? filterType[0].label : filterType[1].label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: "isMigrated",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Is Migrated" />
        ),
        cell: ({ row }) => {
            const state = row.getValue("isMigrated")
            const status = migrationNeeded.find(
                (status) => status.value === row.original.isMigrated,
            );
            if (!status) {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex w-[100px] items-center">
                                    <CheckCircle/>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Unknown</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="flex w-[100px] items-center">
                                <status.icon className={`h-5 w-5 ${status.color}`}/>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{status.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: "isReadyForMigration",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ready for Migration" />
        ),
        cell: ({ row }) => {
            const state = row.getValue("isReadyForMigration");
            const isMigrated = row.original.isMigrated;
            const status = readyForMigration.find(
                (status) => status.value === row.original.isReadyForMigration,
            );
            const migrationCheckResult = row.original.migrationCheckResult;
            const color = isMigrated ? "text-gray-500" : readyForMigration.find(status => status.value === row.original.isReadyForMigration)?.color || "text-default";
            const getTooltipMessage = () => {
                if (!migrationCheckResult) return "Migration check result is missing.";
                const messages = [];
                if (isMigrated) return "Migration is already done.";
                if (!migrationCheckResult.sourcePolicyExists) messages.push("Source policy does not exist.");
                if (!migrationCheckResult.sourcePolicyIsUnique) messages.push("Source policy is not unique.");
                if (!migrationCheckResult.destinationPolicyExists) messages.push("Destination policy does not exist.");
                if (!migrationCheckResult.destinationPolicyIsUnique) messages.push("Destination policy is not unique.");
                if (!migrationCheckResult.groupExists) messages.push("Group does not exist.");
                if (!migrationCheckResult.correctAssignmentTypeProvided) messages.push("Incorrect assignment type provided (must be included or excluded).");
                if (!migrationCheckResult.filterExist) messages.push("Filter does not exist.");
                if (!migrationCheckResult.filterIsUnique) messages.push("Filter is not unique.");
                if (!migrationCheckResult.correctFilterTypeProvided) messages.push("Incorrect filter type provided (must be included or excluded).");
                return messages.join(" ");
            };

            if (!status) {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className={`flex w-[100px] items-center ${isMigrated ? 'text-gray-500' : ''}`}>
                                    <CheckCircle />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{getTooltipMessage()}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className={`flex w-[100px] items-center ${color}`}>
                                <status.icon className={`h-5 w-5 ${color}`}/>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{getTooltipMessage()}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },

];