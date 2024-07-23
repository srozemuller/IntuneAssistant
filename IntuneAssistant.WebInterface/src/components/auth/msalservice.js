// src/auth/authService.js
import { msalInstance } from '../../authconfig.js';

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
    async login(loginRequest) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            console.log('Login response:', loginResponse);
            const account = msalInstance.getAllAccounts()[0];
            if (account) {
                const tokenResponse = await msalInstance.acquireTokenSilent({
                    ...loginRequest,
                    account,
                });
                localStorage.setItem('accessToken', tokenResponse.accessToken);
                return tokenResponse.accessToken;
            }
        } catch (error) {
            console.error('Login error:', error);
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
    getAccessToken: () => {
        return localStorage.getItem('accessToken');
    }
};

export default authService;