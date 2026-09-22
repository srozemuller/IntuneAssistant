import { Monitor, GitCompare, Copy } from 'lucide-react';
import { HeroHub } from '@/components/HeroHub';

export default function DevicesHubPage() {
    return (
        <HeroHub
            eyebrow="Device Insight"
            title="Devices"
            description="Look at the devices in your tenant and understand what is applied to them."
            icon={Monitor}
            gradient="from-yellow-500 via-amber-600 to-orange-600"
            glow="from-yellow-300 to-amber-300"
            accent="from-amber-500 to-orange-500"
            links={[
                { title: 'Device overview', description: 'All managed devices with compliance, platform and assignment details.', href: '/devices/overview', icon: Monitor },
                { title: 'Compare devices', description: 'Put two devices side by side: policies, apps, filters, scope tags and update rings.', href: '/devices/compare', icon: GitCompare },
                { title: 'Duplicate devices', description: 'Find devices that share the same hardware identity, even after a rename.', href: '/devices/duplicates', icon: Copy },
            ]}
        />
    );
}
