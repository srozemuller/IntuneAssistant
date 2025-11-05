'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, ExternalLink, Shield, Users, Code, Heart, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FAQItem {
    question: string;
    answer: string;
    category: 'general' | 'security' | 'technical' | 'community';
    links?: { text: string; url: string; external?: boolean }[];
}

const faqs: FAQItem[] = [
    {
        question: "What is Intune Assistant?",
        answer: "Intune Assistant is a tool that helps Intune Administrators getting insights in their Intune environment.",
        category: "general"
    },
    {
        question: "Who initially built Intune Assistant?",
        answer: "Intune Assistant is built by Sander Rozemuller. He is a double Microsoft MVP in the categories Intune and Graph API.",
        category: "general",
        links: [
            { text: "LinkedIn Profile", url: "https://linkedin.com/in/sanderrozemuller", external: true },
            { text: "MVP Profile", url: "https://mvp.microsoft.com/en-us/PublicProfile/5004291", external: true }
        ]
    },
    {
        question: "What is the Community plan and why are there licensed plans?",
        answer: "The Community plan is our free tier that provides full access to all core Intune Assistant features with no restrictions. Licensed plans (Support and Extensions) offer additional premium features like professional support, advanced automation tools, and enterprise extensions. The community version remains completely free and functional for individual administrators and small teams.",
        category: "community"
    },
    {
        question: "Is using Intune Assistant safe?",
        answer: "Yes, using Intune Assistant is a safe process. It works under user context and connects to a tenant on behalf of the user.",
        category: "security"
    },
    {
        question: "What about the data?",
        answer: "Intune Assistant does NOT store any tenant sensitive data. It only reads the data from the tenant and displays it in the UI. If you log out and close the browser, the data is gone.",
        category: "security"
    },
    {
        question: "How does it work?",
        answer: "Intune Assistant uses an app registration consented during the onboarding process. The app registration has only the needed READ permissions. When a user logs in, the app registration is used under user context to get the data from the tenant.",
        category: "technical",
        links: [
            { text: "Documentation", url: "/docs", external: false }
        ]
    },
    {
        question: "I read something about the Intune Assistant API?",
        answer: "That is great to hear! The Intune Assistant API is a sort of aggregation layer. The API harvests many Graph API endpoints and combines data to something that is useful. In fact, the Intune Assistant API is just a data shipper that streamlines Graph data to the web interface as also the Intune CLI.",
        category: "technical"
    },
    {
        question: "What permissions does Intune Assistant need?",
        answer: "Intune Assistant relies on Graph API permission. The permissions in basic are READ permissions.",
        category: "security",
        links: [
            { text: "Permissions Overview", url: "/docs/permissions", external: false }
        ]
    },
    {
        question: "Can I see more about the source code?",
        answer: "Yes, the web interface as the CLI source code is available at my GitHub.",
        category: "technical",
        links: [
            { text: "GitHub Repository", url: "https://github.com/srozemuller/IntuneAssistant", external: true }
        ]
    },
    {
        question: "I want to request a feature",
        answer: "That is great! In my repo there is a template available for requesting features. Use it also for bugs or other issues.",
        category: "general",
        links: [
            { text: "Feature Request Template", url: "https://github.com/srozemuller/IntuneAssistant/issues/new", external: true }
        ]
    },
    {
        question: "Where can I find the documentation?",
        answer: "You can find the docs in our comprehensive documentation section.",
        category: "general",
        links: [
            { text: "Documentation", url: "/docs", external: false }
        ]
    },
    {
        question: "Why is Intune Assistant a web interface only?",
        answer: "Intune Assistant is web interface because it helps users getting up to speed quick. Also not everyone has a subscription to store resources at.",
        category: "general"
    },
    {
        question: "Will Intune Assistant become available as a single instance to run at my own platform?",
        answer: "Yes, Intune Assistant will become available as a single instance to run at your own platform. It is on the roadmap but not yet available.",
        category: "technical"
    }
];

const categories = {
    general: { label: 'General', icon: Users, color: 'blue' },
    security: { label: 'Security & Privacy', icon: Shield, color: 'green' },
    technical: { label: 'Technical', icon: Code, color: 'purple' },
    community: { label: 'Community & Plans', icon: Heart, color: 'pink' }
} as const;

export default function FAQPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !activeCategory || faq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleExpanded = (index: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedItems(newExpanded);
    };

    const getCategoryColor = (category: string) => {
        const cat = categories[category as keyof typeof categories];
        switch (cat?.color) {
            case 'blue': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
            case 'green': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
            case 'purple': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
            case 'pink': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="inline-flex p-4 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                            <Users className="h-10 w-10" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Everything you need to know about Intune Assistant, from getting started to advanced features
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search frequently asked questions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 py-3 text-lg"
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                !activeCategory
                                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            )}
                        >
                            All Questions ({faqs.length})
                        </button>
                        {Object.entries(categories).map(([key, category]) => {
                            const count = faqs.filter(faq => faq.category === key).length;
                            const Icon = category.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                        activeCategory === key
                                            ? getCategoryColor(key).replace('100', '500').replace('700', '50').replace('900/50', '500').replace('300', '50')
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {category.label} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FAQ Items */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="space-y-4">
                    {filteredFaqs.length === 0 ? (
                        <Card className="p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                No questions found matching your search.
                            </p>
                        </Card>
                    ) : (
                        filteredFaqs.map((faq, index) => {
                            const originalIndex = faqs.findIndex(f => f === faq);
                            const isExpanded = expandedItems.has(originalIndex);
                            const category = categories[faq.category as keyof typeof categories];
                            const Icon = category.icon;

                            return (
                                <Card key={originalIndex} className="overflow-hidden border-2 hover:shadow-lg transition-all duration-200">
                                    <button
                                        onClick={() => toggleExpanded(originalIndex)}
                                        className="w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    getCategoryColor(faq.category)
                                                )}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                        {faq.question}
                                                    </h3>
                                                    <Badge variant="secondary" className={cn("text-xs", getCategoryColor(faq.category))}>
                                                        {category.label}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                {isExpanded ? (
                                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <CardContent className="border-t bg-gray-50/50 dark:bg-gray-800/30">
                                            <div className="space-y-4">
                                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {faq.answer}
                                                </p>

                                                {faq.links && faq.links.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                            Related Links:
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {faq.links.map((link, linkIndex) => (
                                                                <a
                                                                    key={linkIndex}
                                                                    href={link.url}
                                                                    target={link.external ? "_blank" : undefined}
                                                                    rel={link.external ? "noopener noreferrer" : undefined}
                                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                                                                >
                                                                    {link.text}
                                                                    {link.external && <ExternalLink className="h-3 w-3" />}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="text-center">
                        <CardContent className="p-8">
                            <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Still have questions?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Can&apos;t find the answer you&apos;re looking for? Our team is here to help.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="https://github.com/srozemuller/IntuneAssistant/issues/new"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Code className="h-4 w-4" />
                                    Ask on GitHub
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                                <a
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
