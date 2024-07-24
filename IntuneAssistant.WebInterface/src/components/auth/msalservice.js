// src/auth/authService.js
import { msalInstance, loginRequest} from '../../authconfig.js';

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
            if (!loginRequest || !loginRequest.scopes) {
                console.error('loginRequest or loginRequest.scopes is undefined');
                throw new Error('loginRequest or loginRequest.scopes is undefined');
            }
            console.log('Requesting scopes:', loginRequest.scopes); // Debugging: Log requested scopes
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            console.log('Login response:', loginResponse);
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
    getTokenClaims: () => {
        return msalInstance.getAllAccounts()[0];
    },
    getAccessToken: () => {
        return localStorage.getItem('accessToken');
    }
};

export default authService;