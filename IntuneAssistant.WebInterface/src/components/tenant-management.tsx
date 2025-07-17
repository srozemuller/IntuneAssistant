import * as React from "react";
import {Switch} from "../components/ui/switch";
import {Button} from "../components/ui/button";
import {Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter} from "../components/ui/card";
import authService from "../scripts/msalservice";
import authDataMiddleware, {createCancelTokenSource} from "@/components/middleware/fetchData";
import {CUSTOMER_ENDPOINT} from "@/components/constants/apiUrls";
// Toast configuration
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {toastPosition, toastDuration} from "@/config/toastConfig.ts";
import {showLoadingToast} from '@/utils/toastUtils';
import {useEffect} from "react";
import {ClipboardIcon, RefreshCcw, Loader2} from "lucide-react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "../components/ui/dialog";
import TenantOnboarding from "./customer-tenant-onboarding";
import {Tooltip, TooltipProvider} from "../components/ui/tooltip";

interface Tenant {
    id: string;
    tenantId: string;
    displayName: string;
    isEnabled: boolean;
    isPrimary: boolean;
    lastLogin: string;
}

interface TenantData {
    id: string;
    name: string;
    address?: string;
    iban?: string;
    isActive: boolean;
    primaryContactEmail?: string;
    homeTenantId: string;
    isMsp: boolean;
    tenants: Tenant[];
}

