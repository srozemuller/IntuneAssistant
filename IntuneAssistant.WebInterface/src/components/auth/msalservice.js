// src/auth/authService.js
import { msalInstance, loginRequest} from '@/authconfig';
import {toast} from "sonner";

const authService = {
    isInitialized: false,

    async initialize() {
        try {
            const initializeMsal = async () => {
                try {
                    await msalInstance.initialize();
                    console.log('MSAL initialized');
                    this.isInitialized = true;
                } catch (error) {
                    console.error('MSAL initialization error:', error);
                }
            };
            initializeMsal();

        } catch (error) {
            console.error('MSAL initialization error:', error);
            throw error;
        }
    },
    async login() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            // Check if loginRequest and loginRequest.scopes are defined
            console.log('Requesting scopes:', loginRequest.scopes); // Debugging: Log requested scopes
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            localStorage.setItem('loginResponse', JSON.stringify(loginResponse));
            console.log('Login response in login process:', loginResponse);
            const account = msalInstance.getAllAccounts()[0];
            if (account) {
                const tokenResponse = await msalInstance.acquireTokenSilent({
                    ...loginRequest,
                    account,
                });
                console.log('Token response:', tokenResponse); // Adjusted to log the entire token response for debugging
                localStorage.setItem('accessToken', tokenResponse.accessToken);
                return tokenResponse.accessToken;
            }
        } catch (error) {
            console.error('Login errors:', error);
            toast.error(`Login error: ${error.message}`);
            throw error;
        }
    },
    logout: () => {
        localStorage.removeItem('accessToken');
        // Additional logout operations can be added here
    },
    isLoggedIn: () => {
        return localStorage.getItem('accessToken') !== null;
    },
    getTokenClaims: () => {
        return msalInstance.getAllAccounts()[0];
    },
    getAccessToken: async () => {
        let accessToken = localStorage.getItem('accessToken');
        const loginResponse = JSON.parse(localStorage.getItem('loginResponse'));
        console.log('Login response from getAccessToken:', loginResponse); // Debugging: Log the login response
        if (!loginResponse || !loginResponse.expiresOn) {
            // If there's no login response or expiration information, login to refresh the token
            console.log('No login response or expiration information found. Logging in to get token.');
            await this.login();
            accessToken = localStorage.getItem('accessToken');
        } else {
            const expiresOn = new Date(loginResponse.expiresOn).getTime();
            const now = new Date().getTime();
            if (now > expiresOn) {
                console.log('Token is expired. Logging in to refresh token.');
                // If the token is expired, login again to refresh it
                await this.login();
                accessToken = localStorage.getItem('accessToken');
            }
        }

        // Ensure accessToken is updated and valid before returning
        if (!accessToken) {
            throw new Error('Unable to fetch or refresh access token.');
        }

        console.log('Access token from getAccessToken:', accessToken); // Debugging: Log the access token
        return accessToken;
    }
};

export default authService;