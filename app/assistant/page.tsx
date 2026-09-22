import { Layers, Users, User, Filter, AppWindow, GitBranch } from 'lucide-react';
import { HeroHub } from '@/components/HeroHub';

export default function AssignmentsHubPage() {
    return (
        <HeroHub
            eyebrow="Assignment Insight"
            title="Assignments"
            description="See what actually reaches your users and devices. Exclusions, filters, nested groups and tenant defaults are all taken into account."
            icon={GitBranch}
            gradient="from-gray-900 via-blue-900 to-cyan-900"
            glow="from-blue-400 to-cyan-400"
            accent="from-blue-500 to-cyan-500"
            links={[
                { title: 'All configurations', description: 'Every configuration assignment in your tenant, in one searchable table.', href: '/assistant/assignments-overview', icon: Layers },
                { title: 'By group', description: 'Pick a group and see everything assigned to it.', href: '/assistant/group-assignments', icon: Users },
                { title: 'By user', description: 'What applies to one person, through direct and group assignments.', href: '/assistant/user-assignments', icon: User },
                { title: 'By filter', description: 'Which assignments use a given assignment filter.', href: '/assistant/filter-assignments', icon: Filter },
                { title: 'Apps', description: 'Every app assignment, with its intent and target.', href: '/assistant/app-assignments', icon: AppWindow },
            ]}
        />
    );
}
