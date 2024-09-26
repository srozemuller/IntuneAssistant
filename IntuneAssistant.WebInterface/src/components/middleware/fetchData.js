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
            scopes: ['api://b0533a36-0d90-4634-9f08-99a50b78b477/access_as_user'],
            account,
        });
        accessToken = tokenResponse.accessToken;
    } catch (error) {
        console.log("error: ", error);
        if (error.message && error.message.includes('interaction_required')) {
            // Token expired or invalid, prompt user to log in again
            await msalInstance.loginPopup();
            const tokenResponse = await msalInstance.acquireTokenSilent({
                scopes: ['api://b0533a36-0d90-4634-9f08-99a50b78b477/access_as_user'],
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
        return JSON.stringify(response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error response:', error.response);
            if (error.response.headers['www-authenticate']) {
                console.log('Error response headers:', error.response.headers);
                const authHeader = error.response.headers['www-authenticate'];
                const matches = authHeader.match(/consentUri="([^"]+)"/);
                if (matches && matches[1]) {
                    consentUri = matches[1];
                }
                const errorMessage = authHeader.match(/error_description="([^"]+)"/);
                if (errorMessage && errorMessage[1]) {
                    formattedError = errorMessage[1];
                } else {
                    formattedError = 'An error occurred. Please try again.';
                }
            } else {
                formattedError = `${error.response.statusText}, ${error.response.status}`;
            }
        } else {
            formattedError = error.message || 'An unknown error occurred';
        }
        throw { message: formattedError, consentUri };
    }
};

export default authDataMiddleware;