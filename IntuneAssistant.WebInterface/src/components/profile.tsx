import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AccountInfo {
    name: string;
    username: string;
    tenantId: string;
    homeAccountId: string;
    oid: string;
}

const ProfilePage: React.FC = () => {
    const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
    const [userInitials, setUserInitials] = useState<string>('');

    useEffect(() => {
        // Get account info from session storage
        const storedAccountInfo = sessionStorage.getItem("accountInfo");
        if (storedAccountInfo) {
            try {
                const parsedInfo = JSON.parse(storedAccountInfo);
                setAccountInfo({
                    name: parsedInfo.name || 'N/A',
                    username: parsedInfo.username || 'N/A',
                    tenantId: parsedInfo.tenantId || 'N/A',
                    homeAccountId: parsedInfo.homeAccountId || 'N/A',
                    oid: parsedInfo.idTokenClaims?.oid || 'N/A',
                });

                if (parsedInfo.name) {
                    setUserInitials(getInitials(parsedInfo.name));
                }
            } catch (error) {
                console.error("Error parsing account info:", error);
            }
        }
    }, []);

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase();
    };

    if (!accountInfo) {
        return (
            <div className="container mx-auto py-10">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>
                        Unable to retrieve account information. Please log in again.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your Microsoft account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex flex-col items-center gap-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="/avatars/default.png" alt={accountInfo.name} />
                                    <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                                    <p className="text-lg font-medium">{accountInfo.name}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p>{accountInfo.username}</p>
                                </div>

                                <Separator className="my-4" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Tenant ID</p>
                                        <p className="text-sm font-mono break-all">{accountInfo.tenantId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Object ID</p>
                                        <p className="text-sm font-mono break-all">{accountInfo.oid}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Home Account ID</p>
                                        <p className="text-sm font-mono break-all">{accountInfo.homeAccountId}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground">
                            This information is retrieved from your Microsoft account through Azure AD authentication.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;