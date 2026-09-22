'use client';

import Link from 'next/link';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import {
    ArrowRight,
    ArchiveRestore,
    BookOpen,
    Eye,
    FileStack,
    GitBranch,
    Github,
    Gift,
    Layers,
    LogIn,
    Megaphone,
    Monitor,
    ScrollText,
    ShieldUser,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCustomer } from '@/contexts/CustomerContext';
import { loginRequest } from '@/lib/msalConfig';

const features = [
    {
        title: 'Assignments',
        question: 'Who gets this policy or app?',
        description: 'Through direct, group and nested assignments.',
        href: '/assistant',
        icon: GitBranch,
        gradient: 'from-blue-500 to-cyan-500',
        accent: 'border-l-blue-500',
        iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    },
    {
        title: 'Devices',
        question: 'What is on this device?',
        description: 'Every managed device, and how two of them compare.',
        href: '/devices',
        icon: Monitor,
        gradient: 'from-amber-500 to-orange-500',
        accent: 'border-l-amber-500',
        iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    },
    {
        title: 'Policies',
        question: 'Which policies and settings do I have?',
        description: 'Configuration policies, settings and Conditional Access.',
        href: '/configuration',
        icon: FileStack,
        gradient: 'from-orange-500 to-red-500',
        accent: 'border-l-orange-500',
        iconBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
    },
    {
        title: 'Admin roles',
        question: 'Who are my Intune administrators?',
        description: 'Direct and nested Intune Administrator role holders.',
        href: '/rbac/intune-admin-analyzer',
        icon: ShieldUser,
        gradient: 'from-indigo-500 to-blue-500',
        accent: 'border-l-indigo-500',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    },
    {
        title: 'Settings Library',
        question: 'What can a setting in the catalog do?',
        description: 'Search the full Intune Settings Catalog and its history.',
        href: '/settings-library',
        icon: Layers,
        gradient: 'from-teal-500 to-cyan-500',
        accent: 'border-l-teal-500',
        iconBg: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400',
    },
    {
        title: 'Audit Events',
        question: 'What changed, by whom and when?',
        description: 'Live activity from across your tenant.',
        href: '/audit-events',
        icon: ScrollText,
        gradient: 'from-purple-500 to-violet-500',
        accent: 'border-l-purple-500',
        iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    },
    {
        title: 'Backup',
        question: 'Can I get a copy of my configuration?',
        description: 'Export your Intune configuration to a file, any time.',
        href: '/configuration/backup',
        icon: ArchiveRestore,
        gradient: 'from-emerald-500 to-green-500',
        accent: 'border-l-emerald-500',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    },
    {
        title: 'Service announcements',
        question: 'What is Microsoft announcing?',
        description: "What Microsoft is changing in Intune, before it reaches you.",
        href: '/service-announcements',
        icon: Megaphone,
        gradient: 'from-rose-500 to-pink-500',
        accent: 'border-l-rose-500',
        iconBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
    },
];

const steps = [
    { title: 'Sign in', text: 'Use the Microsoft work account of the tenant you want to look at.' },
    { title: 'Connect your tenant', text: 'A Global Administrator approves read-only access, once.' },
    { title: 'Start exploring', text: 'Ask your tenant a question and get an answer in seconds.' },
];

function FeatureCard({ feature }: { feature: (typeof features)[number] }) {
    const Icon = feature.icon;
    return (
        <Link href={feature.href} className="group focus-visible:outline-none">
            <div className="h-full rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group-focus-visible:shadow-xl group-focus-visible:-translate-y-0.5">
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-md flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm font-medium text-foreground/80 mt-1">{feature.question}</p>
                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-3">
                    Open
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
            </div>
        </Link>
    );
}

