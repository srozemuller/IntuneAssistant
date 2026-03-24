'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Sparkles, Shield, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OnboardingSuccessPage() {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);


    const handleContinue = () => {
        setIsRedirecting(true);
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-8">
                {/* Success Animation */}
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 animate-ping">
                            <div className="h-24 w-24 mx-auto rounded-full bg-green-400 opacity-20"></div>
                        </div>
                        <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-2xl">
                            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 animate-bounce" />
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                        Registration Complete!
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Welcome to Intune Assistant! 🎉
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                        Your organization has been successfully registered and is ready to use.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-green-200 dark:border-green-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Access</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Your tenant is connected with secure admin consent
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Full Access</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                All features are now available to you
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Ready to Use</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Start managing your Intune environment now
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* What's Next Section */}
                <Card className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3 mb-4">
                            <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What's Next?</h3>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        Explore your Intune environment through the dashboard
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        Review device compliance and configurations
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        Set up monitoring for configuration drift
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        Use the AI Assistant for Intune management help
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Button
                        onClick={handleContinue}
                        disabled={isRedirecting}
                        size="lg"
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold text-lg py-6"
                    >
                        {isRedirecting ? (
                            <>
                                <div className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Redirecting...
                            </>
                        ) : (
                            <>
                                Go to Dashboard
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>

                {/* Celebration Message */}
                <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Thank you for choosing Intune Assistant! 🚀
                    </p>
                </div>
            </div>
        </div>
    );
}

