import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import authDataMiddleware from "../../middleware/fetchData.js";
import {CONFIGURATION_POLICIES_ENDPOINT} from "../../constants/apiUrls.js";

const ConfigPolicies = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await authDataMiddleware(CONFIGURATION_POLICIES_ENDPOINT);
                setData(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    const columns = [
        {
            name: "name",
            label: "Display Name",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "description",
            label: "Description",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "settingCount",
            label: "Settings count",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "assignments",
            label: "Assigned",
            options: {
                filter: true,
                sort: false,
                customBodyRender: (value, tableMeta, updateValue) => {
                    // Check if 'assignments' is not null and has elements
                    if (value && Array.isArray(value) && value.length > 0) {
                        // Implement how you want to display the assignments
                        // For example, join names with a comma or simply display the count
                        return "Assigned"; // Assuming 'value' is an array of strings
                    } else {
                        // Return "No Assignments" if 'assignments' is null or empty
                        return "No Assignments";
                    }
                },
            }
        },
        {
            name: "lastModifiedDateTime",
            label: "Last Modified",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "createdDateTime",
            label: "Created",
            options: {
                filter: true,
                sort: true,
            }
        },
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

export default ConfigPolicies;