import { BookOpen, Bug, Github, Lightbulb } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const links = [
    { title: 'Source code', text: 'Read it, fork it, learn from it.', href: 'https://github.com/srozemuller/IntuneAssistant', icon: Github },
    { title: 'Report a bug', text: 'Something looks wrong? Tell us with a bug template.', href: 'https://github.com/srozemuller/IntuneAssistant/issues/new/choose', icon: Bug },
    { title: 'Suggest an idea', text: 'Missing something in your daily Intune work? Open a feature request.', href: 'https://github.com/srozemuller/IntuneAssistant/issues/new/choose', icon: Lightbulb },
    { title: 'Documentation', text: 'Guides, permissions and how things work.', href: 'https://docs.intuneassistant.cloud', icon: BookOpen },
];

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-10">
            <PageHeader
                title="About IntuneAssistant"
                description="A free, read-only community tool that shows what is really configured in your Intune tenant."
            />

            <section className="space-y-3 max-w-2xl text-muted-foreground">
                <p>
                    IntuneAssistant started from a community idea: give Intune administrators quick answers to the questions
                    they ask every day. Who gets this policy? What applies to this device? Who holds an admin role?
                </p>
                <p>
                    It was started by Sander Rozemuller, Microsoft MVP for Intune and Graph API, and grows with feedback
                    from the people who use it. It only reads your tenant and never changes anything.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Get involved</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    {links.map(({ title, text, href, icon: Icon }) => (
                        <a key={title} href={href} target="_blank" rel="noopener noreferrer" className="group focus-visible:outline-none">
                            <Card className="h-full transition-colors group-hover:border-primary group-focus-visible:border-primary">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Icon className="h-4 w-4 text-primary" />
                                        {title}
                                    </CardTitle>
                                    <CardDescription>{text}</CardDescription>
                                </CardHeader>
                                <CardContent />
                            </Card>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
}
