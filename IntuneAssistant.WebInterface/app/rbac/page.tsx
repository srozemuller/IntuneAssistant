'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Shield,
    Users, 
    ArrowRight, 
    AlertTriangle,
    CheckCircle,
    Lock,
    Activity
} from 'lucide-react';

export default function RbacPage() {
    const rbacBlocks = [
        {
            title: "Intune Admin Analyzer",
            disabled: false,
            description: "Analyze Intune Administrator role assignments and identify over-privileged users based on actual activity patterns.",
            href: "/rbac/intune-admin-analyzer",
            icon: Shield,
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
            features: [
                "Analyze role members (direct, group, nested)",
                "Detect over-privileged users",
                "Activity-based recommendations"
            ],
            badge: "ANALYZER"
        },
        // {
        //     title: "Role Assignment Review",
        //     description: "Review and manage all Intune role assignments across your organization.",
        //     href: "/rbac/role-assignments",
        //     icon: Users,
        //     gradient: "from-purple-500 to-pink-500",
        //     bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
        //     borderColor: "border-purple-200 dark:border-purple-800",
        //     features: [
        //         "View all role assignments",
        //         "Track role membership",
        //         "Assignment history"
        //     ],
        //     badge: "COMING SOON",
        //     disabled: true
        // },
        // {
        //     title: "Permission Insights",
        //     description: "Get detailed insights into permission usage patterns and optimize access controls.",
        //     href: "/rbac/permission-insights",
        //     icon: Lock,
        //     gradient: "from-green-500 to-emerald-500",
        //     bgGradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
        //     borderColor: "border-green-200 dark:border-green-800",
        //     features: [
        //         "Permission usage analytics",
        //         "Access pattern analysis",
        //         "Security recommendations"
        //     ],
        //     badge: "COMING SOON",
        //     disabled: true
        // }
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 p-8 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Shield className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Role-Based Access Control
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        RBAC Management
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl">
                        Analyze and manage role-based access control for your Intune environment.
                        Identify over-privileged accounts and maintain security best practices.
                    </p>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 blur-2xl"></div>
                </div>
            </div>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
                                About RBAC Analysis
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
                                The RBAC Management tools help you maintain security best practices by analyzing role assignments
                                and identifying potential over-privileged accounts. This ensures that users have appropriate
                                access levels based on their actual usage patterns.
                            </p>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Direct Members</h4>
                                    </div>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 pl-6">
                                        Users directly assigned to roles
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Group Members</h4>
                                    </div>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 pl-6">
                                        Users assigned via security groups
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Nested Groups</h4>
                                    </div>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 pl-6">
                                        Users in nested group hierarchies
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* RBAC Feature Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rbacBlocks.map((block, index) => (
                    <Card 
                        key={index} 
                        className={`relative overflow-hidden transition-all duration-300 ${
                            block.disabled 
                                ? 'opacity-60 cursor-not-allowed' 
                                : 'hover:shadow-xl hover:scale-105 cursor-pointer'
                        } ${block.borderColor}`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${block.bgGradient}`}></div>

                        <CardHeader className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${block.gradient} text-white shadow-lg`}>
                                    <block.icon className="h-6 w-6" />
                                </div>
                                <Badge variant="outline" className="font-medium">
                                    {block.badge}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl font-bold">{block.title}</CardTitle>
                            <CardDescription className="text-base">
                                {block.description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative z-10 pt-0">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    {block.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center gap-2 text-sm">
                                            {block.disabled ? (
                                                <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            )}
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    {block.disabled ? (
                                        <Button size="sm" disabled className="opacity-50 cursor-not-allowed">
                                            Coming Soon
                                        </Button>
                                    ) : (
                                        <Link href={block.href}>
                                            <Button size="sm" className={`bg-gradient-to-r ${block.gradient} text-white shadow-md hover:shadow-lg`}>
                                                Explore
                                                <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom CTA Card */}
            <Card className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">Maintain Least Privilege Access</h3>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            Regularly review and optimize role assignments to ensure users have only the permissions they need.
                            Stay compliant and secure with automated RBAC analysis.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" size="lg" asChild>
                                <a href="https://docs.intuneassistant.cloud/docs/rbac" target="_blank" rel="noopener noreferrer">
                                    View Documentation
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg">
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