function SignedOutHome() {
    const { instance, inProgress } = useMsal();
    const busy = inProgress !== InteractionStatus.None;

    return (
        <div className="space-y-16 pb-8 -m-6">
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 dark:from-gray-950 dark:via-blue-950 dark:to-gray-950">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-cyan-300 to-blue-300 blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 blur-3xl" />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:py-28 space-y-6">
                    <div className="flex flex-wrap gap-2">
                        <Badge className="bg-white/15 text-white border-white/25 hover:bg-white/20 gap-1"><Gift className="h-3 w-3" />Free</Badge>
                        <Badge className="bg-white/15 text-white border-white/25 hover:bg-white/20 gap-1"><Eye className="h-3 w-3" />Read-only</Badge>
                        <Badge className="bg-white/15 text-white border-white/25 hover:bg-white/20 gap-1"><Github className="h-3 w-3" />Open source</Badge>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                        See what is really configured in your Intune tenant.
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-2xl leading-relaxed">
                        IntuneAssistant is a free community tool for Intune administrators. It shows you what is assigned
                        to whom, what is on a device and which policies you have. It only reads your tenant and never
                        changes anything.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button size="lg" disabled={busy} className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => instance.loginRedirect(loginRequest)}>
                            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                            Sign in with Microsoft
                        </Button>
                        <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 hover:text-white" asChild>
                            <Link href="/onboarding/register">
                                New here? Get started
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">Up and running in three steps</h2>
                <ol className="grid gap-4 sm:grid-cols-3">
                    {steps.map((step, index) => (
                        <li key={step.title} className="rounded-lg border p-5 space-y-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                                {index + 1}
                            </span>
                            <h3 className="font-semibold">{step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="max-w-7xl mx-auto px-6 space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Everything, always free</h2>
                    <p className="text-muted-foreground mt-1">No tiers, no locked features. Everything IntuneAssistant does is here.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {features.map(feature => (
                        <FeatureCard key={feature.href} feature={feature} />
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6">
                <div className="rounded-lg border p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="space-y-1">
                        <h2 className="font-semibold">Want to know exactly what it can access?</h2>
                        <p className="text-sm text-muted-foreground">
                            The permissions, the data we keep and how to remove access are all explained on one page.
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button variant="outline" asChild>
                            <Link href="/security">Privacy &amp; security</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <a href="https://docs.intuneassistant.cloud" target="_blank" rel="noopener noreferrer">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Docs
                            </a>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function SetupHome({ nextHref, title, text, cta }: { nextHref: string; title: string; text: string; cta: string }) {
    return (
        <div className="max-w-xl mx-auto py-16 space-y-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{text}</p>
            <Button size="lg" asChild>
                <Link href={nextHref}>
                    {cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
            </Button>
        </div>
    );
}

function ReadyHome({ firstName, tenantDomain }: { firstName: string; tenantDomain: string | null }) {
    return (
        <div className="space-y-10 pb-8 -m-6">
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 dark:from-gray-950 dark:via-indigo-950 dark:to-gray-950">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute -top-10 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-purple-300 to-indigo-300 blur-3xl" />
                    <div className="absolute bottom-0 left-1/5 w-56 h-56 rounded-full bg-gradient-to-br from-cyan-300 to-blue-300 blur-3xl" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 md:py-16 space-y-4">
                    {tenantDomain && (
                        <Badge className="bg-white/15 text-white border-white/25 hover:bg-white/20 gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
                            {tenantDomain}
                        </Badge>
                    )}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                        Welcome back{firstName ? `, ${firstName}` : ''}
                    </h1>
                    <p className="text-lg text-blue-100 max-w-xl">
                        What do you want to find out today?
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {features.map(feature => (
                        <FeatureCard key={feature.href} feature={feature} />
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">
                    IntuneAssistant only reads your tenant. Nothing you do here changes anything in Intune.{' '}
                    <Link href="/security" className="underline underline-offset-4">How that works</Link>
                </p>
            </section>
        </div>
    );
}

export default function HomePage() {
    const { accounts, inProgress } = useMsal();
    const { customerData, hasConnectedTenant, customerLoading, customerError } = useCustomer();

    // MSAL is still handling a redirect or a sign-in.
    if (inProgress !== InteractionStatus.None && accounts.length === 0) {
        return (
            <div className="flex items-center justify-center py-32 text-muted-foreground">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing you in…
            </div>
        );
    }

    if (accounts.length === 0) {
        return <SignedOutHome />;
    }

    if (customerLoading) {
        return (
            <div className="flex items-center justify-center py-32 text-muted-foreground">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loading your tenant…
            </div>
        );
    }

    if (customerError) {
        return (
            <div className="max-w-xl mx-auto py-16 space-y-4 text-center">
                <h1 className="text-2xl font-bold">We could not load your account</h1>
                <p className="text-muted-foreground">{customerError}</p>
                <Button onClick={() => window.location.reload()}>Try again</Button>
            </div>
        );
    }

    if (!customerData) {
        return (
            <SetupHome
                nextHref="/onboarding/register"
                title="Welcome! Let's set you up"
                text="It takes about a minute: create your account, then connect your tenant with read-only access."
                cta="Start setup"
            />
        );
    }

    if (!hasConnectedTenant) {
        return (
            <SetupHome
                nextHref="/onboarding/tenant"
                title="One step left: connect your tenant"
                text="A Global Administrator needs to approve read-only access to your Microsoft tenant. You only do this once."
                cta="Connect your tenant"
            />
        );
    }

    const firstName = (accounts[0]?.name ?? '').split(' ')[0];
    const tenantDomain = customerData.tenants[0]?.domainName ?? accounts[0]?.username?.split('@')[1] ?? null;

    return <ReadyHome firstName={firstName} tenantDomain={tenantDomain} />;
}
