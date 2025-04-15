import * as msal from '@azure/msal-browser';

const legacyClientId = '0f0f930f-a5c7-4da2-a985-8464d1ff51d0';
const newClientId = '3448bc04-cdbe-4a07-8e24-7e0e6f6980c1';
const legacyApiScope = 'api://6317a049-4e55-464f-80a1-0896b8309fec/access_as_user';
const newApiScope = `api://afe66ddf-67d4-4d61-8a51-beca7b799f52/access_as_user`;

const useLegacy = (typeof window !== 'undefined' && sessionStorage.getItem('useLegacy') === 'true');

const msalConfig = {
    auth: {
        clientId: useLegacy ? legacyClientId : newClientId,
        authority: 'https://login.microsoftonline.com/organizations',
        redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321/authentication/login-callback',
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: true,
    },
};

const legacyMsalConfig = {
    auth: {
        clientId: legacyClientId,
        authority: 'https://login.microsoftonline.com/organizations',
        redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321/authentication/login-callback',
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: true,
    },
};

const loginRequest = {
    scopes: [useLegacy ? legacyApiScope : newApiScope],
};

const legacyRequest = {
    scopes: [legacyApiScope],
};


const msalInstance = new msal.PublicClientApplication(msalConfig);
const legacyMsalInstance = new msal.PublicClientApplication(legacyMsalConfig);
const clientId = useLegacy ? legacyClientId : newClientId;
const apiScope = useLegacy ? legacyApiScope : newApiScope;

export { msalConfig, loginRequest, msalInstance, clientId, apiScope, legacyMsalInstance, legacyRequest };