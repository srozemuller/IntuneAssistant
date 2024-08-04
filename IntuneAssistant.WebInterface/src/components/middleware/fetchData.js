import axios from 'axios';
import authService from '@/auth/msalservice';

const authDataMiddleware =  async (endpoint, method = 'GET', body = {}) => {
    let formattedError = '';
    // Ensure MSAL is initialized
    if (!authService.isInitialized) {
        await authService.initialize();
    }

    authService.getAccessToken()
        .then(accessToken => {
            // Use the access token here
            console.log('Access Token:', accessToken);
        })
        .catch(error => {
            // Handle any errors here
            console.error('Error fetching access token:', error);
        });

    // Fetch data using the access token
    try {
        let response;
        const accessToken = localStorage.getItem('accessToken');
        switch (method) {
            case 'GET':
                response = await axios.get(endpoint,{
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                break;
            case 'POST':
                console.log(`POST ${body}`);
                response = await axios.post(endpoint, body, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
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
            console.log('Error:', error.response.statusText);
            formattedError = `${ error.response.statusText }, ${ error.response.status } `;
        }
        throw new Error(formattedError);
    }
};

export default authDataMiddleware;