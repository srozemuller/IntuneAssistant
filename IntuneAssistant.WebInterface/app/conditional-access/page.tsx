'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Lock,
    Users,
    ArrowRight,
    Eye,
    AlertTriangle,
    CheckCircle,
    FileText,
    BarChart3,
    Globe,
    Smartphone,
    Monitor,
    Key,
    UserCheck,
    Clock
} from 'lucide-react';

export default function ConditionalAccessLandingPage() {
    const securityFeatures = [
        {
            title: "Policy Monitoring",
            description: "Real-time monitoring of conditional access policy effectiveness",
            icon: Eye,
            color: "text-blue-600 dark:text-blue-400"
        },
        {
            title: "Risk Assessment",
            description: "Identify and assess security risks across your environment",
            icon: AlertTriangle,
            color: "text-orange-600 dark:text-orange-400"
        },
        {
            title: "Compliance Tracking",
            description: "Track policy compliance and enforcement across all users",
            icon: CheckCircle,
            color: "text-green-600 dark:text-green-400"
        },
        {
            title: "Access Analytics",
            description: "Detailed analytics on access patterns and policy effectiveness",
            icon: BarChart3,
            color: "text-purple-600 dark:text-purple-400"
        }
    ];

    const accessScenarios = [
        {
            scenario: "Multi-Factor Authentication",
            policies: "24 Active Policies",
            coverage: "98.5%",
            icon: Key,
            color: "bg-green-500"
        },
        {
            scenario: "Device Compliance",
            policies: "18 Active Policies",
            coverage: "94.2%",
            icon: Smartphone,
            color: "bg-blue-500"
        },
        {
            scenario: "Location-Based Access",
            policies: "12 Active Policies",
            coverage: "87.8%",
            icon: Globe,
            color: "bg-purple-500"
        },
        {
            scenario: "Application Protection",
            policies: "31 Active Policies",
            coverage: "96.1%",
            icon: Shield,
            color: "bg-orange-500"
        }
    ];

    const policyHighlights = [
        {
            title: "Active Policies",
            value: "47",
            subtitle: "Currently enforced",
            trend: "+3 this month",
            icon: Shield,
            color: "text-green-600"
        },
        {
            title: "Protected Users",
            value: "1,247",
            subtitle: "Under CA protection",
            trend: "98.5% coverage",
            icon: UserCheck,
            color: "text-blue-600"
        },
        {
            title: "Blocked Attempts",
            value: "156",
            subtitle: "Last 30 days",
            trend: "↓ 12% from last month",
            icon: Lock,
            color: "text-red-600"
        },
        {
            title: "Policy Violations",
            value: "23",
            subtitle: "Requiring attention",
            trend: "2 critical",
            icon: AlertTriangle,
            color: "text-orange-600"
        }
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-8 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Shield className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Conditional Access
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Conditional Access Control Center
                    </h1>
                    <p className="text-xl text-orange-100 mb-6 max-w-2xl">
                        Secure your organization with intelligent conditional access policies. Monitor, analyze, and optimize
                        your Microsoft Entra ID conditional access implementation for maximum security and user experience.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/conditional-access/policies">
                            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold">
                                <Shield className="mr-2 h-4 w-4" />
                                View Policies
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-white to-yellow-200 blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br from-orange-200 to-red-300 blur-2xl"></div>
                </div>
            </div>

            {/* Security Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {securityFeatures.map((feature, index) => (
                    <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${feature.color}`}>
                                    <feature.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/*/!* Policy Highlights *!/*/}
            {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">*/}
            {/*    {policyHighlights.map((highlight, index) => (*/}
            {/*        <Card key={index} className="relative overflow-hidden">*/}
            {/*            <CardContent className="p-6">*/}
            {/*                <div className="flex items-center justify-between mb-4">*/}
            {/*                    <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${highlight.color}`}>*/}
            {/*                        <highlight.icon className="h-5 w-5" />*/}
            {/*                    </div>*/}
            {/*                    <div className="text-right">*/}
            {/*                        <div className="text-2xl font-bold">{highlight.value}</div>*/}
            {/*                        <div className="text-sm text-muted-foreground">{highlight.subtitle}</div>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*                <div className="flex items-center justify-between">*/}
            {/*                    <h3 className="font-semibold text-sm">{highlight.title}</h3>*/}
            {/*                    <div className="text-xs text-muted-foreground">{highlight.trend}</div>*/}
            {/*                </div>*/}
            {/*            </CardContent>*/}
            {/*        </Card>*/}
            {/*    ))}*/}
            {/*</div>*/}

            {/* Main Policy Overview Section */}
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] border-orange-200 dark:border-orange-800">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"></div>

                {/* Highlight Badge */}
                <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-yellow-400 text-yellow-900 font-medium">
                        Essential
                    </Badge>
                </div>

                <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                            <Shield className="h-7 w-7" />
                        </div>
                        <Badge variant="outline" className="font-medium text-xs px-3">
                            SECURITY
                        </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2">Conditional Access Policy Overview</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                        Comprehensive analysis and management of all conditional access policies across your Microsoft Entra ID environment.
                        Monitor policy effectiveness, user impact, and security compliance in real-time.
                    </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 pt-0">
                    <div className="space-y-6">
                        {/* Features List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Complete policy inventory and status</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Real-time enforcement monitoring</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">User and group assignments analysis</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Policy conflict detection</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Security posture assessment</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">Optimization recommendations</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-4 border-t border-border/50">
                            <Link href="/conditional-access/policies" className="block">
                                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:shadow-lg transition-all duration-200">
                                    Analyze Policies Now
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/*/!* Access Scenarios Overview *!/*/}
            {/*<Card className="relative overflow-hidden">*/}
            {/*    <CardHeader>*/}
            {/*        <div className="flex items-center gap-3 mb-2">*/}
            {/*            <Lock className="h-6 w-6 text-primary" />*/}
            {/*            <CardTitle className="text-2xl">Access Control Scenarios</CardTitle>*/}
            {/*        </div>*/}
            {/*        <CardDescription>*/}
            {/*            Policy coverage across different conditional access scenarios and use cases*/}
            {/*        </CardDescription>*/}
            {/*    </CardHeader>*/}
            {/*    <CardContent>*/}
            {/*        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">*/}
            {/*            {accessScenarios.map((scenario, index) => (*/}
            {/*                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">*/}
            {/*                    <div className={`p-3 ${scenario.color} rounded-lg text-white`}>*/}
            {/*                        <scenario.icon className="h-5 w-5" />*/}
            {/*                    </div>*/}
            {/*                    <div>*/}
            {/*                        <h4 className="font-semibold text-sm">{scenario.scenario}</h4>*/}
            {/*                        <p className="text-xs text-muted-foreground">{scenario.policies}</p>*/}
            {/*                        <div className="flex items-center gap-1 mt-1">*/}
            {/*                            <div className="w-2 h-2 rounded-full bg-green-500"></div>*/}
            {/*                            <span className="text-xs font-medium text-green-600">{scenario.coverage}</span>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    </CardContent>*/}
            {/*</Card>*/}

            {/*/!* Recent Activity & Insights *!/*/}
            {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">*/}
            {/*    <Card>*/}
            {/*        <CardHeader>*/}
            {/*            <CardTitle className="flex items-center gap-2">*/}
            {/*                <Clock className="h-5 w-5" />*/}
            {/*                Recent Activity*/}
            {/*            </CardTitle>*/}
            {/*        </CardHeader>*/}
            {/*        <CardContent>*/}
            {/*            <div className="space-y-4">*/}
            {/*                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">*/}
            {/*                    <CheckCircle className="h-4 w-4 text-green-600" />*/}
            {/*                    <div className="flex-1">*/}
            {/*                        <p className="text-sm font-medium">MFA Policy Updated</p>*/}
            {/*                        <p className="text-xs text-muted-foreground">Applied to Finance group - 2 hours ago</p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">*/}
            {/*                    <AlertTriangle className="h-4 w-4 text-orange-600" />*/}
            {/*                    <div className="flex-1">*/}
            {/*                        <p className="text-sm font-medium">Policy Conflict Detected</p>*/}
            {/*                        <p className="text-xs text-muted-foreground">Device compliance overlap - 4 hours ago</p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">*/}
            {/*                    <Users className="h-4 w-4 text-blue-600" />*/}
            {/*                    <div className="flex-1">*/}
            {/*                        <p className="text-sm font-medium">New Users Enrolled</p>*/}
            {/*                        <p className="text-xs text-muted-foreground">47 users added to CA scope - 6 hours ago</p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </CardContent>*/}
            {/*    </Card>*/}

            {/*    <Card>*/}
            {/*        <CardHeader>*/}
            {/*            <CardTitle className="flex items-center gap-2">*/}
            {/*                <BarChart3 className="h-5 w-5" />*/}
            {/*                Security Insights*/}
            {/*            </CardTitle>*/}
            {/*        </CardHeader>*/}
            {/*        <CardContent>*/}
            {/*            <div className="space-y-4">*/}
            {/*                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">*/}
            {/*                    <div>*/}
            {/*                        <p className="text-sm font-medium">Legacy Auth Blocked</p>*/}
            {/*                        <p className="text-xs text-muted-foreground">Last 7 days</p>*/}
            {/*                    </div>*/}
            {/*                    <div className="text-right">*/}
            {/*                        <p className="text-lg font-bold text-green-600">342</p>*/}
            {/*                        <p className="text-xs text-muted-foreground">↑ 15%</p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">*/}
            {/*                    <div>*/}
            {/*                        <p className="text-sm font-medium">Risk-based Sign-ins</p>*/}
            {/*                        <p className="text-xs text-muted-foreground">High risk detected</p>*/}
            {/*                    </div>*/}
            {/*                    <div className="text-right">*/}
            {/*                        <p className="text-lg font-bold text-red-600">12</p>*/}
            {/*                        <p className="text-xs text-muted-foreground">↓ 23%</p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">*/}
            {/*                    <div>*/}
            {/*                        <p className="text-sm font-medium">MFA Success Rate</p>*/}
            {/*                        <p className="text-xs text-muted-foreground">Overall completion</p>*/}
            {/*                    </div>*/}
            {/*                    <div className="text-right">*/}
            {/*                        <p className="text-lg font-bold text-blue-600">97.8%</p>*/}
            {/*                        <p className="text-xs text-muted-foreground">↑ 2%</p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </CardContent>*/}
            {/*    </Card>*/}
            {/*</div>*/}

            {/*/!* Call to Action *!/*/}
            {/*<Card className="bg-gradient-to-r from-gray-50 to-yellow-50 dark:from-gray-900 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800">*/}
            {/*    <CardContent className="p-8">*/}
            {/*        <div className="text-center">*/}
            {/*            <div className="flex justify-center mb-4">*/}
            {/*                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">*/}
            {/*                    <Shield className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*            <h3 className="text-2xl font-bold mb-4">Strengthen Your Security Posture</h3>*/}
            {/*            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">*/}
            {/*                Take control of your conditional access environment with comprehensive policy analysis and optimization tools.*/}
            {/*                Ensure maximum security while maintaining excellent user experience.*/}
            {/*            </p>*/}
            {/*            <div className="flex flex-wrap justify-center gap-4">*/}
            {/*                <Button variant="outline" size="lg" asChild>*/}
            {/*                    <a href="https://docs.intuneassistant.cloud" target="_blank" rel="noopener noreferrer">*/}
            {/*                        Security Documentation*/}
            {/*                        <ArrowRight className="ml-2 h-4 w-4" />*/}
            {/*                    </a>*/}
            {/*                </Button>*/}
            {/*                <Link href="/assistant/conditional-access-policies">*/}
            {/*                    <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold">*/}
            {/*                        Analyze Policies*/}
            {/*                        <ArrowRight className="ml-2 h-4 w-4" />*/}
            {/*                    </Button>*/}
            {/*                </Link>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </CardContent>*/}
            {/*</Card>*/}
        </div>
    );
}
