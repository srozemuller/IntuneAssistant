import * as msal from '../node_modules/@azure/msal-browser';
const msalConfig = {
    auth: {
        clientId: '0f0f930f-a5c7-4da2-a985-8464d1ff51d0',
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
    scopes: ["api://6317a049-4e55-464f-80a1-0896b8309fec/access_as_user"]
};