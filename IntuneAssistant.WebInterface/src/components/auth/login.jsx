import React from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../../authconfig.js';

const LoginButton = () => {
    const handleLogin = async () => {
        const msalInstance = new PublicClientApplication(msalConfig);
        try {
            await msalInstance.initialize(); // Initialize MSAL before using it
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            console.log('Login response:', loginResponse);
            // Handle post-login actions here
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return <button onClick={handleLogin}>Login with Microsoft</button>;
};

export default LoginButton;