'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Upload,
    Target,
    Zap,
    FileSpreadsheet,
    ArrowRight,
    CheckCircle,
    FileText,
    Users,
    Settings,
    Info,
    BarChart3,
    Shield,
    Clock,
    AlertTriangle,
    Crown,
    Layers,
    Filter,
    RefreshCw,
    GitCompare,
    CheckSquare
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
export default function AssignmentManagerLandingPage() {
    const { isAuthenticated } = useAuth();
    const workflowFeatures = [
        {
            title: "CSV Upload",
            description: "Upload your assignment configurations via CSV for bulk processing",
            icon: Upload,
            color: "text-blue-600 dark:text-blue-400"
        },
        {
            title: "Live Comparison",
            description: "Real-time comparison between your CSV data and live Intune environment",
            icon: GitCompare,
            color: "text-purple-600 dark:text-purple-400"
        },
        {
            title: "High-Speed Migration",
            description: "Lightning-fast bulk assignment processing with optimized API calls",
            icon: Zap,
            color: "text-yellow-600 dark:text-yellow-400"
        },
        {
            title: "Validation & Verification",
            description: "Comprehensive validation to ensure assignments are applied correctly",
            icon: CheckSquare,
            color: "text-green-600 dark:text-green-400"
        }
    ];

    const assignmentCapabilities = [
        {
            capability: "Policy Assignment",
            description: "Bulk assign policies with include/exclude targeting",
            assignments: "500+ per batch",
            icon: Shield,
            color: "bg-blue-500"
        },
        {
            capability: "Update Rings",
            description: "Manage Windows Update rings assignments efficiently",
            assignments: "300+ per batch",
            icon: RefreshCw,
            color: "bg-green-500"
        },
        {
            capability: "Filter-Based Targeting",
            description: "Advanced filtering for precise assignment targeting",
            assignments: "Custom filters",
            icon: Filter,
            color: "bg-purple-500"
        },
        {
            capability: "Group Management",
            description: "Streamlined group-based assignment operations",
            assignments: "Multiple groups",
            icon: Users,
            color: "bg-orange-500"
        }
    ];

    const processingStats = [
        {
            title: "Processing Speed",
            value: "10x",
            subtitle: "Faster than manual",
            trend: "vs. traditional methods",
            icon: Zap,
            color: "text-yellow-600"
        },
        {
            title: "Batch Capacity",
            value: "500+",
            subtitle: "Assignments per run",
            trend: "Optimized throughput",
            icon: Layers,
            color: "text-blue-600"
        },
        {
            title: "Success Rate",
            value: "99.8%",
            subtitle: "Assignment accuracy",
            trend: "With validation",
            icon: Target,
            color: "text-green-600"
        },
        {
            title: "Time Saved",
            value: "85%",
            subtitle: "Reduction in effort",
            trend: "Average per project",
            icon: Clock,
            color: "text-purple-600"
        }
    ];

    const csvFields = [
        { field: "PolicyName", description: "Name of the Intune policy to assign" },
        { field: "Target", description: "Target group or user for assignment" },
        { field: "AssignType", description: "Include or Exclude assignment type" },
        { field: "Filter", description: "Optional filter criteria for targeted assignment" }
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 p-8 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Target className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 flex items-center gap-1">
                            Bulk assignments
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Assignment Manager
                    </h1>
                    <p className="text-xl text-amber-100 mb-6 max-w-2xl">
                        Revolutionize your Intune assignment workflow with bulk processing capabilities.
                        Upload CSV configurations, compare with live data, and execute high-speed assignments
                        with comprehensive validation.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {isAuthenticated ? (
                            <Link href="/deployment/assignments">
                                <Button size="lg" className="bg-white text-amber-600 hover:bg-gray-100 font-semibold">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Start Bulk Assignment
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                size="lg"
                                disabled
                                className="bg-white/50 text-amber-600/50 cursor-not-allowed font-semibold"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Start Bulk Assignment (Login Required)
                            </Button>
                        )}
                        {/*<Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">*/}
                        {/*    <FileText className="mr-2 h-4 w-4" />*/}
                        {/*    CSV Template*/}
                        {/*</Button>*/}
                    </div>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-white to-yellow-200 blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 blur-2xl"></div>
                </div>
            </div>

            {/*/!* Workflow Features *!/*/}
            {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">*/}
            {/*    {workflowFeatures.map((feature, index) => (*/}
            {/*        <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">*/}
            {/*            <CardContent className="p-6">*/}
            {/*                <div className="flex items-start gap-4">*/}
            {/*                    <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${feature.color}`}>*/}
            {/*                        <feature.icon className="h-5 w-5" />*/}
            {/*                    </div>*/}
            {/*                    <div className="flex-1">*/}
            {/*                        <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>*/}
            {/*                        <p className="text-xs text-muted-foreground">{feature.description}</p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </CardContent>*/}
            {/*        </Card>*/}
            {/*    ))}*/}
            {/*</div>*/}

            {/* Processing Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {processingStats.map((stat, index) => (
                    <Card key={index} className="relative overflow-hidden border-l-4 border-l-yellow-400">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.subtitle}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm">{stat.title}</h3>
                                <div className="text-xs text-muted-foreground">{stat.trend}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Feature Block */}
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl border-amber-200 dark:border-amber-800">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"></div>

                {/* Premium Badge */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium flex items-center gap-1">
                        Licensed
                    </Badge>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Licensed Modules</p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    These modules require a valid IntuneAssistant license and are designed for organizations that need human support, advanced automation, reporting, or integrations.
                                </p>
                                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                        Community modules remain completely free and unrestricted.
                                    </p>
                                </div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </div>


                <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                            <Target className="h-7 w-7" />
                        </div>
                        <Badge variant="outline" className="font-medium text-xs px-3">
                            BULK OPERATIONS
                        </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2">High-Speed Bulk Assignment Engine</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                        Transform your Intune assignment process with our premium bulk assignment solution.
                        Upload CSV configurations, leverage real-time data comparison, and execute assignments
                        at unprecedented speed with comprehensive validation and rollback capabilities.
                    </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 pt-0">
                    <div className="space-y-6">
                        {/* Process Flow */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                                    <Upload className="h-6 w-6 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-sm mb-1">1. Upload CSV</h4>
                                <p className="text-xs text-muted-foreground">Upload your assignment configuration file</p>
                            </div>
                            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-3">
                                    <GitCompare className="h-6 w-6 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-sm mb-1">2. Live Compare</h4>
                                <p className="text-xs text-muted-foreground">Compare with current Intune environment</p>
                            </div>
                            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-3">
                                    <Zap className="h-6 w-6 text-yellow-600" />
                                </div>
                                <h4 className="font-semibold text-sm mb-1">3. Execute</h4>
                                <p className="text-xs text-muted-foreground">High-speed bulk assignment processing</p>
                            </div>
                            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3">
                                    <CheckSquare className="h-6 w-6 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-sm mb-1">4. Validate</h4>
                                <p className="text-xs text-muted-foreground">Comprehensive validation and reporting</p>
                            </div>
                        </div>

                        {/* Key Features */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">CSV-based bulk assignment processing</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Real-time data comparison and validation</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Include/Exclude assignment types</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Advanced filter-based targeting</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Update rings management support</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Comprehensive audit and rollback</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-4 border-t border-border/50">
                            <Link href="/deployment/assignments" className="block">
                                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg transition-all duration-200">
                                    Launch Assignment Manager
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CSV Configuration Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            CSV Configuration Format
                        </CardTitle>
                        <CardDescription>
                            Required fields for bulk assignment processing
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {csvFields.map((field, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{field.field}</h4>
                                        <p className="text-xs text-muted-foreground">{field.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/*<div className="pt-4 border-t border-border mt-4">*/}
                        {/*    <Button variant="outline" className="w-full">*/}
                        {/*        <FileSpreadsheet className="mr-2 h-4 w-4" />*/}
                        {/*        Download CSV Template*/}
                        {/*    </Button>*/}
                        {/*</div>*/}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            Assignment Capabilities
                        </CardTitle>
                        <CardDescription>
                            Supported assignment types and throughput capacity
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {assignmentCapabilities.map((capability, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className={`p-2 ${capability.color} rounded-lg text-white`}>
                                        <capability.icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">{capability.capability}</h4>
                                        <p className="text-xs text-muted-foreground">{capability.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-medium text-green-600">{capability.assignments}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/*/!* Recent Operations *!/*/}
            {/*<Card>*/}
            {/*    <CardHeader>*/}
            {/*        <CardTitle className="flex items-center gap-2">*/}
            {/*            <Clock className="h-5 w-5" />*/}
            {/*            Recent Assignment Operations*/}
            {/*        </CardTitle>*/}
            {/*        <CardDescription>*/}
            {/*            Latest bulk assignment activities and their status*/}
            {/*        </CardDescription>*/}
            {/*    </CardHeader>*/}
            {/*    <CardContent>*/}
            {/*        <div className="space-y-4">*/}
            {/*            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">*/}
            {/*                <CheckCircle className="h-5 w-5 text-green-600" />*/}
            {/*                <div className="flex-1">*/}
            {/*                    <div className="flex items-center justify-between">*/}
            {/*                        <p className="text-sm font-medium">Windows Security Baseline Assignment</p>*/}
            {/*                        <span className="text-xs text-muted-foreground">2 hours ago</span>*/}
            {/*                    </div>*/}
            {/*                    <p className="text-xs text-muted-foreground">Successfully assigned to 247 devices across 5 groups</p>*/}
            {/*                </div>*/}
            {/*                <Badge variant="outline" className="text-green-600 border-green-600">Success</Badge>*/}
            {/*            </div>*/}
            {/*            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">*/}
            {/*                <RefreshCw className="h-5 w-5 text-blue-600" />*/}
            {/*                <div className="flex-1">*/}
            {/*                    <div className="flex items-center justify-between">*/}
            {/*                        <p className="text-sm font-medium">Update Ring Rollout - Phase 2</p>*/}
            {/*                        <span className="text-xs text-muted-foreground">5 hours ago</span>*/}
            {/*                    </div>*/}
            {/*                    <p className="text-xs text-muted-foreground">Processed 89 assignment updates with filter validation</p>*/}
            {/*                </div>*/}
            {/*                <Badge variant="outline" className="text-blue-600 border-blue-600">Completed</Badge>*/}
            {/*            </div>*/}
            {/*            <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">*/}
            {/*                <AlertTriangle className="h-5 w-5 text-orange-600" />*/}
            {/*                <div className="flex-1">*/}
            {/*                    <div className="flex items-center justify-between">*/}
            {/*                        <p className="text-sm font-medium">Compliance Policy Bulk Assignment</p>*/}
            {/*                        <span className="text-xs text-muted-foreground">1 day ago</span>*/}
            {/*                    </div>*/}
            {/*                    <p className="text-xs text-muted-foreground">3 assignments require manual review due to policy conflicts</p>*/}
            {/*                </div>*/}
            {/*                <Badge variant="outline" className="text-orange-600 border-orange-600">Review Needed</Badge>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </CardContent>*/}
            {/*</Card>*/}

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-gray-50 to-yellow-50 dark:from-gray-900 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                                <Crown className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Transform Your Assignment Workflow</h3>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            Experience the power of automated bulk assignments with our premium Assignment Manager.
                            Reduce manual effort by 85% and achieve 10x faster processing with comprehensive validation.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" size="lg" asChild>
                                <a href="https://docs.intuneassistant.cloud" target="_blank" rel="noopener noreferrer">
                                    View Documentation
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                            {/*<Link href="/assistant/assignment-manager">*/}
                            {/*    <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold">*/}
                            {/*        <Crown className="mr-2 h-4 w-4" />*/}
                            {/*        Try Premium Feature*/}
                            {/*        <ArrowRight className="ml-2 h-4 w-4" />*/}
                            {/*    </Button>*/}
                            {/*</Link>*/}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
