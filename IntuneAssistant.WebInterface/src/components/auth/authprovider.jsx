import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async () => {
        // Implement login logic here
        setCurrentUser({ name: 'John Doe' }); // Example user
        setLoading(false);
    };

    const logout = () => {
        // Implement logout logic here
        setCurrentUser(null);
    };

    useEffect(() => {
        // Check for existing session
        setLoading(false);
    }, []);

    const value = { currentUser, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};