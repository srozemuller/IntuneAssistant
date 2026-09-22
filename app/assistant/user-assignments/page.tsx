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
                                    href: "/assistant/user-assignments/configuration",
                                    icon: Settings,
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
                                    href: "/assistant/user-assignments/apps",
                                    icon: Smartphone,
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
                                <div className="min-h-screen">
                                    <div className="container mx-auto px-6 py-12">
                                        {/* Header Section */}
                                        <div className="text-center mb-16">
                                            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/90 backdrop-blur-sm rounded-2xl mb-6 shadow-lg hover:scale-105 transition-transform duration-300">
                                                <User className="w-10 h-10 text-primary-foreground" />
                                            </div>
                                            <h1 className="text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
                                                User Assignment Analytics
                                            </h1>
                                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                                Analyze and explore all Intune assignments for specific users. Get comprehensive insights into
                                                configuration policies and application assignments based on user group memberships and direct targeting.
                                            </p>
                                        </div>

                                        {/* Feature Highlights */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                                            <div className="glass-card flex items-center space-x-3 p-4 hover:shadow-xl">
                                                <div className="w-10 h-10 bg-primary/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                    <Shield className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">Group Analysis</h3>
                                                    <p className="text-sm text-muted-foreground">Analyze user group memberships</p>
                                                </div>
                                            </div>
                                            <div className="glass-card flex items-center space-x-3 p-4 hover:shadow-xl">
                                                <div className="w-10 h-10 bg-primary/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">Assignment Targeting</h3>
                                                    <p className="text-sm text-muted-foreground">Direct and group-based targeting</p>
                                                </div>
                                            </div>
                                            <div className="glass-card flex items-center space-x-3 p-4 hover:shadow-xl">
                                                <div className="w-10 h-10 bg-primary/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                    <Settings className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">Comprehensive View</h3>
                                                    <p className="text-sm text-muted-foreground">All policies and applications</p>
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
                                                        className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10"
                                                    >
                                                        <CardHeader className="bg-transparent">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="w-12 h-12 bg-primary/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg hover:rotate-6 transition-transform duration-300 border border-primary/20">
                                                                    <IconComponent className="w-6 h-6 text-primary" />
                                                                </div>
                                                                <Badge variant="secondary" className="font-medium backdrop-blur-sm bg-primary/10 border-primary/20">
                                                                    {block.badge}
                                                                </Badge>
                                                            </div>
                                                            <CardTitle className="text-2xl font-bold text-foreground">
                                                                {block.title}
                                                            </CardTitle>
                                                            <CardDescription className="text-base leading-relaxed text-muted-foreground">
                                                                {block.description}
                                                            </CardDescription>
                                                        </CardHeader>

                                                        <CardContent className="bg-transparent">
                                                            <div className="space-y-3 mb-6">
                                                                {block.features.map((feature, idx) => (
                                                                    <div key={idx} className="flex items-center space-x-3 group">
                                                                        <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform duration-200" />
                                                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">{feature}</span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="flex items-center justify-between pt-4 border-t border-border/30">
                                                                <div className="text-sm text-muted-foreground font-medium">
                                                                    {block.stats}
                                                                </div>
                                                                <Button asChild className="hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl bg-primary/90 hover:bg-primary text-primary-foreground">
                                                                    <Link href={block.href} className="flex items-center space-x-2">
                                                                        <span>Explore</span>
                                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                                            <div className="glass-card p-8 hover:shadow-2xl transition-all duration-300">
                                                <h3 className="text-2xl font-bold mb-4">
                                                    Ready to analyze user assignments?
                                                </h3>
                                                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
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