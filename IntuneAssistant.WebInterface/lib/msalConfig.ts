import { Configuration, PublicClientApplication } from '@azure/msal-browser';

const clientId = '3448bc04-cdbe-4a07-8e24-7e0e6f6980c1';
const apiScope = 'api://afe66ddf-67d4-4d61-8a51-beca7b799f52/access_as_user';

export const msalConfig: Configuration = {
    auth: {
        clientId: clientId,
        authority: 'https://login.microsoftonline.com/organizations', // Changed from 'common' to 'organizations'
        redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    },
    cache: {
        cacheLocation: 'sessionStorage', // Changed to sessionStorage
        storeAuthStateInCookie: true,
    }
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
    scopes: [apiScope], // Your custom API scope
    prompt: 'select_account'
};

export { clientId, apiScope };
