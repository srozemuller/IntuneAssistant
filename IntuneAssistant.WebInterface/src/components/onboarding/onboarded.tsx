import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import axios from 'axios';
import { CONSENT_CALLBACK } from '@/constants/apiUrls.js';
import {type Configuration, PublicClientApplication} from "@azure/msal-browser";

const gifImage = "/images/giphy.gif";

const msalConfig: Configuration = {
    auth: {
        clientId: '0f0f930f-a5c7-4da2-a985-8464d1ff51d0',
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
    scopes: ['api://6317a049-4e55-464f-80a1-0896b8309fec/access_as_user'],
    prompt: 'select_account',
};
type Account = {
    homeAccountId: string;
    name: string;
    username: string;
};

const Onboarded = () => {
    const [tenant, setTenant] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<string | undefined>(undefined);
    const [accounts, setAccounts] = useState<Account[]>([]);


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
                const accounts = msalInstance.getAllAccounts();
                localStorage.setItem('accounts', JSON.stringify(accounts));
                setAccounts(accounts);
                return account;
            }
        } catch (error) {
            if (error.errorCode === 'user_cancelled') {
                console.log('User cancelled the login flow.');
            } else {
                console.error('Login error:', error);
            }
        }
        return null;
    };

    const fetchData = async (account) => {
        const urlParams = new URLSearchParams(window.location.search);
        const tenant = urlParams.get('tenant') || '';
        setTenant(tenant);
        const tenantElement = document.getElementById('tenant-id');
        if (tenantElement) {
            tenantElement.textContent += tenant;
        }
        console.log('Fetching data...',account);
        const token = localStorage.getItem('consentToken');
        if (token) {
            const accessToken = localStorage.getItem('accessToken');
            const callbackUrl = `${CONSENT_CALLBACK}?consentToken=${token}`;
            console.log(msalInstance);
            try {
                const response = await axios.get(callbackUrl, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                console.log(response.data);
                setIsLoading(false);
                document.getElementById('page-content').style.display = 'block';
            } catch (error) {
                console.error(error);
            }
        }
    };

    useEffect(() => {
        const initialize = async () => {
            const account = await login();
            if (account) {
                await fetchData(account);
            }
        };
        initialize();
    }, []);

    return (
        <div className="flex items-center justify-center h-[calc(100vh-25vh)]">
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <Card className="w-[400px] ">
                    <CardHeader>
                        <CardTitle className="text-center">
                            Congratulations
                        </CardTitle>
                        <CardDescription>You have made it!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center">
                            <img src={gifImage} alt="Celebration GIF" />
                        </div>
                        <hr className="border-t border-white my-4" />
                        You have successfully activated Intune Assistant and ready for launch 🚀.
                        <p id="tenant-id">Tenant ID: {tenant} </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        — Enjoy!
                    </CardFooter>
                </Card>
            )}
        </div>
    );
};

export default Onboarded;