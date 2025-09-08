// app/account/info-page.tsx
'use client';
import { useMsal } from '@azure/msal-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Building, Calendar, Shield, Key, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountOverview() {
    const { accounts, instance } = useMsal();
    const router = useRouter();
    const account = accounts[0];

    if (!account) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-gray-500">No account information available</p>
                    <Button onClick={() => router.back()} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        instance.logoutPopup();
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    ← Back
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Account Overview</h1>
                <p className="text-gray-600 mt-2">Manage your account information and settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-8 w-8 text-gray-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{account.name || 'Unknown User'}</h3>
                                <p className="text-gray-600">{account.username}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-gray-600">{account.username}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Building className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium">Display Name</p>
                                    <p className="text-sm text-gray-600">{account.name || 'Not available'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium">Environment</p>
                                    <Badge variant="outline" className="mt-1">
                                        {account.environment}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Account Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Tenant ID</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {account.tenantId}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigator.clipboard.writeText(account.tenantId || '')}
                                        className="h-6 px-2 text-xs"
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">Home Account ID</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                                        {account.homeAccountId}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigator.clipboard.writeText(account.homeAccountId || '')}
                                        className="h-6 px-2 text-xs"
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">Local Account ID</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                                        {account.localAccountId}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigator.clipboard.writeText(account.localAccountId || '')}
                                        className="h-6 px-2 text-xs"
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Session Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Session Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Authority Type</p>
                                <Badge variant="secondary" className="mt-1">
                                    {account.authorityType || 'MSSTS'}
                                </Badge>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">Cloud Environment</p>
                                <p className="text-sm text-gray-600 mt-1">{account.environment}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">ID Token Claims</p>
                                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {account.idTokenClaims && Object.entries(account.idTokenClaims).slice(0, 6).map(([key, value]) => (
                                            <div key={key} className="truncate">
                                                <span className="font-medium">{key}:</span>
                                                <span className="ml-1 text-gray-600">
                                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                                // Refresh token logic could go here
                                window.location.reload();
                            }}
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Refresh Session
                        </Button>

                        <Button
                            variant="destructive"
                            className="w-full justify-start"
                            onClick={handleLogout}
                        >
                            <User className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
