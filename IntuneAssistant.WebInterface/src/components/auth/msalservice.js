import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../../authconfig';

const msalInstance = new PublicClientApplication(msalConfig);

let accessToken = ''; // Store the access token globally

// Function to get the access token
const getAccessToken = async () => {
    if (!accessToken) {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            try {
                const response = await msalInstance.acquireTokenSilent({
                    ...msalConfig.auth,
                    account: accounts[0],
                });
                accessToken = response.accessToken;
            } catch (error) {
                console.error('Error acquiring access token silently', error);
                // Fallback to interactive method if silent token acquisition fails
                try {
                    const response = await msalInstance.acquireTokenPopup(msalConfig.auth);
                    accessToken = response.accessToken;
                } catch (popupError) {
                    console.error('Error acquiring access token through popup', popupError);
                }
            }
        }
    }
    return accessToken;
};

export { msalInstance, getAccessToken };