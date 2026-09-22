import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const permissions = [
    { name: 'DeviceManagementConfiguration.Read.All', why: 'Read Intune configuration profiles and baselines' },
    { name: 'DeviceManagementApps.Read.All', why: 'Read managed applications' },
    { name: 'DeviceManagementServiceConfig.Read.All', why: 'Read device management service configuration' },
    { name: 'DeviceManagementScripts.Read.All', why: 'Read management scripts' },
    { name: 'Group.Read.All', why: 'Read groups and their members' },
    { name: 'User.ReadBasic.All', why: 'Read basic user profiles' },
    { name: 'Policy.Read.ConditionalAccess', why: 'Read Conditional Access policies' },
    { name: 'Directory.AccessAsUser.All', why: 'Directory lookups, such as roles and groups, on behalf of the signed-in user' },
];

const data = [
    { what: 'Your account name, tenant ID and tenant domain', kept: 'Yes', why: 'To recognize you and show which tenant you connected' },
    { what: 'Tenant data (policies, devices, assignments)', kept: 'No', why: 'Read on request, shown in your browser and not stored' },
    { what: 'Sign-in tokens', kept: 'No', why: 'Short-lived and only held in your browser session' },
];

export default function SecurityPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-10">
            <PageHeader
                title="Privacy & security"
                description="What IntuneAssistant can access, what it keeps and how you take access away again."
            />

            <section className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight">It only reads</h2>
                <p className="text-muted-foreground max-w-2xl">
                    Every request IntuneAssistant makes to look at your tenant is a read request. It does not create,
                    change or delete anything. It works in your own user context, so you only see what your roles allow
                    you to see, and every request appears in the audit logs under your name.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight">Permissions</h2>
                <p className="text-muted-foreground">These Microsoft Graph permissions are approved when you connect your tenant.</p>
                <div className="rounded-lg border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Permission</TableHead>
                                <TableHead>Used for</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.map(permission => (
                                <TableRow key={permission.name}>
                                    <TableCell><code className="text-xs">{permission.name}</code></TableCell>
                                    <TableCell className="text-muted-foreground">{permission.why}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight">Your data</h2>
                <div className="rounded-lg border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>What</TableHead>
                                <TableHead>Kept?</TableHead>
                                <TableHead>Why</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map(row => (
                                <TableRow key={row.what}>
                                    <TableCell className="font-medium">{row.what}</TableCell>
                                    <TableCell>{row.kept}</TableCell>
                                    <TableCell className="text-muted-foreground">{row.why}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Taking access away</CardTitle>
                    <CardDescription>You stay in control.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Open Microsoft Entra ID, go to <strong>Enterprise applications</strong>, find the
                    IntuneAssistant application and delete it. Access stops immediately.
                </CardContent>
            </Card>
        </div>
    );
}
