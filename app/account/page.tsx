'use client';
import { useMsal } from '@azure/msal-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Building, ShieldCheck, Info, LogOut, Copy } from 'lucide-react';
import { VersionInfo } from '@/components/VersionInfo';
import { useCustomer } from '@/contexts/CustomerContext';
import Link from 'next/link';

export default function AccountPage() {
    const { accounts, instance } = useMsal();
    const { customerData, hasConnectedTenant, customerLoading } = useCustomer();
    const account = accounts[0];

    if (!account) {
        return (
            <div className="max-w-xl mx-auto py-16 text-center space-y-4">
                <h1 className="text-2xl font-bold">You are not signed in</h1>
                <p className="text-muted-foreground">Sign in with your Microsoft work account to see your details.</p>
                <Button onClick={() => instance.loginRedirect({ scopes: [] })}>Sign in</Button>
            </div>
        );
    }

    const handleLogout = () => instance.logoutRedirect({ postLogoutRedirectUri: '/' });

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My account</h1>
                <p className="text-muted-foreground mt-1">The details we know about you and the tenant you connected.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        You
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    <p className="text-lg font-semibold">{account.name || 'Unknown user'}</p>
                    <p className="text-muted-foreground">{account.username}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Your tenant
                    </CardTitle>
                    <CardDescription>IntuneAssistant only looks at this tenant.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-medium">Tenant ID</p>
                        <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-muted px-2 py-1 rounded break-all">{account.tenantId}</code>
                            <Button
                                variant="ghost"
                                size="sm"
                                aria-label="Copy tenant ID"
                                onClick={() => navigator.clipboard.writeText(account.tenantId || '')}
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium mb-1">Status</p>
                        {customerLoading ? (
                            <span className="text-sm text-muted-foreground">Checking…</span>
                        ) : hasConnectedTenant ? (
                            <Badge className="bg-green-600 hover:bg-green-600">Connected</Badge>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary">Not connected yet</Badge>
                                <Button asChild size="sm">
                                    <Link href={customerData ? '/onboarding/tenant' : '/onboarding/register'}>Finish setup</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" />
                        What we can do in your tenant
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>Read only. IntuneAssistant never changes, creates or deletes anything in your tenant.</p>
                    <Button asChild variant="link" className="h-auto p-0">
                        <Link href="/security">See exactly which permissions are used</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Version
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <VersionInfo />
                </CardContent>
            </Card>

            <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
            </Button>
        </div>
    );
}
