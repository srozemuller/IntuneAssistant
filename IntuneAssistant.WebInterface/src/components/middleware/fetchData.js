import axios from 'axios';
import authService from '@/components/auth/msalservice';

const authDataMiddleware = async (endpoint) => {
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
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
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