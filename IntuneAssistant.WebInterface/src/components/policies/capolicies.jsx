import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import authDataMiddleware from "../../middleware/fetchData.js";
import {CA_POLICIES_ENDPOINT} from "../../constants/apiUrls.js";

const CaPolicies = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await authDataMiddleware(CA_POLICIES_ENDPOINT);
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
            name: "displayName",
            label: "Display Name",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "state",
            label: "State",
            options: {
                filter: true,
                sort: false,
                customBodyRender: (state) => {
                    if (state === "enabled") {
                        return "✅"; // Or <Icon> for a UI library icon
                    } else if (state === "disabled") {
                        return "❌"; // Or <Icon> for a UI library icon
                    } else if (state === "enabledForReportingButNotEnforced") {
                        return "⚠️"; // Or <Icon> for a UI library icon
                    }
                    return state; // Default text if neither
                },
            }
        },
        {
            name: "conditions.users.includeUsersReadable",
            label: "Included Users",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    // Access the rowData for the current row
                    const rowData = data[tableMeta.rowIndex];
                    // Check if 'conditions' and 'users' exist and are not undefined
                    if (rowData.conditions && rowData.conditions.users && rowData.conditions.users.includeUsersReadable) {
                        // Access the 'includeUsers' array and join the values with a comma
                        return rowData.conditions.users.includeUsersReadable.map(user => user.displayName).join(", ");
                    } else {
                        // Return a default value or message if 'conditions' or 'users' or 'includeUsers' is undefined
                        return "-";
                    }
                },
            }
        },
        {
            name: "conditions.users.excludeUsersReadable",
            label: "Excluded Users",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    // Access the rowData for the current row
                    const rowData = data[tableMeta.rowIndex];
                    // Check if 'conditions' and 'users' exist and are not undefined
                    if (rowData.conditions && rowData.conditions.users && rowData.conditions.users.excludeUsersReadable) {
                        // Access the 'includeUsers' array and join the values with a comma
                        return rowData.conditions.users.excludeUsersReadable.map(user => user.displayName).join(", ");
                    } else {
                        // Return a default value or message if 'conditions' or 'users' or 'includeUsers' is undefined
                        return "-";
                    }
                },
            }
        },
        {
            name: "conditions.users.includeGroupsReadable",
            label: "Included Groups",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    // Access the rowData for the current row
                    const rowData = data[tableMeta.rowIndex];
                    // Check if 'conditions' and 'users' exist and are not undefined
                    if (rowData.conditions && rowData.conditions.users && rowData.conditions.users.includeGroupsReadable) {
                        // Access the 'includeUsers' array and join the values with a comma
                        return rowData.conditions.users.includeGroupsReadable.map(user => user.displayName).join(", ");
                    } else {
                        // Return a default value or message if 'conditions' or 'users' or 'includeUsers' is undefined
                        return "-";
                    }
                },
            }
        },
        {
            name: "conditions.users.excludeGroupsReadable",
            label: "Excluded Groups",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    // Access the rowData for the current row
                    const rowData = data[tableMeta.rowIndex];
                    // Check if 'conditions' and 'users' exist and are not undefined
                    if (rowData.conditions && rowData.conditions.users && rowData.conditions.users.excludeGroupsReadable) {
                        // Access the 'includeUsers' array and join the values with a comma
                        return rowData.conditions.users.excludeGroupsReadable.map(user => user.displayName).join(", ");
                    } else {
                        // Return a default value or message if 'conditions' or 'users' or 'includeUsers' is undefined
                        return "-";
                    }
                },
            }
        },
        {
            name: "modifiedDateTime",
            label: "Last Modified",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "createdDateTime",
            label: "Created Date",
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

export default CaPolicies;