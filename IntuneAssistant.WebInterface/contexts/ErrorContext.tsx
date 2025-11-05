
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorContextType {
    showError: (message: string, retry?: () => void) => void;
    clearError: () => void;
    error: GlobalError | null;
}

interface GlobalError {
    message: string;
    retry?: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
    const [error, setError] = useState<GlobalError | null>(null);

    const showError = (message: string, retry?: () => void) => {
        setError({ message, retry });
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <ErrorContext.Provider value={{ showError, clearError, error }}>
            {children}
        </ErrorContext.Provider>
    );
}

export function useError() {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
}
