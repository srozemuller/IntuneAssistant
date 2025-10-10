'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    GitCompare,
    ArrowLeftRight,
    Search,
    ArrowRight,
    Filter,
    Settings,
    CheckCircle,
    AlertTriangle,
    Target,
    Zap,
    Shield,
    Globe
} from 'lucide-react';

// Remove the export from the function declaration
function CompareLandingPage() {
    const compareBlocks = [
        {
            title: "Policy Comparison",
            description: "Compare two configuration policies side-by-side with detailed analysis of differences, similarities, and unique settings.",
            href: "/compare/policies",
            icon: GitCompare,
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
            features: [
                "Side-by-side policy comparison",
                "Child settings deep analysis",
                "Visual difference indicators",
            ],
            badge: "CORE"
        },
        {
            title: "Baseline Analysis",
            description: "Compare your policies against security baselines and best practice templates to identify configuration gaps.",
            href: "#",
            icon: Shield,
            gradient: "from-emerald-500 to-teal-500",
            bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
            borderColor: "border-emerald-200 dark:border-emerald-800",
            features: [
                "Security baseline validation",
                "Compliance gap analysis",
                "Best practice recommendations",
            ],
            badge: "COMING SOON",
            disabled: true // Marked as coming soon
        },
        {
            title: "Bulk Comparison",
            description: "Compare multiple policies at once to identify patterns, inconsistencies, and standardization opportunities across your environment.",
            href: "#",
            icon: ArrowLeftRight,
            gradient: "from-purple-500 to-pink-500",
            bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
            borderColor: "border-purple-200 dark:border-purple-800",
            features: [
                "Multi-policy comparison matrix",
                "Standardization insights",
                "Configuration pattern analysis"
            ],
            badge: "COMING SOON",
            disabled: true // Marked as coming soon
        }
    ];

    const quickStats = [
        {
            label: "Comparison Accuracy",
            value: "99.8%",
            icon: Target,
            color: "text-green-600 dark:text-green-400"
        },
        {
            label: "Settings Analyzed",
            value: "50k+",
            icon: Zap,
            color: "text-blue-600 dark:text-blue-400"
        },
        {
            label: "Policy Categories",
            value: "100+",
            icon: Shield,
            color: "text-purple-600 dark:text-purple-400"
        },
        {
            label: "Comparison Speed",
            value: "< 2s",
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
                            <GitCompare className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Policy Comparison Engine
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Configuration Compare Center
                    </h1>
                    <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                        Identify differences, similarities, and unique configurations between your policies with advanced
                        comparison analytics. Make informed decisions with visual insights and detailed analysis.
                    </p>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 blur-2xl"></div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                    <Card key={index} className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Compare Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {compareBlocks.map((block, index) => (
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

                                {/* Action Button */}
                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    {block.disabled ? (
                                        <Button size="sm" disabled className="bg-gray-400 text-white cursor-not-allowed">
                                            Coming Soon
                                        </Button>
                                    ) : (
                                        <Link href={block.href}>
                                            <Button size="sm" className={`bg-gradient-to-r ${block.gradient} text-white shadow-md hover:shadow-lg transition-all duration-200`}>
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

            {/* Comparison Features Highlight */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit mx-auto mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="font-semibold mb-2">Identical Settings</h4>
                            <p className="text-sm text-muted-foreground">
                                Quickly identify settings that match exactly between policies
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-4">
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h4 className="font-semibold mb-2">Conflicting Values</h4>
                            <p className="text-sm text-muted-foreground">
                                Highlight settings with different configurations that need attention
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4">
                                <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h4 className="font-semibold mb-2">Smart Filtering</h4>
                            <p className="text-sm text-muted-foreground">
                                Filter by keywords, status, and setting names for focused analysis
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-fit mx-auto mb-4">
                                <Filter className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h4 className="font-semibold mb-2">Deep Analysis</h4>
                            <p className="text-sm text-muted-foreground">
                                Drill down into child settings and nested configurations
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Actions */}
            <Card className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">Ready to Start Comparing?</h3>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            Our comparison tools help you understand policy differences and make informed decisions
                            about your configuration management. Get detailed insights with visual comparisons and advanced filtering.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" size="lg" asChild>
                                <a href="https://docs.intuneassistant.cloud" target="_blank" rel="noopener noreferrer">
                                    View Documentation
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>

                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                                <Link href="/compare/policies">
                                    Start Comparing
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Add this line at the end to make it the default export
export default CompareLandingPage;
