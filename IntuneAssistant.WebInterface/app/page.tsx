'use client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    LayoutDashboard,
    Search,
    Sparkles,
    CirclePlay,
    LineChart,
    CheckCircle,
    ArrowRight,
    Shield,
    Database,
    TrendingUp,
    Zap
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-yellow-500 via-yellow-400 to-blue-500">

            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between py-16 md:py-24 gap-8 relative">
                    <div className="flex flex-col space-y-6 max-w-[640px] text-white">
                        <div className="inline-block">
                            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Now available for all Intune admins
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                            Revolutionize <span className="text-yellow-300">Intune Management</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                            Intune Assistant empowers administrators to manage Microsoft Intune with unparalleled efficiency,
                            providing clear insights and streamlined management processes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 shadow-xl">
                                Get Started Free
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="relative w-full md:w-1/2 flex justify-center">
                        <div className="relative w-full max-w-[550px] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/20">
                            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                                <div className="text-center text-white/60">
                                    <LayoutDashboard className="w-24 h-24 mx-auto mb-4" />
                                    <p>Dashboard Preview</p>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900">
                            Powerful Features
                        </h2>
                        <p className="mt-4 text-xl text-gray-600">Everything you need to master Intune management</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <Card className="relative hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Assistant</Badge>
                            </div>
                            <CardHeader>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                    <LayoutDashboard className="text-blue-600" size={24} />
                                </div>
                                <CardTitle className="text-xl">Intune Global Overviews</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">
                                    Get a comprehensive overview of your Intune environment with actionable insights at a glance.
                                </CardDescription>
                                <Link href="/assistant" className="text-blue-600 font-medium inline-flex items-center hover:text-blue-800">
                                    Learn more
                                    <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="relative hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Rollout</Badge>
                            </div>
                            <CardHeader>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                    <CirclePlay className="text-green-600" size={24} />
                                </div>
                                <CardTitle className="text-xl">Rollout Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">
                                    Plan, schedule, and track phased rollouts of policies and configurations across your organization.
                                </CardDescription>
                                <Link href="/app/deployment" className="text-green-600 font-medium inline-flex items-center hover:text-green-800">
                                    Learn more
                                    <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="relative hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-amber-500">
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Coming Soon</Badge>
                            </div>
                            <CardHeader>
                                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                                    <Sparkles className="text-amber-600" size={24} />
                                </div>
                                <CardTitle className="text-xl">Automated Remediation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">
                                    Fix common issues with one-click remediation powered by intelligent automation.
                                </CardDescription>
                                <span className="text-amber-600 font-medium inline-flex items-center">
                  Announced
                  <Zap className="ml-1 w-4 h-4" />
                </span>
                            </CardContent>
                        </Card>

                        {/* Additional Features */}
                        <Card className="relative hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Coming Soon</Badge>
                            </div>
                            <CardHeader>
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                                    <TrendingUp className="text-purple-600" size={24} />
                                </div>
                                <CardTitle className="text-xl">Track & Trace</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">
                                    Track and trace changes in your Intune environment using historic data.
                                </CardDescription>
                                <span className="text-purple-600 font-medium inline-flex items-center">
                  Announced
                  <Zap className="ml-1 w-4 h-4" />
                </span>
                            </CardContent>
                        </Card>

                        <Card className="relative hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-indigo-500">
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">Coming Soon</Badge>
                            </div>
                            <CardHeader>
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                                    <Search className="text-indigo-600" size={24} />
                                </div>
                                <CardTitle className="text-xl">Advanced Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">
                                    Dive deep into your data with powerful analytics that help identify issues and optimization opportunities.
                                </CardDescription>
                                <span className="text-indigo-600 font-medium inline-flex items-center">
                  Announced
                  <Zap className="ml-1 w-4 h-4" />
                </span>
                            </CardContent>
                        </Card>

                        <Card className="relative hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-rose-500">
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200">Coming Soon</Badge>
                            </div>
                            <CardHeader>
                                <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                                    <LineChart className="text-rose-600" size={24} />
                                </div>
                                <CardTitle className="text-xl">Comprehensive Reporting</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">
                                    Generate detailed reports on device compliance, app deployment, and security posture.
                                </CardDescription>
                                <span className="text-rose-600 font-medium inline-flex items-center">
                  Announced
                  <Zap className="ml-1 w-4 h-4" />
                </span>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How to Get Started Section */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900">
                            Get Started in Minutes
                        </h2>
                        <p className="mt-4 text-xl text-gray-600">Simple steps to transform your Intune management</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative flex flex-col items-center text-center">
                            <div className="absolute -top-4 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                1
                            </div>
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                <Users className="text-yellow-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Create Your Account</h3>
                            <p className="text-gray-600">Sign up with your Microsoft account for seamless integration with your tenant.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex flex-col items-center text-center">
                            <div className="absolute -top-4 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                2
                            </div>
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                <Shield className="text-yellow-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Connect Your Tenant</h3>
                            <p className="text-gray-600">Grant necessary permissions to allow Intune Assistant to analyze your environment.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex flex-col items-center text-center">
                            <div className="absolute -top-4 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                3
                            </div>
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                <CheckCircle className="text-yellow-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Start Optimizing</h3>
                            <p className="text-gray-600">Access your dashboard and begin exploring insights and recommendations.</p>
                        </div>
                    </div>

                    <div className="flex justify-center mt-12">
                        <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 shadow-lg">
                            Start Your Free Onboarding
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-gradient-to-r from-yellow-500 via-yellow-400 to-blue-500 text-white">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
                        Ready to Transform Your Intune Management?
                    </h2>
                    <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                        Join thousands of IT administrators who have already streamlined their Intune operations with our powerful platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 shadow-xl">
                            Get Started Free
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        {/*<Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">*/}
                        {/*    Schedule Demo*/}
                        {/*</Button>*/}
                    </div>
                </div>
            </section>
        </div>
    );
}
