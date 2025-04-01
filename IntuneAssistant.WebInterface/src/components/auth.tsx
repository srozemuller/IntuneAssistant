import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { msalInstance, loginRequest } from '@/authconfig';

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
            localStorage.removeItem('onboarded');
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