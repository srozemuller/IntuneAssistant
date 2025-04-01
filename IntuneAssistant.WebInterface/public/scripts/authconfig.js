import * as msal from '../../node_modules/@azure/msal-browser';
const msalConfig = {
    auth: {
        clientId: '3448bc04-cdbe-4a07-8e24-7e0e6f6980c1',
        authority: 'https://login.microsoftonline.com/organizations',
        redirectUri: 'https://intuneassistant.cloud',
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: true,
    },
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

export { msalInstance };
export const loginRequest = {
    scopes: ["api://afe66ddf-67d4-4d61-8a51-beca7b799f52/access_as_user"]
};