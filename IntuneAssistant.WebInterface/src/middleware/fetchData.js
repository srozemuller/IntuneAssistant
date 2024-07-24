import axios from 'axios';
import authService from '../components/auth/msalservice';

const authDataMiddleware = async (endpoint) => {
    // Ensure MSAL is initialized
    if (!authService.isInitialized) {
        await authService.initialize();
    }

    let accessToken = localStorage.getItem('accessToken');

    // If no access token, login and set the token
    if (!accessToken) {
        try {
            accessToken = await authService.login();
            localStorage.setItem('accessToken', accessToken);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    // Fetch data using the access token
    try {
        const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export default authDataMiddleware;