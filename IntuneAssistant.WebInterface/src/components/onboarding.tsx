import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import authService from "@/scripts/msalservice";
import {INTUNEASSISTANT_TENANT_INFO} from "@/components/constants/apiUrls";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type LicenseProperties = {
    environment: string;
    displayName: string;
    url: string;
};

type ConsentProperties = {
    environments: LicenseProperties[];
};

export default function ConsentCard({
                                        environments,
                                    }: Readonly<ConsentProperties>) {
    const defaultEnvironment = environments[0];
    const [selectedEnvironment, setSelectedEnvironment] = React.useState<string>(
        defaultEnvironment.environment
    );
    const [isOptionsOpen, setIsOptionsOpen] = React.useState<boolean>(false);
    const [tenantId, setTenantId] = React.useState<string>("");
    const [tenantName, setTenantName] = React.useState<string>("");
    const [currentTenantId, setCurrentTenantId] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isTenantIdValid, setIsTenantIdValid] = React.useState<boolean>(false);
    const [isTenantNameValid, setIsTenantNameValid] = React.useState<boolean>(false);
    const [isOnboarded, setIsOnboarded] = React.useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(isOnboarded);
    const [isNotOnboardedPopupOpen, setIsNotOnboardedPopupOpen] = React.useState<boolean>(false);

    const fetchTenantInfo = async () => {
        if (authService.isLoggedIn()) {
            const userClaims = authService.getTokenClaims();
            const tenantId = userClaims.tenantId;
            setCurrentTenantId(tenantId);

            try {
                const response = await fetch(`${INTUNEASSISTANT_TENANT_INFO}?tenantId=${tenantId}`);
                const data = await response.json();
                console.log("onboarded data:", data);
                if (data.status != 0 && data.data) {
                    setTenantId(data.data.tenantId);
                    setTenantName(data.data.tenantName);
                    setIsTenantIdValid(true);
                    setIsTenantNameValid(true);
                } else {
                    setIsTenantIdValid(false);
                    setIsTenantNameValid(false);
                    sessionStorage.setItem('notOnboarded', true.toString());
                    setIsNotOnboardedPopupOpen(true);
                }
            } catch (error) {
                console.error('Error fetching tenant info:', error);
                setIsTenantIdValid(false);
                setIsTenantNameValid(false);
            }
        }
    };

    const validateTenantName = (name: string) => {
        const nameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
        return nameRegex.test(name) && name.length <= 255; // Domain names can be up to 255 characters
    };

    const validateGuid = (guid: string) => {
        const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        return guidRegex.test(guid);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (e.target.id === "name") {
            setIsTenantIdValid(validateGuid(value));
        } else if (e.target.id === "domain") {
            setIsTenantNameValid(validateTenantName(value));
        }
    };


    const fetchUrlAndRedirect = async () => {
        setIsLoading(true);

        try {
            // First, determine the state based on the URL status parameter
            const urlParams = new URLSearchParams(window.location.search);

            // Set storage items based on status
            sessionStorage.setItem('isOnboarding', 'true');

            // Retrieve the correct values from storage
            const isOnboarding = sessionStorage.getItem('isOnboarding') === 'true';

            // Determine state parameter

            const apiUrl = `${environments
                .filter((env) => env.environment === selectedEnvironment)
                .map((env) => {
                    const isDevelopment = process.env.NODE_ENV === 'development' ||
                        window.location.hostname === 'localhost';

                    return isDevelopment
                        ? "https://localhost:7224"
                        : env.url;
                })}/v1/buildconsenturl?tenantid=${tenantId}&assistantLicense=${selectedEnvironment}&tenantName=${tenantName}`;

            try {
                const response = await fetch(apiUrl, { method: 'GET' });
                if (response.status === 409) {
                    const conflictData = await response.json();
                    toast.error(
                        <div>
                            <strong>{conflictData.message}</strong>
                            <br />
                            {conflictData.details}
                            <br />
                            <small>{conflictData.data}</small>
                        </div>
                    );
                    setIsLoading(false);
                    return;
                }

                const responseData = await response.json();
                const data = responseData.data;

                if (data) {
                    const consentUrl = data.url;
                    const token = data.onboardingToken;

                    localStorage.setItem('consentToken', token);
                    window.open(consentUrl, "_blank", "noreferrer");
                    setIsLoading(false);
                } else {
                    console.error("Data not found in response:", responseData);
                }
            } catch (error) {
                toast.error(
                    <div>
                        Failed to fetch consent URL.{" "}
                        <a href="mailto:sander@rozemuller.com" className="underline">
                            Please contact support.
                        </a>
                    </div>
                );
                console.error(error);
            }


        } catch (error) {
            toast.error(<div>Failed to fetch consent URL. <a href="mailto:sander@rozemuller.com" className="underline">Please contact support.</a></div>);
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <>
            {isOnboarded && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Already Onboarded</DialogTitle>
                            <DialogDescription>
                                You are already onboarded with the tenant ID: {currentTenantId}
                            </DialogDescription>
                        </DialogHeader>
                        <Button variant="outline" onClick={() => window.location.href = '/'}>
                            Return to Main Page
                        </Button>
                    </DialogContent>
                </Dialog>
            )}
            {isNotOnboardedPopupOpen && (
                <Dialog open={isNotOnboardedPopupOpen} onOpenChange={setIsNotOnboardedPopupOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Not Onboarded</DialogTitle>
                            <DialogDescription>
                                The tenant was not onboarded earlier. Please proceed with the onboarding process.
                            </DialogDescription>
                        </DialogHeader>
                        <Button variant="outline" onClick={() => {
                            sessionStorage.setItem('isOnboarding', true.toString());
                            window.location.href = '/onboarding';
                        }}>
                            Onboard directly
                        </Button>
                    </DialogContent>
                </Dialog>
            )}
            <Card className={`w-full ${isOnboarded ? 'opacity-50 pointer-events-none' : ''} `}>
                <CardHeader>
                    <CardTitle>
                        <span className="font-sans font-bold text-gradient_indigo-purple">
                            {'Intune Assistant Onboarding'}
                        </span>
                    </CardTitle>
                    <CardDescription>
                        {'Onboard a new tenant into Intune Assistant.'}
                        <br />
                        For more information, please refer to the{" "}
                        <a
                            href="/docs/onboarding"
                            target="_blank"
                            rel="noreferrer"
                        >
                            documentation.
                        </a>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                {currentTenantId && (
                                    <div className="text-sm text-gray-500">
                                        Current Tenant ID: {currentTenantId}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="domain">
                                    Tenant Domain <small><a
                                    href="https://learn.microsoft.com/en-us/partner-center/account-settings/find-ids-and-domain-names#find-the-microsoft-entra-tenant-id-and-primary-domain-name"
                                    target="_blank"> (find tenant domain)</a></small>
                                </Label>
                                <div className="flex items-center space-y-2 space-x-2">
                                    <Input
                                        id="domain"
                                        placeholder="domain.com"
                                        maxLength={150}
                                        value={tenantName}
                                        onChange={(e) => setTenantName(e.target.value)}
                                        onBlur={handleBlur}
                                        className={`${!isTenantNameValid ? "border-red-500" : ""}`}
                                    />
                                    {!isTenantNameValid  && (
                                        <div className="text-red-500 text-sm">
                                            Please enter a valid tenant domain like domain.com.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">
                                    Tenant ID <small><a
                                    href="https://learn.microsoft.com/en-us/azure/azure-portal/get-subscription-tenant-id#find-your-microsoft-entra-tenant"
                                    target="_blank"> (find Tenant ID)</a></small>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="00000000-0000-0000-0000-000000000000"
                                    maxLength={36}
                                    value={tenantId}
                                    onChange={(e) => setTenantId(e.target.value)}
                                    onBlur={handleBlur}
                                    className={`${!isTenantIdValid ? "border-red-500" : ""}`}
                                />
                                {!isTenantIdValid  && (
                                    <div className="text-red-500 text-sm">
                                        Please enter a valid Tenant ID.
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                {(
                                    <Collapsible
                                        open={isOptionsOpen}
                                        onOpenChange={setIsOptionsOpen}
                                        className="w-full space-y-2"
                                    >
                                        <div className="flex items-center justify-between space-x-4">
                                            <h4 className="text-sm font-semibold">Advanced options</h4>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="w-9 p-0">
                                                    <ChevronsUpDown className="h-4 w-4" />
                                                    <span className="sr-only">Toggle</span>
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent className="space-y-2">
                                            <Label htmlFor="framework">License</Label>
                                            <Select
                                                defaultValue={defaultEnvironment.environment}
                                                onValueChange={(e) => setSelectedEnvironment(e)}
                                            >
                                                <SelectTrigger id="framework">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent position="popper">
                                                    {environments.map((env) => (
                                                        <SelectItem
                                                            key={env.environment}
                                                            value={env.environment}
                                                        >
                                                            {env.displayName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </CollapsibleContent>
                                    </Collapsible>
                                )}
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    { (
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Reset
                        </Button>
                    )}
                    {isLoading ? (
                        <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Please wait
                        </Button>
                    ) : (
                        <>
                            <Button onClick={fetchUrlAndRedirect} disabled={!isTenantIdValid || !isTenantNameValid}>
                                {'Deploy'}
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
        </>
    );
}