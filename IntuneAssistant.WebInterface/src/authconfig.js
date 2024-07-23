export const msalConfig = {
    auth: {
        clientId: '131386a4-d462-4270-ac50-7ebc4685da14',
        authority: 'https://login.microsoftonline.com/organizations',
        redirectUri: 'http://localhost:4321/authentication/login-callback',
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: true,
    },
};

export const loginRequest = {
    scopes: ['api://b0533a36-0d90-4634-9f08-99a50b78b477/access_as_user']
};