const TenantManagement: React.FC = () => {
    const [tenantData, setTenantData] = React.useState<TenantData | null>(null);
    const [tenants, setTenants] = React.useState<Tenant[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const userClaims = authService.getTokenClaims();
    const customerId = userClaims?.tenantId;

    const handleRefreshTenants = async () => {
        try {
            setIsRefreshing(true);
            await fetchTenantData(); // replace with your actual fetch logic
            toast.success("Tenant data refreshed");
        } catch (error) {
            toast.error("Failed to refresh tenant data");
        } finally {
            setIsRefreshing(false);
        }
    };

    const fetchTenantData = async (cancelSource = createCancelTokenSource()): Promise<any> => {
        console.log("Inside fetchTenantData");

        const isLoggedIn = authService.isLoggedIn();
        const userClaims = authService.getTokenClaims();
        console.log("isLoggedIn:", isLoggedIn);
        console.log("userClaims:", userClaims);
        let pendingMessage = "Loading tenant data...";
        if (!isLoggedIn || !userClaims?.tenantId) {
            pendingMessage = "You have to log in to fetch tenant data.";
            console.warn("Aborting fetch: not logged in or missing tenantId");
            throw new Error("User not logged in or missing claims");
        }

        const tenantId = userClaims.tenantId;
        console.log("Fetching tenant overview for:", tenantId);

        const promise = authDataMiddleware(`${CUSTOMER_ENDPOINT}/${tenantId}/overview`, 'GET', {}, cancelSource as any)
            .then((response) => {
                const fetchedData = response?.data?.data;
                console.log("Fetch response:", response);

                if (response && response.status === 200 && fetchedData) {
                    setTenantData(fetchedData);
                    setTenants(fetchedData?.tenants || []);
                    setLoading(false);
                    return fetchedData;
                }

                throw new Error("No tenant data found");
            });

        const result = await toast.promise(promise, {
            pending: pendingMessage,
            success: "Tenant data loaded!",
            error: "Failed to fetch tenant data",
        });

        return result;
    };


    useEffect(() => {
        console.log("Fetching tenant data on page load...");
        const tenantSource = createCancelTokenSource();

        fetchTenantData(tenantSource)
            .then(() => console.log("Tenant data fetched successfully"))
            .catch((error) => {
                console.error("Error fetching tenant data:", error);
            });

        return () => {
            console.log("Cleaning up tenant data fetch...");
            tenantSource.cancel('Component unmounted');
            toast.dismiss();
        };
    }, []);


    const handleToggle = async (tenantId: string, isEnabled: boolean, cancelSource = createCancelTokenSource()) => {
        const toastId = showLoadingToast("Switching tenant", () => {
            cancelSource.cancel("User cancelled request");
        });
        try {
            // Get customer ID from token claims
            const userClaims = authService.getTokenClaims();
            const customerId = userClaims.tenantId;


            // Find the tenant with matching tenantId to get its id
            const tenant = tenants.find(t => t.tenantId === tenantId);
            if (!tenant) {
                console.error("Tenant not found");
                toast.update(toastId, {
                    render: 'Tenant not found',
                    type: 'warning',
                    isLoading: false,
                    autoClose: toastDuration
                });
                return;
            }

            // Use customer ID in URL, send tenant ID in body
            const response = await authDataMiddleware(
                `${CUSTOMER_ENDPOINT}/${customerId}/tenants/update-status`,
                'POST',
                {
                    tenantId: tenant.id,
                    isEnabled: isEnabled
                },
                cancelSource as any
            );

            // Check if response status is 2xx (including 204)
            if (response && response.status >= 200 && response.status < 300) {
                setTenants((prevTenants: Tenant[]) =>
                    prevTenants.map((t: Tenant) =>
                        t.tenantId === tenantId ? {...t, isEnabled} : t
                    )
                );

                const action = isEnabled ? "enabled" : "disabled";
                console.log(`Tenant ${tenant.displayName} successfully ${action}`);
                toast.update(toastId, {
                    render: `Tenant ${tenant.displayName} successfully ${action}`,
                    type: 'success',
                    isLoading: false,
                    autoClose: toastDuration
                });
            } else {
                console.error("Failed to update tenant status");
                toast.update(toastId, {
                    render: `Failed to update tenant status`,
                    type: 'error',
                    isLoading: false,
                    autoClose: toastDuration
                });
            }
        } catch (error) {
            console.error("Error updating tenant status:", error);
            toast.update(toastId, {
                render: `Failed to update tenant status`,
                type: 'error',
                isLoading: false,
                autoClose: toastDuration
            });
        }
    };

    return (
        <TooltipProvider>
            <div className="container mx-auto py-10">
                <ToastContainer autoClose={toastDuration} position={toastPosition}/>
                <h1 className="text-3xl font-bold mb-6">Tenant Management</h1>

                <div className="grid gap-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefreshTenants}
                        disabled={isRefreshing}
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                        {isRefreshing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin"/>
                                Refreshing
                            </>
                        ) : (
                            <>
                                <RefreshCcw className="w-4 h-4"/>
                                Refresh
                            </>
                        )}
                    </Button>
                    <TenantOnboarding
                        customerId={customerId}
                        isMsp={tenantData?.isMsp ?? false}
                    />
                    {/* Customer Information Card */}
                    {tenantData && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Customer Information</CardTitle>
                                <CardDescription>Details about the selected customer</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
                                        <p className="text-sm font-mono break-all">{tenantData.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                                        <p className="text-sm">{tenantData.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                                        <p className="text-sm">{tenantData.address || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">IBAN</p>
                                        <p className="text-sm font-mono break-all">{tenantData.iban || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Primary Contact</p>
                                        <p className="text-sm">{tenantData.primaryContactEmail || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Home Tenant ID</p>
                                        <p className="text-sm font-mono break-all">{tenantData.homeTenantId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Is Active</p>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                tenantData.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            }`}
                                        >
        {tenantData.isActive ? "Active" : "Inactive"}
    </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Is MSP</p>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                tenantData.isMsp ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
        {tenantData.isMsp ? "MSP" : "Non-MSP"}
    </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <p className="text-xs text-muted-foreground">This information reflects the current state
                                    of the customer record.</p>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Tenant Table Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Tenant Overview</CardTitle>
                            <CardDescription>All associated tenants for this customer</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    <p className="ml-2 text-sm text-muted-foreground">Loading tenant data...</p>
                                </div>
                            ) : !tenantData ? (
                                <div className="py-12 text-center text-muted-foreground text-sm">
                                    <p>Unable to fetch tenant data.</p>
                                </div>
                            ) : tenants.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground text-sm">
                                <p>No tenants found for this customer.</p>
                                <p>Once onboarded, tenants will appear in this list.</p>
                                </div>
                                ) : tenants.length > 0 ? (
                                <>
                                    <div className="hidden md:grid grid-cols-4 gap-4 px-4 py-2 text-xs text-muted-foreground font-medium uppercase">
                                        <div>Display Name</div>
                                        <div>Rollout Enabled</div>
                                        <div>Primary</div>
                                        <div>Last Login</div>
                                    </div>

                                    {tenants.map((tenant: Tenant) => (
                                        <div
                                            key={tenant.tenantId}
                                            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center px-4 py-3 border border-muted rounded-md bg-muted/30 hover:bg-muted transition-colors cursor-pointer"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{tenant.displayName}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-mono text-muted-foreground break-all">{tenant.tenantId}</p>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(tenant.tenantId);
                                                            toast.success("Tenant ID copied to clipboard");
                                                        }}
                                                        className="text-muted-foreground hover:text-foreground transition"
                                                        title="Copy Tenant ID"
                                                    >
                                                        <ClipboardIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="md:hidden text-xs text-muted-foreground">Enabled:</span>
                                                <TooltipProvider>
                                                    <Tooltip
                                                        content={!tenantData.isActive ? "Tenant is not active yet" : ""}
                                                        disableHoverableContent={!tenantData.isActive}
                                                    >
                                                        <Switch
                                                            checked={tenant.isEnabled}
                                                            disabled={!tenantData.isActive}
                                                            onCheckedChange={(value) => handleToggle(tenant.tenantId, value)}
                                                        />
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>

                                            <div>
                                                {tenant.isPrimary ? (
                                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                                    Primary
                                </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </div>

                                            <div className="text-sm text-muted-foreground">
                                                {new Date(tenant.lastLogin).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="py-12 text-center text-muted-foreground text-sm">
                                    <p className="mb-2">No tenants found for this customer.</p>
                                    <p>Once onboarded, tenants will appear in this list.</p>
                                </div>
                            )}
                        </CardContent>

                        {tenants.length > 0 && (
                            <CardFooter>
                                <p className="text-xs text-muted-foreground">
                                    These tenants are synchronized and managed through your connected Microsoft environment.
                                </p>
                            </CardFooter>
                        )}
                    </Card>


                </div>
            </div>

        </TooltipProvider>
    );
};

export default TenantManagement;