import React, {useState} from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type FeatureInfo = {
    title: string;
    shortDesc: string;
    longDesc: string;
    color: string;
};

const RolloutLanding: React.FC = () => {

    const [openFeature, setOpenFeature] = useState<string | null>(null);

    const features: FeatureInfo[] = [
        {
            title: "Configuration Policies",
            shortDesc: "Deploy device settings consistently across your organization with bulk assignment capabilities.",
            longDesc: "Configuration policies allow you to manage settings on devices in your organization. With Rollout Assistant, you can quickly assign these policies to multiple groups, users, or devices simultaneously, ensuring consistent configuration across your environment. We currently support 95% of all configuration policy types and are actively working on the remaining ones.",
            color: "bg-[hsl(var(--chart-1))]"
        },
        {
            title: "Compliance Policies (Coming Soon)",
            shortDesc: "Ensure your devices meet security requirements with quick compliance policy assignments.",
            longDesc: "Compliance policies define the rules and settings that users and devices must meet to be considered compliant. Support for bulk assignment of compliance policies will be available soon, allowing you to rapidly deploy security standards across your organization while maintaining consistent security posture without the tedious process of individual assignments.",
            color: "bg-[hsl(var(--chart-2))]"
        },
        {
            title: "Windows Update Policies (Coming Soon)",
            shortDesc: "Manage Windows updates at scale across your entire device fleet effortlessly.",
            longDesc: "Windows update policies help you control how and when Windows updates are installed on devices in your organization. Support for Windows update policy deployment will be available soon, allowing you to create a standardized update strategy that can be consistently applied across your organization with just a few clicks.",
            color: "bg-[hsl(var(--chart-3))]"
        },
        {
            title: "Autopilot Configuration (Coming Soon)",
            shortDesc: "Streamline device provisioning and setup with bulk Autopilot configuration assignments.",
            longDesc: "Autopilot configurations allow you to customize the out-of-box experience for new devices. Support for Autopilot configuration assignments will be coming soon, enabling you to efficiently manage device enrollment and setup experiences across your organization without repetitive manual configuration.",
            color: "bg-[hsl(var(--chart-4))]"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-b from-secondary to-background">
                <div className="container mx-auto px-4 text-center">
                    <div className="bg-icon mx-auto mb-6"></div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Rollout Assistant
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                        Assign resources in bulk in just a few seconds, streamlining your management workflow.
                    </p>
                    <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10"
                        asChild
                    >
                        <a href="/contact">Contact</a>
                    </Button>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-card">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Supported Resources</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="card p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                                onClick={() => setOpenFeature(feature.title)}
                            >
                                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                                <p className="mb-4">{feature.shortDesc}</p>
                                <div className={`h-1 w-16 ${feature.color}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">How Rollout Assistant Works</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-xl font-bold mb-4">1</div>
                            <h3 className="text-xl font-semibold mb-2">Create CSV</h3>
                            <p>Prepare a CSV file with policy names and their target assignments.</p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-xl font-bold mb-4">2</div>
                            <h3 className="text-xl font-semibold mb-2">Upload</h3>
                            <p>Upload your prepared CSV file to the Rollout Assistant platform.</p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-xl font-bold mb-4">3</div>
                            <h3 className="text-xl font-semibold mb-2">Migrate</h3>
                            <p>Execute the migration process to apply all your policy assignments at once.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-secondary">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to simplify your deployment workflow?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Join organizations already using Rollout Assistant to save time and reduce errors.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary/10"
                            asChild
                        >
                            <a href="/contact">Contact</a>
                        </Button>
                        <Button
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary/10"
                            asChild
                        >
                            <a href="/docs/rollout">Docs</a>
                        </Button>
                    </div>
                </div>
            </section>
            {features.map((feature) => (
                <Dialog
                    key={feature.title}
                    open={openFeature === feature.title}
                    onOpenChange={(open) => {
                        if (!open) setOpenFeature(null);
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{feature.title}</DialogTitle>
                        </DialogHeader>
                        <DialogDescription className="text-base">
                            {feature.longDesc}
                        </DialogDescription>
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setOpenFeature(null)}
                            >
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            ))}
        </div>
    );
};

export default RolloutLanding;