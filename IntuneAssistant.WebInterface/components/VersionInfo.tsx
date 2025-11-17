// components/VersionInfo.tsx
import React, { useState, useEffect } from 'react';
import { VERSION_ENDPOINT } from '@/lib/constants';

interface VersionData {
    version: string;
    environment: string;
    commitHash: string;
    buildDate: string;
    lastDeployed: string;
    builder: string;
    assemblyVersion: string;
}

interface VersionResponse {
    status: string;
    message: string;
    details: string;
    data: VersionData;
}

interface VersionInfoProps {
    compact?: boolean;
}
export const VersionInfo: React.FC<VersionInfoProps> = ({ compact = false }) => {
    const [versionData, setVersionData] = useState<VersionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('VersionInfo useEffect triggered, fetching from:', VERSION_ENDPOINT);

        fetch(VERSION_ENDPOINT)
            .then(res => {
                console.log('Fetch response received:', res.status);
                if (!res.ok) {
                    throw new Error('Failed to fetch version');
                }
                return res.json();
            })
            .then((data: VersionResponse) => {
                console.log('Version data parsed:', data);
                if (data.status === 'OK' && data.data) {
                    setVersionData(data.data);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Failed to fetch version:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="px-4 py-2 bg-gray-50">
                <div className="text-xs text-gray-500">Loading version...</div>
            </div>
        );
    }

    if (!versionData) {
        return (
            <div className="px-4 py-2 bg-gray-50">
                <div className="text-xs text-gray-500">Version unavailable</div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="px-4 py-2 bg-gray-50">
                <div className="flex justify-between items-center text-xs text-gray-600">
                    <span className="font-mono">v{versionData.version}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        versionData.environment === 'PROD' ? 'bg-green-100 text-green-800' :
                            versionData.environment === 'TEST' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                    }`}>
                        {versionData.environment}
                    </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {versionData.commitHash}
                </div>
            </div>
        );
    }

    // Full version display (your existing implementation)
    return (
        <div className="version-info p-4">
            <h3 className="text-lg font-semibold mb-2">System Information</h3>
            <dl className="space-y-1 text-sm">
                <div className="flex">
                    <dt className="font-medium w-32">Version:</dt>
                    <dd>{versionData.version}</dd>
                </div>
                <div className="flex">
                    <dt className="font-medium w-32">Environment:</dt>
                    <dd>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            versionData.environment === 'PROD' ? 'bg-green-100 text-green-800' :
                                versionData.environment === 'TEST' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                        }`}>
                            {versionData.environment}
                        </span>
                    </dd>
                </div>
                <div className="flex">
                    <dt className="font-medium w-32">Commit:</dt>
                    <dd className="font-mono">{versionData.commitHash}</dd>
                </div>
                <div className="flex">
                    <dt className="font-medium w-32">Build Date:</dt>
                    <dd>{new Date(versionData.buildDate).toLocaleString()}</dd>
                </div>
                <div className="flex">
                    <dt className="font-medium w-32">Last Deployed:</dt>
                    <dd>{new Date(versionData.lastDeployed).toLocaleString()}</dd>
                </div>
                <div className="flex">
                    <dt className="font-medium w-32">Builder:</dt>
                    <dd>{versionData.builder}</dd>
                </div>
            </dl>
        </div>
    );
};
