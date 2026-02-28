// contexts/ConsentContext.tsx
'use client';

import React, { createContext, useState, useContext, useCallback } from "react";

interface ConsentContextType {
    needsConsent: boolean;
    consentUrl: string | null;
    requiredPermissions: string[];
    isMinimized: boolean;
    setConsentNeeded: (url: string, permissions: string[]) => void;
    clearConsent: () => void;
    minimize: () => void;
    maximize: () => void;
    resetVerification: () => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [needsConsent, setNeedsConsent] = useState(false);
    const [consentUrl, setConsentUrl] = useState<string | null>(null);
    const [requiredPermissions, setRequiredPermissions] = useState<string[]>([]);
    const [isMinimized, setIsMinimized] = useState(false);

    const setConsentNeeded = useCallback((url: string, permissions: string[]) => {
        setNeedsConsent(true);
        setConsentUrl(url);
        setRequiredPermissions(permissions);

        // Start minimized by default for better UX (less intrusive)
        // Check if user previously maximized it in this session
        const wasMaximized = sessionStorage.getItem('ia_consent_minimized') === 'false';
        setIsMinimized(!wasMaximized); // Default to minimized unless user explicitly maximized before
    }, []);

    const clearConsent = useCallback(() => {
        setNeedsConsent(false);
        setConsentUrl(null);
        setRequiredPermissions([]);
        setIsMinimized(false);
        sessionStorage.removeItem('ia_consent_minimized');
    }, []);

    const minimize = useCallback(() => {
        setIsMinimized(true);
        sessionStorage.setItem('ia_consent_minimized', 'true');
    }, []);

    const maximize = useCallback(() => {
        setIsMinimized(false);
        sessionStorage.setItem('ia_consent_minimized', 'false');
    }, []);

    const resetVerification = useCallback(() => {
        sessionStorage.removeItem('ia_consent_minimized');
        sessionStorage.removeItem('ia_consent_verified');
    }, []);

    return (
        <ConsentContext.Provider value={{
            needsConsent,
            consentUrl,
            requiredPermissions,
            isMinimized,
            setConsentNeeded,
            clearConsent,
            minimize,
            maximize,
            resetVerification
        }}>
            {children}
        </ConsentContext.Provider>
    );
};

export const useConsent = () => {
    const context = useContext(ConsentContext);
    if (context === undefined) {
        throw new Error("useConsent must be used within a ConsentProvider");
    }
    return context;
};

