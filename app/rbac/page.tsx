import { Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RbacHubPage() {
    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 p-8 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Shield className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Role-Based Access Control
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Admin roles</h1>
                    <p className="text-xl text-white/80 max-w-2xl">
                        See who holds the Intune Administrator role in your tenant, through direct and nested group assignments.
                    </p>
                </div>
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 blur-3xl" />
                    <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 blur-2xl" />
                </div>
            </div>

            <Link href="/rbac/intune-admin-analyzer" className="group block focus-visible:outline-none max-w-lg">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group-focus-visible:shadow-xl">
                    <CardHeader>
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg flex items-center justify-center mb-2">
                            <Shield className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg">Intune Admin Analyzer</CardTitle>
                        <CardDescription>Every holder of the Intune Administrator role, direct and through group membership.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                            Open
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}
