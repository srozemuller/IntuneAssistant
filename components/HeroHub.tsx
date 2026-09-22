import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface HubLink {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
}

interface HeroHubProps {
    eyebrow: string;
    title: string;
    description: string;
    icon: LucideIcon;
    gradient: string;       // hero background, e.g. "from-gray-900 via-blue-900 to-cyan-900"
    glow: string;           // decorative blur colors, e.g. "from-blue-400 to-cyan-400"
    accent: string;         // per-card icon gradient, e.g. "from-blue-500 to-cyan-500"
    links: HubLink[];
}

/** Hero banner + feature cards, in the house style — used for every section landing page. */
export function HeroHub({ eyebrow, title, description, icon: Icon, gradient, glow, accent, links }: HeroHubProps) {
    return (
        <div className="space-y-8">
            <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-8 text-white`}>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Icon className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            {eyebrow}
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">{title}</h1>
                    <p className="text-xl text-white/80 max-w-2xl">{description}</p>
                </div>
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className={`absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br ${glow} blur-3xl`} />
                    <div className={`absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br ${glow} blur-2xl`} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {links.map(({ title: linkTitle, description: linkDescription, href, icon: LinkIcon }) => (
                    <Link key={href} href={href} className="group focus-visible:outline-none">
                        <Card className="h-full relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group-focus-visible:shadow-xl">
                            <CardHeader>
                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg flex items-center justify-center mb-2`}>
                                    <LinkIcon className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg">{linkTitle}</CardTitle>
                                <CardDescription>{linkDescription}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                                    Open
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
