import axios from 'axios';
import { msalInstance } from '@/components/auth';


const authDataMiddleware = async (endpoint, method = 'GET', body = {}) => {
    let formattedError = '';

    // Ensure MSAL is initialized
    await msalInstance.initialize();

    // Fetch access token
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
        await msalInstance.loginPopup();
        throw new Error('No accounts found. Please log in.');
    }

    const account = accounts[0];
    const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ['api://b0533a36-0d90-4634-9f08-99a50b78b477/access_as_user'],
        account,
    });

    const accessToken = tokenResponse.accessToken;

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
        if (error.response && error.response.headers['www-authenticate']) {
            const authHeader = error.response.headers['www-authenticate'];
            const matches = authHeader.match(/error_description="([^"]+)"/);
            if (matches && matches[1]) {
                formattedError = matches[1];
            } else {
                formattedError = 'An error occurred. Please try again.';
            }
        } else {
            formattedError = `${error.response.statusText}, ${error.response.status}`;
        }
        throw new Error(formattedError);
    }
};

export default authDataMiddleware;