import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { AccountInfo } from '@azure/msal-browser';

export interface UseAuthReturn {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AccountInfo | null;
    login: () => void;
    logout: () => void;
    error: string | null;
}

export function useAuth(): UseAuthReturn {
    const { instance, accounts, inProgress } = useMsal();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Set loading to false once MSAL has finished initializing
        if (inProgress === 'none') {
            setIsLoading(false);
        }
    }, [inProgress]);

    const isAuthenticated = accounts.length > 0;
    const user = accounts.length > 0 ? accounts[0] : null;

    const login = async () => {
        try {
            setError(null);
            await instance.loginPopup();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await instance.logoutPopup();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Logout failed');
        }
    };

    return {
        isAuthenticated,
        isLoading: isLoading || inProgress !== 'none',
        user,
        login,
        logout,
        error
    };
}
