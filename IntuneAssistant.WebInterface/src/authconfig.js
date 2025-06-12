import * as msal from '@azure/msal-browser';

const clientId = '3448bc04-cdbe-4a07-8e24-7e0e6f6980c1';
const apiScope = `api://afe66ddf-67d4-4d61-8a51-beca7b799f52/access_as_user`;

const msalConfig = {
    auth: {
        clientId: clientId,
        authority: 'https://login.microsoftonline.com/organizations',
        redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321/authentication/login-callback',
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: true,
    },
};



const loginRequest = {
    scopes: [apiScope],
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

export { msalConfig, loginRequest, msalInstance, clientId, apiScope };