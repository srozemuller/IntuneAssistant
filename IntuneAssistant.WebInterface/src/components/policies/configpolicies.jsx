import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../auth/msalservice.js';
import { loginRequest } from '../../authconfig.js';
import MUIDataTable from "mui-datatables";

const Configpolicies = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        const initializeMsal = async () => {
            try {
                await authService.initialize();
                console.log('MSAL initialized');
            } catch (error) {
                console.error('MSAL initialization error:', error);
            }
        };
        initializeMsal();
    }, []);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        setAccessToken(accessToken);
    }, []);

    const handleLogin = async () => {
        try {
            const accessToken = await authService.login(loginRequest);
            console.log('Logged in, access token:', accessToken);
            setAccessToken(accessToken);
            // Update UI or state as needed
        } catch (error) {
            console.error('Failed to log in:', error);
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


export default Configpolicies;