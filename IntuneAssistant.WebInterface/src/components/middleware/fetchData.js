import axios from 'axios';
import { msalInstance } from '@/components/auth';

const authDataMiddleware = async (endpoint, method = 'GET', body = {}) => {
    let formattedError = '';
    let consentUri = '';

    // Ensure MSAL is initialized
    await msalInstance.initialize();

    // Fetch access token
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
        await msalInstance.loginPopup();
        throw new Error('No accounts found. Please log in.');
    }

    const account = accounts[0];
    let accessToken;

    try {
        const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ['api://6317a049-4e55-464f-80a1-0896b8309fec/access_as_user'],
            account,
        });
        accessToken = tokenResponse.accessToken;
    } catch (error) {
        console.log("error: ", error);
        if (error.message && error.message.includes('interaction_required')) {
            // Token expired or invalid, prompt user to log in again
            await msalInstance.loginPopup();
            const tokenResponse = await msalInstance.acquireTokenSilent({
                scopes: ['api://6317a049-4e55-464f-80a1-0896b8309fec/access_as_user'],
                account,
            });
            accessToken = tokenResponse.accessToken;
        } else {
            throw error;
        }
    }

    // Fetch data using the access token
    try {
        let response;
        switch (method) {
            case 'GET':
                response = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                break;
            case 'POST':
                response = await axios.post(endpoint, body, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                break;
            // Add more cases for other HTTP methods as needed
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
        return response; // Return the full response object
    } catch (error) {
        if (error.response) {
            console.log('Error response:', error.response);
            if (error.response.data && error.response.data.message && error.response.data.message.includes("AADSTS65001")) {
                console.log('Error message in if:', error.response.data.message)
                // Handle user consent required error
                const neededScopes = error.response.data.details;
                if (neededScopes) {
                    const appId = '6317a049-4e55-464f-80a1-0896b8309fec'; // Replace with your actual app ID
                    const tenantId = msalInstance.getAllAccounts()[0].tenantId; // Assuming you have tenantId in userClaims
                    const scopes = neededScopes.join(' ');
                    const consentUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${appId}&response_type=code&redirect_uri=${window.location.origin}&response_mode=query&scope=${encodeURIComponent(scopes)}&state=12345`;

                    window.location.href = consentUrl;
                }
                return;
            }
            if (error.response.headers['www-authenticate']) {
                console.log('Error response headers:', error.response.headers);
                const authHeader = error.response.headers['www-authenticate'];
                const matches = authHeader.match(/consentUri="([^"]+)"/);

                if (matches && matches[1]) {
                    consentUri = matches[1];
                    window.location.href = consentUri; // Redirect to the consent URI
                }
                const errorMessage = authHeader.match(/error_description="([^"]+)"/);
                if (errorMessage && errorMessage[1]) {
                    formattedError = errorMessage[1];
                } else {
                    formattedError = 'An error occurred. Please try again.';
                }
            } else {
                formattedError = `${error.response.statusText}, ${error.response.status}, ${error.response.data}`;
            }
        } else {
            formattedError = error.message || 'An unknown error occurred';
        }
        throw { message: formattedError, consentUri };
    }
};

export default authDataMiddleware;