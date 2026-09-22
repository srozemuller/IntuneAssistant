import { GitCompare, ArrowRight, Layers, ShieldCheck, Upload, FileJson } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CompareHubPage() {
    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-lime-900 to-green-900 p-8 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <GitCompare className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Policy Comparison
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Compare Policies</h1>
                    <p className="text-xl text-white/80 max-w-2xl">
                        Compare configuration and compliance policies side-by-side to spot coverage, conflicts,
                        and unique settings before enabling a new policy in your tenant.
                    </p>
                </div>
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-lime-400 to-green-400 blur-3xl" />
                    <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br from-green-400 to-lime-400 blur-2xl" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Link href="/compare/policies" className="group block focus-visible:outline-none">
                    <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group-focus-visible:shadow-xl">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-lime-500 to-green-500 text-white shadow-lg flex items-center justify-center mb-2">
                                <GitCompare className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                Policy Comparison
                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </CardTitle>
                            <CardDescription className="text-base">
                                Compare a new or existing policy against one or more policies in your tenant, with a
                                detailed breakdown of matching, conflicting, and unique settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                                Side-by-side coverage, conflicts, and decision guidance
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Layers className="h-4 w-4 flex-shrink-0" />
                                Set analysis across multiple policies of the same type
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/compare/configuration" className="group block focus-visible:outline-none">
                    <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group-focus-visible:shadow-xl">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-lime-500 to-green-500 text-white shadow-lg flex items-center justify-center mb-2">
                                <Upload className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                Compare External
                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </CardTitle>
                            <CardDescription className="text-base">
                                Upload an exported policy JSON file and compare its settings against the matching
                                policies already in your tenant.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileJson className="h-4 w-4 flex-shrink-0" />
                                Import Settings Catalog, Device Config, or Administrative Template exports
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Layers className="h-4 w-4 flex-shrink-0" />
                                Platform-matched coverage, conflicts, and missing settings
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
