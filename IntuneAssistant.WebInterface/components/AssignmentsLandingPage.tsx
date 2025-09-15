'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    GitBranch,
    Smartphone,
    Users,
    ArrowRight,
    BarChart3,
    Target,
    Zap,
    Shield,
    Globe,
    Settings, CheckCircle
} from 'lucide-react';

export function AssignmentsLandingPage() {
    // ... (rest of the component code from the previous response)

    const assignmentBlocks = [
        {
            title: "All Assignments",
            description: "Comprehensive overview of all your Intune assignments across applications, policies, and configurations.",
            href: "/assistant/assignments-overview",
            icon: GitBranch,
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
            features: [
                "View all assignments in one place",
                "Filter by type, status, and target",
                "Export assignment reports",
            ],
            //stats: "2,847 Total Assignments",
            badge: "OVERVIEW"
        },
        {
            title: "App Assignments",
            description: "Monitor application deployments, installations, and distribution across your organization.",
            href: "/assistant/app-assignments",
            icon: Smartphone,
            gradient: "from-emerald-500 to-teal-500",
            bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
            borderColor: "border-emerald-200 dark:border-emerald-800",
            features: [
                "Application deployment tracking",
                "Filter by type, status, and target",
                "Application assignment by install type",
            ],
            //stats: "1,234 App Assignments",
            badge: "APPS"
        },
        {
            title: "Group Assignments",
            description: "Get insights of all Intune policies, apps, and configurations for a specific groups efficiently.",
            href: "/assistant/group-assignments",
            icon: Users,
            gradient: "from-purple-500 to-pink-500",
            bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
            borderColor: "border-purple-200 dark:border-purple-800",
            features: [
                "Group-based assignment checker",
                "Membership insights",
                "Group insights"
            ],
            //stats: "156 Active Groups",
            badge: "GROUPS"
        }
    ];

    const quickStats = [
        {
            label: "Success Rate",
            value: "94.2%",
            icon: Target,
            color: "text-green-600 dark:text-green-400"
        },
        {
            label: "Active Deployments",
            value: "342",
            icon: Zap,
            color: "text-blue-600 dark:text-blue-400"
        },
        {
            label: "Devices Managed",
            value: "12.8k",
            icon: Shield,
            color: "text-purple-600 dark:text-purple-400"
        },
        {
            label: "Global Coverage",
            value: "23 Countries",
            icon: Globe,
            color: "text-orange-600 dark:text-orange-400"
        }
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <GitBranch className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Assignment Management
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Intune Assignment Center
                    </h1>
                    <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                        Streamline your Microsoft Intune deployments with comprehensive assignment management,
                        monitoring, and analytics across your entire organization.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {/*<Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">*/}
                        {/*    <BarChart3 className="mr-2 h-4 w-4" />*/}
                        {/*    View Analytics*/}
                        {/*</Button>*/}
                        {/*<Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">*/}
                        {/*    <Settings className="mr-2 h-4 w-4" />*/}
                        {/*    Configure Settings*/}
                        {/*</Button>*/}
                    </div>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 blur-2xl"></div>
                </div>
            </div>

            {/*/!* Quick Stats *!/*/}
            {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">*/}
            {/*    {quickStats.map((stat, index) => (*/}
            {/*        <Card key={index} className="relative overflow-hidden">*/}
            {/*            <CardContent className="p-6">*/}
            {/*                <div className="flex items-center justify-between">*/}
            {/*                    <div>*/}
            {/*                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>*/}
            {/*                        <p className="text-2xl font-bold">{stat.value}</p>*/}
            {/*                    </div>*/}
            {/*                    <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${stat.color}`}>*/}
            {/*                        <stat.icon className="h-6 w-6" />*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </CardContent>*/}
            {/*        </Card>*/}
            {/*    ))}*/}
            {/*</div>*/}

            {/* Assignment Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {assignmentBlocks.map((block, index) => (
                    <Card key={index} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${block.borderColor}`}>
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
                                {/* Features List */}
                                <div className="space-y-2">
                                    {block.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    {/*<span className="text-sm font-medium text-muted-foreground">*/}
                                    {/*    {block.stats}*/}
                                    {/*</span>*/}
                                    <Link href={block.href}>
                                        <Button size="sm" className={`bg-gradient-to-r ${block.gradient} text-white shadow-md hover:shadow-lg transition-all duration-200`}>
                                            Explore
                                            <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Additional Actions */}
            <Card className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">Need Help Getting Started?</h3>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            Our assignment management tools are designed to simplify your Intune administration.
                            Access tutorials, best practices, and expert guidance to optimize your deployments.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" size="lg" asChild>
                                <a href="https://docs.intuneassistant.cloud" target="_blank" rel="noopener noreferrer">
                                    View Documentation
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>

                            <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500">
                                Go to GitHub
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
