import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import authDataMiddleware from "../../middleware/fetchData.js";
import {ASSIGNMENTS_ENDPOINT} from "../../constants/apiUrls.js";

const Assignments = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await authDataMiddleware(ASSIGNMENTS_ENDPOINT);
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
        return (
            <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const columns = [
        {
            name: "resourceType",
            label: "Type",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "resourceName",
            label: "Display Name",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "isAssigned",
            label: "Assigned",
            options: {
                filter: true,
                sort: false,
                customBodyRender: (isAssigned) => {
                    if (isAssigned) {
                        return "✅"; // Or <Icon> for a UI library icon
                    } else {
                        return "❌"; // Or <Icon> for a UI library icon
                    }
                }
            }
        },
        {
            name: "assignmentType",
            label: "Assignment Type",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "resourceId",
            label: "Entra ID Group",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "filterId",
            label: "Filter ID",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "filterType",
            label: "Filter Type",
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

export default Assignments;