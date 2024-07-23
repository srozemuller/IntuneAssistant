import React from 'react';
import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" />;
    }

    return children;
};