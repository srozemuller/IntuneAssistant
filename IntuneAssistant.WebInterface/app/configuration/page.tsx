'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
    Settings,
    Smartphone,
    Shield,
    ArrowRight,
    Monitor,
    Layers,
    Zap,
    Target,
    Users,
    CheckCircle,
    FileText,
    BarChart3
} from 'lucide-react';

export default function DeviceConfigurationLandingPage() {
    const configurationBlocks = [
        {
            title: "Intune Policy Overview",
            description: "Comprehensive visibility into all your Intune policies with detailed analytics, compliance status, and deployment insights.",
            href: "/policies",
            icon: Shield,
            gradient: "from-blue-500 to-indigo-500",
            bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
            features: [
                "Complete policy inventory",
                "Compliance and deployment status",
                "Policy effectiveness analytics",
                "Backup your policies"
            ],
            badge: "POLICIES",
            highlight: "Most Popular"
        },
        {
            title: "Configuration Policies Settings Overview",
            description: "Deep dive into individual configuration policies with granular settings analysis, conflict detection, and optimization recommendations.",
            href: "/settings",
            icon: Settings,
            gradient: "from-emerald-500 to-cyan-500",
            bgGradient: "from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20",
            borderColor: "border-emerald-200 dark:border-emerald-800",
            features: [
                "Granular settings breakdown",
                "Configuration conflict detection (soon)",
                "Policy optimization insights",
                "Settings comparison tools"
            ],
            badge: "SETTINGS",
            highlight: "Advanced"
        }
    ];

    const quickFeatures = [
        {
            title: "Real-time Monitoring",
            description: "Monitor policy deployments and device compliance in real-time",
            icon: Monitor,
            color: "text-blue-600 dark:text-blue-400"
        },
        {
            title: "Multi-layered Analysis",
            description: "Analyze policies across different layers and platforms",
            icon: Layers,
            color: "text-purple-600 dark:text-purple-400"
        },
        {
            title: "Instant Insights",
            description: "Get immediate insights into configuration effectiveness",
            icon: Zap,
            color: "text-yellow-600 dark:text-yellow-400"
        },
        {
            title: "Targeted Optimization",
            description: "Optimize configurations for specific device groups",
            icon: Target,
            color: "text-green-600 dark:text-green-400"
        }
    ];

    const platformStats = [
        {
            platform: "Windows 10/11",
            policies: "156 Policies",
            compliance: "94.2%",
            icon: Monitor,
            color: "bg-blue-500"
        },
        {
            platform: "iOS/iPadOS",
            policies: "89 Policies",
            compliance: "96.8%",
            icon: Smartphone,
            color: "bg-gray-700"
        },
        {
            platform: "Android",
            policies: "124 Policies",
            compliance: "91.5%",
            icon: Smartphone,
            color: "bg-green-500"
        },
        {
            platform: "macOS",
            policies: "67 Policies",
            compliance: "97.1%",
            icon: Monitor,
            color: "bg-purple-500"
        }
    ];

    const deviceStats = [
        {
            platform: "Windows 10/11",
            devices: "2,847 Devices",
            compliance: "94.2%",
            icon: Monitor,
            color: "bg-blue-500"
        },
        {
            platform: "iOS/iPadOS",
            devices: "1,532 Devices",
            compliance: "96.8%",
            icon: Smartphone,
            color: "bg-gray-700"
        },
        {
            platform: "Android",
            devices: "987 Devices",
            compliance: "91.5%",
            icon: Smartphone,
            color: "bg-green-500"
        },
        {
            platform: "macOS",
            devices: "456 Devices",
            compliance: "97.1%",
            icon: Monitor,
            color: "bg-purple-500"
        }
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 p-8 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Monitor className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Configuration Management
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Configuration Management Center
                    </h1>
                    <p className="text-xl text-purple-100 mb-6 max-w-2xl">
                        Comprehensive Configuration oversight and policy management for your Microsoft Intune environment.
                        Monitor, analyze, and optimize your entire configuration with powerful analytics and insights.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold" asChild>
                            <Link href="/policies">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                View Policy Overview
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                            <Link href="https://docs.intuneassistant.cloud" target="_blank" rel="noopener noreferrer" className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                    View Documentation
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-white to-yellow-200 blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 blur-2xl"></div>
                </div>
            </div>

            {/* Quick Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickFeatures.map((feature, index) => (
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

            {/* Main Configuration Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {configurationBlocks.map((block, index) => (
                    <Card key={index} className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${block.borderColor}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${block.bgGradient}`}></div>

                        {/* Highlight Badge */}
                        {block.highlight && (
                            <div className="absolute top-4 right-4 z-20">
                                <Badge className="bg-yellow-400 text-yellow-900 font-medium">
                                    {block.highlight}
                                </Badge>
                            </div>
                        )}

                        <CardHeader className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-4 rounded-xl bg-gradient-to-br ${block.gradient} text-white shadow-lg`}>
                                    <block.icon className="h-7 w-7" />
                                </div>
                                <Badge variant="outline" className="font-medium text-xs px-3">
                                    {block.badge}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl font-bold mb-2">{block.title}</CardTitle>
                            <CardDescription className="text-base leading-relaxed">
                                {block.description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative z-10 pt-0">
                            <div className="space-y-4">
                                {/* Features List */}
                                <div className="space-y-3">
                                    {block.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center gap-3 text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <div className="pt-4 border-t border-border/50">
                                    <Link href={block.href} className="block">
                                        <Button className={`w-full bg-gradient-to-r ${block.gradient} text-white shadow-md hover:shadow-lg transition-all duration-200`}>
                                            Explore Now
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/*/!* Platform Statistics *!/*/}
            {/*<Card className="relative overflow-hidden">*/}
            {/*    <CardHeader>*/}
            {/*        <div className="flex items-center gap-3 mb-2">*/}
            {/*            <Globe className="h-6 w-6 text-primary" />*/}
            {/*            <CardTitle className="text-2xl">Platform Overview</CardTitle>*/}
            {/*        </div>*/}
            {/*        <CardDescription>*/}
            {/*            Configuration policies and compliance status across all supported platforms*/}
            {/*        </CardDescription>*/}
            {/*    </CardHeader>*/}
            {/*    <CardContent>*/}
            {/*        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">*/}
            {/*            {platformStats.map((stat, index) => (*/}
            {/*                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">*/}
            {/*                    <div className={`p-3 ${stat.color} rounded-lg text-white`}>*/}
            {/*                        <stat.icon className="h-5 w-5" />*/}
            {/*                    </div>*/}
            {/*                    <div>*/}
            {/*                        <h4 className="font-semibold text-sm">{stat.platform}</h4>*/}
            {/*                        <p className="text-xs text-muted-foreground">{stat.policies}</p>*/}
            {/*                        <div className="flex items-center gap-1 mt-1">*/}
            {/*                            <div className="w-2 h-2 rounded-full bg-green-500"></div>*/}
            {/*                            <span className="text-xs font-medium text-green-600">{stat.compliance}</span>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    </CardContent>*/}
            {/*</Card>*/}
            {/* Device Statistics */}

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-gray-50 to-yellow-50 dark:from-gray-900 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                                <Users className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Ready to Optimize Your Device Configurations?</h3>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            Take control of your Intune environment with advanced policy management and configuration optimization.
                            Start exploring our comprehensive tools and analytics to streamline your device governance.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" size="lg" asChild>
                                <a href="https://docs.intuneassistant.cloud" target="_blank" rel="noopener noreferrer">
                                    View Documentation
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                            <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold">
                                Get Started Now
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
