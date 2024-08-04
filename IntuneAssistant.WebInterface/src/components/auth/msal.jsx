import React, { useEffect } from 'react';
import { msalInstance, loginRequest } from '@/authconfig.js';

const MsalComponent = () => {
    useEffect(() => {
        const initializeMsal = async () => {
            try {
                await msalInstance.initialize();
                console.log('MSAL initialized');
                } catch (error) {
                console.error('MSAL initialization error:', error);
                }
            };

        initializeMsal();
        }, []);

    const login = async () => {
    try {
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        localStorage.setItem('loginResponse', JSON.stringify(loginResponse));
        console.log('Login response:', loginResponse);
        } catch (error) {
        console.error('Login error:', error);
        }
    };

    return <button onClick={login}>Login with MSAL</button>;
    };

export default MsalComponent;