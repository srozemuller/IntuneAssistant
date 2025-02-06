import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { type Configuration, PublicClientApplication } from '@azure/msal-browser';

const msalConfig: Configuration = {
    auth: {
        clientId: `0f0f930f-a5c7-4da2-a985-8464d1ff51d0`,
        authority: 'https://login.microsoftonline.com/organizations',
        redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321/authentication/login-callback',
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: true,
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);

const loginRequest = {
    scopes: [`api://6317a049-4e55-464f-80a1-0896b8309fec/access_as_user`],
};

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

        if (typeof window !== 'undefined') {
            initializeMsal();
        }
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