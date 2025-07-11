import * as React from "react";
import { Switch } from "../components/ui/switch";
import authService from "../scripts/msalservice";
import authDataMiddleware, {createCancelTokenSource} from "@/components/middleware/fetchData";
import {CUSTOMER_ENDPOINT} from "@/components/constants/apiUrls";
// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import { showLoadingToast } from '@/utils/toastUtils';


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
    tenants: Tenant[];
}

const TenantManagement: React.FC = () => {
    const [tenantData, setTenantData] = React.useState<TenantData | null>(null);
    const [tenants, setTenants] = React.useState<Tenant[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTenantData = async (cancelSource = createCancelTokenSource()) => {
            const toastId = showLoadingToast("Fetching tenants", () => {
                cancelSource.cancel("User cancelled request");
            });
            try {
                if (authService.isLoggedIn()) {
                    const userClaims = authService.getTokenClaims();
                    const tenantId = userClaims.tenantId;


                    const response = await authDataMiddleware(`${CUSTOMER_ENDPOINT}/${tenantId}/overview`);
                    const fetchedData = response?.data?.data || null;
                    setTenantData(fetchedData);

                    // Set tenants from fetched data
                    if (fetchedData?.tenants) {
                        setTenants(fetchedData.tenants);
                    }
                }
            } catch (error) {
                console.error("Error fetching tenant data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTenantData();
    }, []);

    if (loading) {
        return <p>Loading tenant data...</p>;
    }

    if (!tenantData) {
        return <p>Unable to fetch tenant data.</p>;
    }
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
                        t.tenantId === tenantId ? { ...t, isEnabled } : t
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
        <div className="p-6">
            <ToastContainer position={toastPosition} autoClose={toastDuration} />
            <h1 className="text-xl font-bold mb-4">Tenant Management</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                <tr>
                    <th className="border border-gray-300 p-2">Tenant ID</th>
                    <th className="border border-gray-300 p-2">Display Name</th>
                    <th className="border border-gray-300 p-2">Is Enabled</th>
                    <th className="border border-gray-300 p-2">Is Primary</th>
                    <th className="border border-gray-300 p-2">Last Login</th>
                </tr>
                </thead>
                <tbody>
                {tenants.map((tenant: Tenant) => (
                    <tr key={tenant.tenantId}>
                        <td className="border border-gray-300 p-2">{tenant.tenantId}</td>
                        <td className="border border-gray-300 p-2">{tenant.displayName}</td>
                        <td className="border border-gray-300 p-2">
                            <Switch
                                checked={tenant.isEnabled}
                                onCheckedChange={(value) => handleToggle(tenant.tenantId, value)}
                            />
                        </td>
                        <td className="border border-gray-300 p-2">
                            {tenant.isPrimary ? "Yes" : "No"}
                        </td>
                        <td className="border border-gray-300 p-2">
                            {new Date(tenant.lastLogin).toLocaleString()}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TenantManagement;