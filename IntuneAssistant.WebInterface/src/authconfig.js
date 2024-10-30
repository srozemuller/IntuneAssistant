import * as msal from '../node_modules/@azure/msal-browser';
const msalConfig = {
    auth: {
        clientId: '131386a4-d462-4270-ac50-7ebc4685da14',
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
    scopes: ["api://b0533a36-0d90-4634-9f08-99a50b78b477/access_as_user"]
};