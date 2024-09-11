import { PublicClientApplication } from "@azure/msal-browser";
import { msalInstance, loginRequest } from "@/authconfig";


const authService = {
    isInitialized: false,

    async initialize() {
        try {
            console.log('Initializing MSAL...');
            await msalInstance.initialize();
            this.isInitialized = true;
            console.log('MSAL initialized');
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
            console.log('Requesting scopes:', loginRequest.scopes);
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            localStorage.setItem('loginResponse', JSON.stringify(loginResponse));
            console.log('Login response in login process:', loginResponse);
            const account = msalInstance.getAllAccounts()[0];
            if (account) {
                const tokenResponse = await msalInstance.acquireTokenSilent({
                    ...loginRequest,
                    account,
                });
                console.log('Token response:', tokenResponse);
                localStorage.setItem('accessToken', tokenResponse.accessToken);
                return tokenResponse.accessToken;
            }
        } catch (error) {
            console.error('Login errors:', error);
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

    getAccessToken: async function() {
        let accessToken = localStorage.getItem('accessToken');
        const loginResponse = JSON.parse(localStorage.getItem('loginResponse'));
        console.log('Login response from getAccessToken:', loginResponse);
        if (!loginResponse || !loginResponse.expiresOn) {
            console.log('No login response or expiration information found. Logging in to get token.');
            accessToken = await this.login();
        } else {
            const expiresOn = new Date(loginResponse.expiresOn).getTime();
            const now = new Date().getTime();
            if (now > expiresOn) {
                console.log('Token is expired. Logging in to refresh token.');
                accessToken = await this.login();
            }
        }

        if (!accessToken) {
            throw new Error('Unable to fetch or refresh access token.');
        }

        console.log('Access token from getAccessToken:', accessToken);
        return accessToken;
    }
};

export default authService;