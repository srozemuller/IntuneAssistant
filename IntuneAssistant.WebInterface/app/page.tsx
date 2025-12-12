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
    Zap,
    Info,
    FileText,
    Wrench,
    GitBranch,
    Monitor,
    Key,
    ArrowLeftRight
} from 'lucide-react';
import Link from 'next/link';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export default function LandingPage() {
    return (
        <TooltipProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 dark:from-gray-900 dark:to-gray-950">
                    <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between py-16 md:py-24 gap-8">
                        <div className="flex flex-col space-y-6 max-w-[640px] text-white">
                            <div className="inline-block">
                                <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Free for all Intune administrators
                                </Badge>
                            </div>
                            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                                Revolutionize <span className="text-blue-200">Intune Management</span>
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                                A comprehensive community platform for Microsoft Intune administrators. <u>Core features remain completely free</u>.
                                <br/> Optional business modules available for organizations requiring automation, business logic and reporting.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/onboarding/customer">
                                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                        Start here
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative w-full md:w-1/2 flex justify-center">
                            <div className="relative w-full max-w-[550px] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
                                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <LayoutDashboard className="w-24 h-24 mx-auto mb-4" />
                                        <p>Dashboard Preview</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>



                {/* Features Section */}
                <section className="relative py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-white/[0.02] bg-[size:60px_60px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent dark:from-slate-900/50 dark:to-transparent" />

                    {/* Modern geometric elements */}
                    <div className="absolute top-16 left-8 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-32 right-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-24 left-1/3 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-8 right-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>

                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900 dark:text-white">
                                Complete Intune Management Platform
                            </h2>
                            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                                Full-featured community tools with optional business modules for enterprise needs
                            </p>
                        </div>

                        {/* Community Features */}
                        <div className="mb-16">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Features</h3>
                                <p className="text-gray-600 dark:text-gray-300">Always free, always available, no limitations</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
                                                <LayoutDashboard className="text-green-600" size={24} />
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 shadow-sm">Community</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Global Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            Comprehensive dashboard showing assignments, devices, policies, and conditional access across your Intune environment.
                                        </CardDescription>
                                        <Link href="/" className="text-green-600 font-medium inline-flex items-center hover:text-green-800">
                                            Explore overview
                                            <ArrowRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
                                                <GitBranch className="text-green-600" size={24} />
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 shadow-sm">Community</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Assignment Management</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            View and manage all your Intune assignments including applications, policies, and compliance settings across groups.
                                        </CardDescription>
                                        <Link href="/assistant" className="text-green-600 font-medium inline-flex items-center hover:text-green-800">
                                            Manage assignments
                                            <ArrowRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
                                                <Monitor className="text-green-600" size={24} />
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 shadow-sm">Community</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Device & Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            Monitor device compliance, configuration policies, and security settings across your organization.
                                        </CardDescription>
                                        <Link href="/devices" className="text-green-600 font-medium inline-flex items-center hover:text-green-800">
                                            Manage devices
                                            <ArrowRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
                                                <Key className="text-green-600" size={24} />
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 shadow-sm">Community</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Conditional Access</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            Review and analyze conditional access policies to ensure proper security controls and user access.
                                        </CardDescription>
                                        <Link href="/conditional-access" className="text-green-600 font-medium inline-flex items-center hover:text-green-800">
                                            Review policies
                                            <ArrowRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
                                                <ArrowLeftRight className="text-green-600" size={24} />
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 shadow-sm">Community</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Policy Comparison</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            Compare policies and settings across different environments to identify differences and optimize configurations.
                                        </CardDescription>
                                        <Link href="/compare" className="text-green-600 font-medium inline-flex items-center hover:text-green-800">
                                            Compare policies
                                            <ArrowRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
                                                <FileText className="text-green-600" size={24} />
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 shadow-sm">Community</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Documentation Generator</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            Automatically generate comprehensive documentation for your Intune policies and configurations.
                                        </CardDescription>
                                        <span className="text-green-600 font-medium inline-flex items-center">
                    Coming soon
                    <Sparkles className="ml-1 w-4 h-4" />
                </span>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Business Modules */}
                        <div>
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Extensions</h3>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-5 h-5 text-gray-500 hover:text-gray-700" />
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
                                <p className="text-gray-600 dark:text-gray-300">Optional modules for enterprise automation, business logic and reporting needs. These modules do have human support.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
                                                <CirclePlay className="text-blue-600" size={24} />
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-700 shadow-sm">Licensed</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Assignment Manager</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            Automate assignment deployments with intelligent scheduling, phased rollouts, and automatic rollback capabilities.
                                        </CardDescription>
                                        <Link href="/deployment" className="text-blue-600 font-medium inline-flex items-center hover:text-blue-800">
                                            Learn more
                                            <ArrowRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
                                                <LineChart className="text-blue-600" size={24} />
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-700 shadow-sm">Licensed</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Comprehensive Reporting</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            Generate detailed compliance reports, deployment analytics, and executive dashboards with scheduled delivery.
                                        </CardDescription>
                                        <span className="text-blue-600 font-medium inline-flex items-center">
                    Coming soon
                    <Sparkles className="ml-1 w-4 h-4" />
                </span>
                                    </CardContent>
                                </Card>

                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
                                                <Search className="text-blue-600" size={24} />
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-700 shadow-sm">Licensed</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Track & Trace</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            Monitor configuration changes over time with detailed audit trails and impact analysis across your environment.
                                        </CardDescription>
                                        <span className="text-blue-600 font-medium inline-flex items-center">
                    Coming soon
                    <Sparkles className="ml-1 w-4 h-4" />
                </span>
                                    </CardContent>
                                </Card>

                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
                                                <TrendingUp className="text-blue-600" size={24} />
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-700 shadow-sm">Licensed</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Advanced Analytics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            Deep insights into deployment success rates, user adoption patterns, and predictive analytics for proactive management.
                                        </CardDescription>
                                        <span className="text-blue-600 font-medium inline-flex items-center">
                    Coming soon
                    <Sparkles className="ml-1 w-4 h-4" />
                </span>
                                    </CardContent>
                                </Card>

                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
                                                <Zap className="text-blue-600" size={24} />
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-700 shadow-sm">Licensed</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Automation Engine</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            Create custom automation workflows for routine tasks, policy updates, and compliance remediation.
                                        </CardDescription>
                                        <span className="text-blue-600 font-medium inline-flex items-center">
                    Coming soon
                    <Sparkles className="ml-1 w-4 h-4" />
                </span>
                                    </CardContent>
                                </Card>

                                <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500 dark:bg-gray-800/80 dark:border-gray-700 backdrop-blur-sm bg-white/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
                                                <Wrench className="text-blue-700" size={24} />
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-700 shadow-sm">Licensed</Badge>
                                        </div>
                                        <CardTitle className="text-xl">Troubleshoot Helper</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            Get intelligent suggestions and step-by-step guidance for resolving common Intune issues.
                                        </CardDescription>
                                        <span className="text-blue-600 font-medium inline-flex items-center">
                    Coming soon
                    <Sparkles className="ml-1 w-4 h-4" />
                </span>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                    </div>
                </section>


                {/* How to Get Started Section */}
                <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900 dark:text-white">
                                Get Started in Minutes
                            </h2>
                            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Simple steps to access your complete Intune management platform</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="relative flex flex-col items-center text-center">
                                <div className="absolute -top-4 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                    1
                                </div>
                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                    <Users className="text-yellow-400" size={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Create Your Account</h3>
                                <p className="text-gray-600 dark:text-gray-300">Sign up with your Microsoft account for seamless integration with your tenant.</p>
                            </div>

                            <div className="relative flex flex-col items-center text-center">
                                <div className="absolute -top-4 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                    2
                                </div>
                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                    <Shield className="text-yellow-400" size={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Connect Your Tenant</h3>
                                <p className="text-gray-600 dark:text-gray-300">Grant necessary permissions to allow Intune Assistant to analyze your environment.</p>
                            </div>

                            <div className="relative flex flex-col items-center text-center">
                                <div className="absolute -top-4 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                    3
                                </div>
                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                    <CheckCircle className="text-yellow-400" size={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Start Managing</h3>
                                <p className="text-gray-600 dark:text-gray-300">Access your complete dashboard and begin exploring all community features immediately.</p>
                            </div>
                        </div>

                        <div className="flex justify-center mt-12">
                            <Link href="/onboarding/customer">
                                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg">
                                    Start here
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
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
                            Join thousands of IT administrators who rely on our comprehensive, community-driven platform
                            for their daily Intune operations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/onboarding/customer">
                                <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 shadow-xl">
                                    Start Free Today
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </TooltipProvider>
    );
}
