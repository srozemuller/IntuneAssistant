import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { msalInstance, loginRequest } from '@/authconfig';
import { checkTenantOnboardingStatus } from '@/components/onboarded-check'; // Import the onboarding check

const AuthButton: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        const initializeMsal = async () => {
            await msalInstance.initialize();
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                setIsLoggedIn(true);
                setUserName(accounts[0].name ?? null);
                sessionStorage.setItem("accountInfo", JSON.stringify(accounts[0]));
            }
        };
        initializeMsal();
    }, []);

    const login = async () => {
        try {
            await msalInstance.initialize();
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            const account = loginResponse.account;
            if (account) {
                setIsLoggedIn(true);
                setUserName(account.name ?? null);
                const tokenResponse = await msalInstance.acquireTokenSilent({
                    ...loginRequest,
                    account,
                });
                localStorage.setItem('accessToken', tokenResponse.accessToken);

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
        }
    };

    const logout = async () => {
        try {
            await msalInstance.initialize();
            await msalInstance.logoutPopup();
            setIsLoggedIn(false);
            setUserName(null);
            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('onboarded');
            localStorage.removeItem('consentToken');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(`Logout error: ${(error as Error).message}`);
        }
    };

    return (
        <div>
            {isLoggedIn ? (
                <>
                    <span id="user-name">Hi, {userName} </span>
                    <button id="logout-link" onClick={logout}>Logout</button>
                </>
            ) : (
                <button id="login-link" onClick={login}>Login</button>
            )}
        </div>
    );
};

export default AuthButton;