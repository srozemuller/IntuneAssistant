import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '@/scripts/msalservice';

interface UserClaims {
    tenantId: string;
    name: string;
    username: string;
    homeAccountId: string;
}

interface UserContextProps {
    userClaims: UserClaims | null;
}

const UserContext = createContext<UserContextProps>({ userClaims: null });

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userClaims, setUserClaims] = useState<UserClaims | null>(null);

    useEffect(() => {
        if (authService.isLoggedIn()) {
            const claims = authService.getTokenClaims();
            setUserClaims(
                {
                    tenantId: claims.tenantId,
                    name: claims.name || 'Unknown',
                    username: claims.username,
                    homeAccountId: claims.homeAccountId
                }
            );
        }
    }, []);

    return (
        <UserContext.Provider value={{ userClaims }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);