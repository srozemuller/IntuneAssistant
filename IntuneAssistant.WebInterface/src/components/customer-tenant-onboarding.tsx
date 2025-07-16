import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import {ASSIGNMENTS_APPS_ENDPOINT, CUSTOMER_ENDPOINT} from "@/components/constants/apiUrls";
import authDataMiddleware, {createCancelTokenSource} from "@/components/middleware/fetchData";
const TenantOnboarding: React.FC<{ customerId: string; isMsp: boolean}> = ({ customerId , isMsp}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [tenantId, setTenantId] = useState("");
    const [tenantDomainName, setTenantDomainName] = useState("");

    const handleOnboardTenant = async (cancelSource = createCancelTokenSource()) => {
        try {
            const response = await authDataMiddleware(
                `${CUSTOMER_ENDPOINT}/${customerId}/tenants/onboarding?tenantid=${tenantId}&tenantName=${tenantDomainName}`,
                'GET',
                {},
                cancelSource as any
            );
            console.log("response", response);
            if (response?.data && response.data.data.url && response.data.data.onboardingToken) {
                const consentUrl = response.data.data.url;
                const token = response.data.data.onboardingToken;

                localStorage.setItem(`${tenantId}_consentToken`, token);
                window.open(consentUrl, "_blank", "noreferrer");
                toast.success("Tenant onboarded successfully!");
                setIsDialogOpen(false);
                setTenantId("");
                setTenantDomainName("");
            } else {
                toast.error("Failed to onboard tenant: Missing required data.");
            }
        } catch (error) {
            console.error("Error onboarding tenant:", error);
            toast.error("An error occurred while onboarding the tenant.");
        }
    };

    return (
        <div>
            {/* Add Button */}
            <Button
                variant="default"
                disabled={!isMsp}
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                className="inline-flex items-center gap-1"
            >
                <Plus className="w-4 h-4" />
                Add Tenant
            </Button>

            {/* Dialog Popup */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Onboard New Tenant</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Tenant ID</label>
                            <Input
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}
                                placeholder="Enter Tenant ID"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Tenant Domain Name</label>
                            <Input
                                value={tenantDomainName}
                                onChange={(e) => setTenantDomainName(e.target.value)}
                                placeholder="Enter Tenant Domain Name"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="default" onClick={handleOnboardTenant}>
                            Onboard
                        </Button>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TenantOnboarding;