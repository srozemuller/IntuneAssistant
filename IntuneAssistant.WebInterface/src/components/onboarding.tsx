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
import { legacyRequest, legacyMsalInstance } from '@/authconfig';
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
    const [tenantName, setTenantName] = React.useState<string>("onmicrosoft.com");
    const [currentTenantId, setCurrentTenantId] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isTenantIdValid, setIsTenantIdValid] = React.useState<boolean>(false);
    const [isTenantNameValid, setIsTenantNameValid] = React.useState<boolean>(false);
    const [isOnboarded, setIsOnboarded] = React.useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(isOnboarded);
    const [isMigration, setIsMigration] = React.useState<boolean>(false);
    const [isNotOnboardedPopupOpen, setIsNotOnboardedPopupOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');

        if (status === 'migrate') {
            setIsMigration(true);
            fetchTenantInfo();
        }
    }, []);

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
                    localStorage.setItem('notOnboarded', true.toString());
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
        const nameRegex = /^[a-zA-Z0-9]+$/;
        return nameRegex.test(name) && name.length <= 27;
    };

    const validateGuid = (guid: string) => {
        const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        return guidRegex.test(guid);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (isMigration) return;
        const value = e.target.value;
        if (e.target.id === "name") {
            setIsTenantIdValid(validateGuid(value));
        } else if (e.target.id === "domain") {
            setIsTenantNameValid(validateTenantName(value));
        }
    };

    const handleLegacyLogin = async () => {
        try {
            const loginResponse = await legacyMsalInstance.loginPopup(legacyRequest);
            const account = loginResponse.account;
            if (account) {
                const tokenResponse = await legacyMsalInstance.acquireTokenSilent({
                    ...legacyRequest,
                    account,
                });
                localStorage.setItem('accessToken', tokenResponse.accessToken);
                window.location.href = '/onboarding?status=migrate';
            }
            localStorage.setItem('isOnboarding', true.toString());
            sessionStorage.setItem('isMigrating', true.toString());
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const fetchUrlAndRedirect = async () => {
        setIsLoading(true);

        try {
            // First, determine the state based on the URL status parameter
            const urlParams = new URLSearchParams(window.location.search);
            const status = urlParams.get('status');

            // Set storage items based on status
            if (status === 'migrate') {
                sessionStorage.setItem('isMigrating', 'true');
                localStorage.setItem('isOnboarding', 'false');
            } else {
                localStorage.setItem('isOnboarding', 'true');
                sessionStorage.setItem('isMigrating', 'false');
            }

            // Retrieve the correct values from storage
            const isMigrating = sessionStorage.getItem('isMigrating') === 'true';
            const isOnboarding = localStorage.getItem('isOnboarding') === 'true';

            // Determine state parameter
            const state = isMigrating ? 'migrating' : isOnboarding ? 'onboarding' : '';
            console.log('Current state:', state);
            const apiUrl = `${environments
                .filter((env) => env.environment === selectedEnvironment)
                .map((env) => {
                    const isDevelopment = process.env.NODE_ENV === 'development' ||
                        window.location.hostname === 'localhost';

                    return isDevelopment
                        ? "https://localhost:7224"
                        : env.url;
                })}/v1/buildconsenturl?tenantid=${tenantId}&assistantLicense=${selectedEnvironment}&redirectUrl=${window.location.origin}/onboarding&tenantName=${tenantName}&state=${state}`;

            const response = await fetch(apiUrl, { method: 'GET' });
            const data = await response.json();
            const consentUrl = data.url;
            const token = data.onboardingToken;
            localStorage.setItem('consentToken', token);

            window.open(`${consentUrl}`, "_blank", "noreferrer");

            setIsLoading(false);
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
                            localStorage.setItem('isOnboarding', true.toString());
                            window.location.href = '/onboarding';
                        }}>
                            Onboard directly
                        </Button>
                    </DialogContent>
                </Dialog>
            )}
            <Card className={`w-full ${isOnboarded ? 'opacity-50 pointer-events-none' : ''} ${isMigration ? 'bg-secondary/80' : ''}`}>
                <CardHeader>
                    <CardTitle>
                        <span className="font-sans font-bold text-gradient_indigo-purple">
                            {isMigration ? 'Intune Assistant Migrate' : 'Intune Assistant Onboarding'}
                        </span>
                    </CardTitle>
                    <CardDescription>
                        {isMigration ? 'Migrate an existing tenant into Intune Assistant.' : 'Onboard a new tenant into Intune Assistant.'}
                        <br />
                        {isMigration ? 'Use the legacy login button below to login first' : ' '}
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
                                        placeholder="domain"
                                        maxLength={150}
                                        value={tenantName}
                                        onChange={(e) => setTenantName(e.target.value)}
                                        onBlur={handleBlur}
                                        className={`${!isTenantNameValid && !isMigration ? "border-red-500" : ""}`}
                                        disabled={isMigration}
                                    />
                                    {!isTenantNameValid && !isMigration && (
                                        <div className="text-red-500 text-sm">
                                            Please enter a valid tenant name (alphanumeric only with the max of 27).
                                        </div>
                                    )}
                                    <span>.onmicrosoft.com</span>
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
                                    className={`${!isTenantIdValid && !isMigration ? "border-red-500" : ""}`}
                                    disabled={isMigration}
                                />
                                {!isTenantIdValid && !isMigration && (
                                    <div className="text-red-500 text-sm">
                                        Please enter a valid Tenant ID.
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                {!isMigration && (
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
                    {!isMigration && (
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
                            {isMigration && (
                                <Button variant="outline" onClick={handleLegacyLogin}>
                                    Legacy Login
                                </Button>
                            )}
                            <Button onClick={fetchUrlAndRedirect} disabled={!isTenantIdValid || !isTenantNameValid}>
                                {isMigration ? 'Migrate' : 'Deploy'}
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
        </>
    );
}