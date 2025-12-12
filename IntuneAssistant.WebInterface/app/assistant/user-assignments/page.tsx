"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Smartphone, Settings, ArrowRight, User, Shield } from "lucide-react";
import Link from "next/link";

const UserAssignmentsPage = () => {
    const userAssignmentBlocks = [
        {
            title: "Configuration Assignments",
            description: "View all Intune configuration policies and compliance assignments for a specific user based on group memberships and direct targeting.",
            href: "/assistant/user-config-assignments",
            icon: Settings,
            gradient: "from-indigo-500 to-blue-600",
            bgGradient: "from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20",
            borderColor: "border-indigo-200 dark:border-indigo-800",
            features: [
                "Configuration policies analysis",
                "Compliance policy targeting",
                "Security policy assignments",
                "Group-based targeting"
            ],
            badge: "CONFIG",
            stats: "Policies & Compliance"
        },
        {
            title: "Application Assignments",
            description: "Dedicated view for application assignments targeting a specific user through group memberships and 'All Users' targeting.",
            href: "/assistant/user-app-assignments",
            icon: Smartphone,
            gradient: "from-rose-500 to-orange-500",
            bgGradient: "from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20",
            borderColor: "border-rose-200 dark:border-rose-800",
            features: [
                "User-specific app assignments",
                "Required & Available apps",
                "Group-based app targeting",
                "All Users assignment inclusion"
            ],
            badge: "APPS",
            stats: "Applications & Store Apps"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                        User Assignment Analytics
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Analyze and explore all Intune assignments for specific users. Get comprehensive insights into
                        configuration policies and application assignments based on user group memberships and direct targeting.
                    </p>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="flex items-center space-x-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Group Analysis</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Analyze user group memberships</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Assignment Targeting</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Direct and group-based targeting</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Comprehensive View</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">All policies and applications</p>
                        </div>
                    </div>
                </div>

                {/* Assignment Type Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {userAssignmentBlocks.map((block, index) => {
                        const IconComponent = block.icon;

                        return (
                            <Card
                                key={index}
                                className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${block.borderColor} bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${block.bgGradient} opacity-50`} />

                                <CardHeader className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${block.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                        <Badge variant="secondary" className="font-medium">
                                            {block.badge}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {block.title}
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                                        {block.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="relative">
                                    <div className="space-y-3 mb-6">
                                        {block.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
                                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {block.stats}
                                        </div>
                                        <Button
                                            asChild
                                            className={`bg-gradient-to-r ${block.gradient} hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-white border-0`}
                                        >
                                            <Link href={block.href} className="flex items-center space-x-2">
                                                <span>Explore</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Call to Action */}
                <div className="text-center mt-16">
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Ready to analyze user assignments?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                            Choose between configuration policies or application assignments to get detailed insights
                            into how Intune policies and apps are assigned to your users.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAssignmentsPage;