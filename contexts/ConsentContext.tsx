// contexts/ConsentContext.tsx
'use client';

import React, { createContext, useState, useContext, useCallback, useEffect } from "react";

// A "consent required" answer is remembered for the browser session so the banner survives page
// reloads without re-probing the backend on every navigation (each probe is a failed OBO token
// request — see GitHub #719). Cleared on logout, tenant switch, and once consent is verified.
export const CONSENT_PENDING_KEY = 'ia_consent_pending';

interface PendingConsent {
    url: string;
    permissions: string[];
}

function readPendingConsent(): PendingConsent | null {
    try {
        const raw = sessionStorage.getItem(CONSENT_PENDING_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<PendingConsent>;
        if (typeof parsed.url !== 'string' || !parsed.url) return null;
        return { url: parsed.url, permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [] };
    } catch {
        return null;
    }
}

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
        try {
            sessionStorage.setItem(CONSENT_PENDING_KEY, JSON.stringify({ url, permissions }));
        } catch { /* storage unavailable — banner still shows for this page */ }

        // Default to bottom-right button; only expand if user explicitly maximized before
        const wasMaximized = sessionStorage.getItem('ia_consent_minimized') === 'false';
        setIsMinimized(!wasMaximized);
    }, []);

    const clearConsent = useCallback(() => {
        setNeedsConsent(false);
        setConsentUrl(null);
        setRequiredPermissions([]);
        setIsMinimized(false);
        sessionStorage.removeItem('ia_consent_minimized');
        sessionStorage.removeItem(CONSENT_PENDING_KEY);
    }, []);

    // Rehydrate a pending consent after a reload so the banner comes back without a new API probe.
    useEffect(() => {
        const pending = readPendingConsent();
        if (pending) {
            setConsentNeeded(pending.url, pending.permissions);
        }
    }, [setConsentNeeded]);

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
        sessionStorage.removeItem(CONSENT_PENDING_KEY);
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

