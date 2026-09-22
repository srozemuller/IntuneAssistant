import { PageHeader } from '@/components/PageHeader';

interface FaqItem {
    question: string;
    answer: React.ReactNode;
}

const link = 'underline underline-offset-4';

const faqs: FaqItem[] = [
    {
        question: 'What is IntuneAssistant?',
        answer: 'A free community tool that helps Intune administrators see what is configured in their tenant: what is assigned to whom, what applies to a device, which policies exist and who holds admin roles.',
    },
    {
        question: 'Does it change anything in my tenant?',
        answer: 'No. IntuneAssistant only reads. It never creates, changes or deletes anything in your tenant.',
    },
    {
        question: 'Is it really free?',
        answer: 'Yes. IntuneAssistant is free for every Intune administrator.',
    },
    {
        question: 'Is it safe to use?',
        answer: 'It works in your own user context, on behalf of the account you sign in with. You only see what your own roles allow you to see, and every request shows up in the audit logs under your name.',
    },
    {
        question: 'What about my data?',
        answer: 'IntuneAssistant does not store your tenant data. It reads it from your tenant and shows it in your browser. When you sign out and close the browser, it is gone. We only keep the name of your account, your tenant ID and your tenant domain.',
    },
    {
        question: 'Which permissions does it need?',
        answer: (
            <>
                Read permissions on Microsoft Graph. The full list is on the{' '}
                <a href="/security" className={link}>Privacy &amp; security</a> page.
            </>
        ),
    },
    {
        question: 'How do I remove access?',
        answer: 'Open Microsoft Entra ID, go to Enterprise applications, find the IntuneAssistant application and delete it. Access stops immediately.',
    },
    {
        question: 'Who built it?',
        answer: (
            <>
                IntuneAssistant was started by Sander Rozemuller, Microsoft MVP for Intune and Graph API, together with
                the community.{' '}
                <a href="https://mvp.microsoft.com/en-us/PublicProfile/5004291" className={link} target="_blank" rel="noopener noreferrer">
                    MVP profile
                </a>
            </>
        ),
    },
    {
        question: 'Can I see the source code?',
        answer: (
            <>
                Yes, it is on{' '}
                <a href="https://github.com/srozemuller/IntuneAssistant" className={link} target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>
                .
            </>
        ),
    },
    {
        question: 'I found a bug or have an idea',
        answer: (
            <>
                Great! Please{' '}
                <a href="https://github.com/srozemuller/IntuneAssistant/issues/new/choose" className={link} target="_blank" rel="noopener noreferrer">
                    open an issue on GitHub
                </a>
                . There are templates for bugs, ideas and feedback.
            </>
        ),
    },
    {
        question: 'Where is the documentation?',
        answer: (
            <>
                At{' '}
                <a href="https://docs.intuneassistant.cloud" className={link} target="_blank" rel="noopener noreferrer">
                    docs.intuneassistant.cloud
                </a>
                .
            </>
        ),
    },
];

export default function FaqPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <PageHeader title="Frequently asked questions" description="Quick answers about what IntuneAssistant does and does not do." />
            <div className="divide-y rounded-lg border">
                {faqs.map(item => (
                    <details key={item.question} className="group p-4 open:bg-muted/30">
                        <summary className="cursor-pointer list-none font-medium flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:underline">
                            {item.question}
                            <span className="text-muted-foreground transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">+</span>
                        </summary>
                        <div className="mt-3 text-sm text-muted-foreground">{item.answer}</div>
                    </details>
                ))}
            </div>
        </div>
    );
}
