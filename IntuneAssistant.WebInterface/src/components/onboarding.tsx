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
    const [currentTenantId, setCurrentTenantId] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        const fetchCurrentTenantId = async () => {
            if (authService.isLoggedIn()) {
                const userClaims = authService.getTokenClaims();
                setCurrentTenantId(userClaims.tenantId); // Assuming 'tid' is the tenant ID claim
            }
        };

        fetchCurrentTenantId();
    }, []);

    const fetchUrlAndRedirect = async () => {
        setIsLoading(true);

        try {
            if (!authService.isLoggedIn()) {
                await authService.login();
            }

            const userClaims = authService.getTokenClaims();
            const preferredUsername = userClaims.username;

            const apiUrl = `${environments
                .filter((env) => env.environment === selectedEnvironment)
                .map((env) => env.url)}/v1/buildconsenturl?tenantid=${tenantId}&assistantLicense=${selectedEnvironment}&redirectUrl=${window.location.origin}/onboarding&userName=${preferredUsername}&state=onboarding`;

            const response = await fetch(apiUrl, { method: 'GET' });
            const data = await response.json();
            const consentUrl = data.url;
            const token = data.token;
            localStorage.setItem('consentToken', token); // Store token in localStorage
           console.log( localStorage.getItem('consentToken'));


            console.info(consentUrl);
            window.open(`${consentUrl}`, "_blank", "noreferrer"); // Include token in the URL

            setIsLoading(false);
        } catch (error) {
            toast.error(<div>Failed to fetch consent URL. <a href="mailto:sander@rozemuller.com" className="underline">Please contact support.</a></div>);
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    <span className="font-sans font-bold text-gradient_indigo-purple">
                        Intune Assistant Onboarding
                    </span>
                </CardTitle>
                <CardDescription>
                    Onboard a new tenant into Intune Assistant.
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
                            <Label htmlFor="name">
                                Tenant ID <small><a href="https://learn.microsoft.com/en-us/azure/azure-portal/get-subscription-tenant-id#find-your-microsoft-entra-tenant" target="_blank"> (find Tenant ID)</a></small>
                            </Label>
                            <Input
                                id="name"
                                placeholder="00000000-0000-0000-0000-000000000000"
                                maxLength={36}
                                onChange={(e) => setTenantId(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
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
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Reset
                </Button>
                {isLoading ? (
                    <Button disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                    </Button>
                ) : (
                    <Button onClick={fetchUrlAndRedirect}>Deploy</Button>
                )}
            </CardFooter>
        </Card>
    );
}