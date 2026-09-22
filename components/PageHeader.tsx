import type { ReactNode } from 'react';

/** Consistent page title block for the plain content pages (FAQ, About, Privacy & security). */
export function PageHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
    return (
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground max-w-2xl">{description}</p>
            {children}
        </div>
    );
}
