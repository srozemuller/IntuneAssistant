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
import { useNavigate } from "react-router-dom";
import { msalInstance } from "@/authconfig";

type BlueshiftEnvironment = {
    environment: string;
    displayName: string;
    url: string;
};

type BlueshiftM365ConsentCardProps = {
    environments: BlueshiftEnvironment[];
};

export default function OnboardingCard({
                                           environments,
                                       }: Readonly<BlueshiftM365ConsentCardProps>) {
    const defaultEnvironment = environments[0];
    const [selectedEnvironment, setSelectedEnvironment] = React.useState<string>(
        defaultEnvironment.environment
    );
    const [isOptionsOpen, setIsOptionsOpen] = React.useState<boolean>(false);
    const [tenantId, setTenantId] = React.useState<string>("");
    const [relationId, setRelationId] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const navigate = useNavigate();

    const fetchUrlAndRedirect = async () => {
        setIsLoading(true);

        try {
            const loginResponse = await msalInstance.loginPopup({
                scopes: ["user.read"],
            });

            if (loginResponse) {
                const clientId = "131386a4-d462-4270-ac50-7ebc4685da14";
                const templateUrl = `https://login.microsoftonline.com/organizations/adminconsent?client_id=${clientId}`;

                const popup = window.open(templateUrl, "popup", "width=600,height=600");

                const handleMessage = (event: MessageEvent) => {
                    if (event.origin !== window.location.origin) return;

                    if (event.data === "consent-success") {
                        navigate("/status/onboarded");
                    } else {
                        toast.error("Consent process failed. Please try again.");
                    }

                    setIsLoading(false);
                    window.removeEventListener("message", handleMessage);
                };

                window.addEventListener("message", handleMessage);

                // Polling to check if the popup is closed
                const popupCheckInterval = setInterval(() => {
                    if (popup && popup.closed) {
                        clearInterval(popupCheckInterval);
                        setIsLoading(false);
                        toast.error("Consent process was not completed. Please try again.");
                    }
                }, 1000);
            } else {
                toast.error("Login failed. Please try again.");
                setIsLoading(false);
            }
        } catch (error) {
            toast.error("An error occurred during login. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    <span className="font-sans font-bold text-gradient_indigo-purple">
                        Blueshift M365 Insights
                    </span>
                </CardTitle>
                <CardDescription>
                    Onboard a new customer tenant onto the Blueshift M365 Insights managed services
                    offering.
                    <br />
                    For more information, please refer to the{" "}
                    <a
                        href="/docs/blueshift/m365-insights-onboarding"
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
                            <Label htmlFor="name">
                                Relation ID <small>(from AFAS)</small>
                            </Label>
                            <Input
                                id="name"
                                placeholder="12345"
                                maxLength={5}
                                onChange={(e) => setRelationId(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">
                                Tenant ID <small>(from ME-ID)</small>
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
                                    <Label htmlFor="framework">Environment</Label>
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