import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../../authconfig.js';
import MUIDataTable from "mui-datatables";

const msalInstance = new PublicClientApplication(msalConfig);

const Capolicies = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState('');

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

    useEffect(() => {
        // Access token retrieval
        const token = localStorage.getItem('accessToken');
        if (token) {
            setAccessToken(token);
        } else {
            // Handle the case where there is no token in local storage
            console.log('No access token found in local storage.');
        }
    }, []);

    const handleLogin = async () => {
        console.log('Login button clicked');
        try {
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            console.log('Login response:', loginResponse);
            const account = msalInstance.getAllAccounts()[0];
            if (account) {
                const tokenResponse = await msalInstance.acquireTokenSilent({
                    ...loginRequest,
                    account,
                });
                console.log('Token response:', tokenResponse);
                setAccessToken(tokenResponse.accessToken);
                localStorage.setItem('accessToken', tokenResponse.accessToken);
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const fetchData = async (token) => {
        setLoading(true);
        try {
            const response = await axios.get('https://api.intuneassistant.cloud/v1/policies/ca', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (accessToken) {
            fetchData(accessToken);
        }
    }, [accessToken]);


    if (!accessToken) {
        return <button onClick={handleLogin}>Login with Microsoft</button>;
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    const columns = [
        {
            name: "id",
            label: "ID",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "displayName",
            label: "Name",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "state",
            label: "Value",
            options: {
                filter: true,
                sort: false,
            }
        }
    ];

    const options = {
        filterType: 'checkbox',
    };




    return (
        <MUIDataTable
            title={"Policy List"}
            data={data}
            columns={columns}
            options={options}
        />
    );
};


export default Capolicies;