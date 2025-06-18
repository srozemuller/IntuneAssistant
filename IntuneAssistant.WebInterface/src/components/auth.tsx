import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { msalInstance, loginRequest } from '@/authconfig';
import { checkTenantOnboardingStatus } from '@/components/onboarded-check';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

// Product type definition
interface Product {
    id: string;
    name: string;
    href: string;
    description: string;
}

const AuthButton: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userInitials, setUserInitials] = useState<string>('');

    // Define available products
    const [products] = useState<Product[]>([
        {
            id: 'assistant',
            name: 'Assistant',
            href: '/',
            description: ''
        },
        {
            id: 'analyser',
            name: 'Analyser',
            href: '/analyser',
            description: 'Analyze your Intune environment'
        },
        {
            id: 'rollout',
            name: 'Rollout',
            href: '/rollout',
            description: 'Manage your deployment rollouts'
        }
    ]);

    const [selectedProduct, setSelectedProduct] = useState<string>('assistant');

    // Determine current context based on path
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path.startsWith('/rollout')) {
                setSelectedProduct('rollout');
            } else if (path.startsWith('/analyser')) {
                setSelectedProduct('analyser');
            } else {
                setSelectedProduct('assistant');
            }
        }

        // Initialize from localStorage if available
        const storedProduct = localStorage.getItem('selectedProduct');
        if (storedProduct) {
            setSelectedProduct(storedProduct);
        }
    }, []);

    useEffect(() => {
        const initializeMsal = async () => {
            await msalInstance.initialize();
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                setIsLoggedIn(true);
                setUserName(accounts[0].name ?? null);
                setUserEmail(accounts[0].username ?? null);
                sessionStorage.setItem("accountInfo", JSON.stringify(accounts[0]));

                // Set user initials
                if (accounts[0].name) {
                    setUserInitials(getInitials(accounts[0].name));
                }
            }
        };
        initializeMsal();
    }, []);

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase();
    };

    const selectProduct = (productId: string) => {
        setSelectedProduct(productId);
        localStorage.setItem('selectedProduct', productId);

        // Find the selected product to navigate to its URL
        const selectedProd = products.find(p => p.id === productId);
        if (selectedProd && selectedProd.href) {
            window.location.href = selectedProd.href;
        }

        // Dispatch context change event for other components
        const event = new CustomEvent('productContextChanged', {
            detail: { productId }
        });
        window.dispatchEvent(event);
    };

    const login = async () => {
        setIsLoading(true);
        try {
            await msalInstance.initialize();
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            const account = loginResponse.account;
            if (account) {
                setIsLoggedIn(true);
                setUserName(account.name ?? null);
                setUserEmail(account.username ?? null);
                if (account.name) {
                    setUserInitials(getInitials(account.name));
                }

                const tokenResponse = await msalInstance.acquireTokenSilent({
                    ...loginRequest,
                    account,
                });
                localStorage.setItem('accessToken', tokenResponse.accessToken);

                // Save full account info for profile page
                sessionStorage.setItem("accountInfo", JSON.stringify(account));

                // Check if the tenant is onboarded
                try {
                    const onboardingStatus = await checkTenantOnboardingStatus();
                    if (onboardingStatus && onboardingStatus.isOnboarded) {
                        sessionStorage.setItem('onboarded', 'true');
                        console.log('Tenant is onboarded');
                    } else {
                        sessionStorage.setItem('onboarded', 'false');
                        console.log('Tenant is not onboarded');
                    }
                } catch (onboardingError) {
                    console.error('Failed to check onboarding status:', onboardingError);
                    sessionStorage.removeItem('onboarded');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(`Login error: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await msalInstance.initialize();
            await msalInstance.logoutPopup();
            setIsLoggedIn(false);
            setUserName(null);
            setUserEmail(null);
            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('onboarded');
            localStorage.removeItem('consentToken');
            localStorage.removeItem('selectedProduct');
            sessionStorage.removeItem('accountInfo');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(`Logout error: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <Button
                id="login-link"
                variant="outline"
                onClick={login}
                disabled={isLoading}
            >
                {isLoading ? "Signing in..." : "Login"}
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="/avatars/default.png" alt={userName || ""} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userEmail}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            My Products
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                {products.map((product) => (
                                    <DropdownMenuItem
                                        key={product.id}
                                        onClick={() => selectProduct(product.id)}
                                    >
                                        <div className="flex items-center w-full justify-between">
                                            <div className="flex flex-col">
                                                <span>{product.name}</span>
                                            </div>
                                            {selectedProduct === product.id && (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                        Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                        Tenant Settings
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} disabled={isLoading}>
                    {isLoading ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default AuthButton;