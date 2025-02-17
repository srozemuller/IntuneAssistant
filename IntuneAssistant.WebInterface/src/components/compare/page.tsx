import { useEffect, useState } from 'react';
import authDataMiddleware from "@/components/middleware/fetchData";
import { CONFIGURATION_POLICIES_ENDPOINT, COMPARE_ENDPOINT } from "@/components/constants/apiUrls.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import { DataTable } from "@/components/compare/data-table";
import { settingStatus } from "@/components/compare/fixed-values.tsx";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {DataTableColumnHeader} from "@/components/data-table-column-header.tsx";
import {isAssignedValues} from "@/components/assignments/overview/fixed-values.tsx";
import {CheckCircle} from "lucide-react";


function PolicySelectionDialog({ isOpen, onClose, policies, onSelect }) {
    const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    const handleSelect = (policyId: string, platform: string) => {
        if (selectedPlatform && selectedPlatform !== platform) {
            toast.error("Please select policies with the same platform.");
            return;
        }

        setSelectedPolicies(prev => {
            if (prev.includes(policyId)) {
                return prev.filter(id => id !== policyId);
            } else if (prev.length < 2) {
                setSelectedPlatform(platform);
                return [...prev, policyId];
            }
            return prev;
        });
    };

    const handleConfirm = () => {
        if (selectedPolicies.length === 2) {
            onSelect(selectedPolicies);
            onClose();
        } else {
            toast.error("Please select exactly two policies.");
        }
    };

    const columns = [
        {
            header: 'Selected Policies',
            accessorKey: 'selected',
            cell: ({ row }) => {
                const isDisabled = selectedPlatform && row.original.platform !== selectedPlatform;
                return (
                    <div
                        className={`p-2 border rounded ${selectedPolicies.includes(row.original.id) ? 'bg-yellow-500 text-white' : ''} ${isDisabled ? 'bg-gray-200 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => !isDisabled && handleSelect(row.original.id, row.original.platform)}
                    >
                        {row.original.name}
                    </div>
                );
            },
        },
        {
            header: 'Policy ID',
            accessorKey: 'id',
        },
        {
            accessorKey: "isAssigned",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Is Assigned" />
            ),
            cell: ({ row }) => {
                const state = row.getValue("isAssigned");
                const status = isAssignedValues.find(
                    (status) => status.value === row.original.isAssigned,
                );
                if (!status) {
                    return (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className="flex w-[100px] items-center">
                                        <CheckCircle />
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
                                    <status.icon className={`h-5 w-5 ${status.color}`} />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{status.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            header: 'Platform',
            accessorKey: 'platforms',
        },
    ];

    const sortedPolicies = [
        ...policies.filter(policy => selectedPolicies.includes(policy.id)),
        ...policies.filter(policy => !selectedPolicies.includes(policy.id)),
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="container max-w-[80%] max-h-[80vh] overflow-y-auto py-6">
                <DialogTitle>Select Policies to Compare</DialogTitle>
                <DialogDescription>
                    Please select two policies to compare.
                </DialogDescription>
                <DataTable columns={columns} data={sortedPolicies} rawData={JSON.stringify(policies)} fetchData={() => {}} source="policy-selection" groupData={[]} />
                <button onClick={handleConfirm} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md">
                    Confirm
                </button>
            </DialogContent>
        </Dialog>
    );
}
export default function DemoPage() {
    const [policies, setPolicies] = useState<any[]>([]);
    const [selectedPolicy, setSelectedPolicy] = useState<string>('');
    const [comparePolicy, setComparePolicy] = useState<string>('');
    const [comparisonResults, setComparisonResults] = useState<any>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchData = async () => {
        try {
            const response = await authDataMiddleware(CONFIGURATION_POLICIES_ENDPOINT, 'GET');
            setPolicies(response.data);
        } catch (error) {
            console.error('Error fetching policies:', error);
        }
    };

    const handleCompare = async () => {
        try {
            const response = await authDataMiddleware(`${COMPARE_ENDPOINT}/configurationpolicy`, 'POST', {
                PolicyId: selectedPolicy,
                ComparePolicyId: comparePolicy
            });
            if (response.data.status === "Success") {
                setComparisonResults(response.data.results);
            } else {
                console.error('Comparison failed:', response.data.message);
            }
        } catch (error) {
            console.error('Error comparing policies:', error);
        }
    };

    const handlePolicySelect = (selectedPolicies: string[]) => {
        setSelectedPolicy(selectedPolicies[0]);
        setComparePolicy(selectedPolicies[1]);
    };

    useEffect(() => {
        if (isDialogOpen) {
            toast.promise(fetchData(), {
                pending: {
                    render:  `Searching for policies ...`,
                },
                success: {
                    render: `Policies fetched successfully`,
                },
                error:  {
                    render: (errorMessage) => `Failed to get policies because: ${errorMessage}`,
                }
            });
        }
    }, [isDialogOpen]);

    const columns = [
        {
            header: 'Name',
            accessorKey: 'name',
            cell: (info: any) => (
                <div>
                    <div>{info.getValue()}</div>
                </div>
            ),
        },
        {
            header: 'Description',
            accessorKey: 'description',
        },
        {
            header: 'Setting Check State',
            accessorKey: 'settingCheckState',
            cell: ({ row }) => {
                const status = settingStatus.find(status => status.value === row.getValue('settingCheckState'));
                return status ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className={status.color}>
                                    <status.icon className="inline-block" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{status.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : 'Unknown';
            },
        },
        {
            header: comparisonResults?.sourcePolicyName || 'Source Policy',
            accessorKey: 'values.sourceValue',
        },
        {
            header: comparisonResults?.checkedPolicyName || 'Checked Policy',
            accessorKey: 'values.checkedValue',

        },
    ];

    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition} />
            <Button
                onClick={() => setIsDialogOpen(true)} className="mb-4 mr-4"
                variant="outline" size="sm"
            >
                Select Policies to Compare
            </Button>
            <PolicySelectionDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                policies={policies}
                onSelect={handlePolicySelect}
            />
            <Button
                onClick={handleCompare}
                variant="outline" size="sm"
                disabled={!selectedPolicy || !comparePolicy}
            >
                Compare
            </Button>
            <DataTable
                columns={columns}
                data={comparisonResults.checkResults || []}
                rawData={JSON.stringify(comparisonResults)}
                fetchData={handleCompare}
                source="comparison"
                groupData={[]}
            />
        </div>
    );
}