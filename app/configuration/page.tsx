import { ListFilter, SlidersHorizontal, Shield, FileStack, GitCompare, FileDiff } from 'lucide-react';
import { HeroHub } from '@/components/HeroHub';

export default function PoliciesHubPage() {
    return (
        <HeroHub
            eyebrow="Policy Insight"
            title="Policies"
            description="Browse the policies and settings configured in your tenant."
            icon={FileStack}
            gradient="from-orange-500 via-red-500 to-rose-600"
            glow="from-orange-300 to-rose-300"
            accent="from-orange-500 to-red-500"
            links={[
                { title: 'Policy list', description: 'Browse and filter every configuration policy.', href: '/configuration/policies', icon: ListFilter },
                { title: 'Settings overview', description: 'Inspect individual settings across all policies.', href: '/configuration/settings', icon: SlidersHorizontal },
                { title: 'Conditional Access', description: 'Every Conditional Access policy and what it targets.', href: '/conditional-access/policies', icon: Shield },
                { title: 'Compare policies', description: 'Put two or more policies side by side and see the differences.', href: '/compare/policies', icon: GitCompare },
                { title: 'Compare external', description: 'Paste or upload an exported policy and diff it against a live one.', href: '/compare/configuration', icon: FileDiff },
            ]}
        />
    );
}
