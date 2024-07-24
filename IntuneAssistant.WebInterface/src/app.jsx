import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@components/auth/authprovider.jsx';

import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={

                            <HomePage />

                    } />
                    {/* Define more routes here */}
                </Routes>
            </Router>
        </AuthProvider>
    );
};