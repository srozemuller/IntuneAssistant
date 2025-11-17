'use client';
import React, { useState } from 'react';

// pages/version.tsx or app/version/page.tsx
import { VersionInfo } from '@/components/VersionInfo';

export default function VersionPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Version Information</h1>
    <div className="bg-white rounded-lg shadow-md">
        <VersionInfo />
        </div>
        </div>
        </div>
);
}
