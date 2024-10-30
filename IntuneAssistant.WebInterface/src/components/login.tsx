// src/pages/LoginPage.tsx
import React from 'react';
import AuthButton from '@/components/auth';

const LoginPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Login</h1>
            <AuthButton />
        </div>
    );
};

export default LoginPage;