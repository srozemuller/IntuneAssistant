// context/ConsentContext.tsx
import React, { createContext, useState, useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserConsentRequiredError } from "@/lib/apiRequest";

type ConsentContextType = {
    showConsent: (url: string) => void;
};

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [consentUrl, setConsentUrl] = useState<string | null>(null);

    const showConsent = (url: string) => setConsentUrl(url);

    return (
        <ConsentContext.Provider value={{ showConsent }}>
            {children}
            {consentUrl && (
                <Dialog open onOpenChange={() => setConsentUrl(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Permissions Required</DialogTitle>
                            <DialogDescription>
                                You need to grant additional permissions. Click below to consent.
                            </DialogDescription>
                        </DialogHeader>
                        <Button onClick={() => window.open(consentUrl, "_blank")}>Grant Permissions</Button>
                        <Button variant="outline" onClick={() => setConsentUrl(null)}>
                            I have consented, continue
                        </Button>
                    </DialogContent>
                </Dialog>
            )}
        </ConsentContext.Provider>
    );
};

export const useConsent = () => {
    const ctx = useContext(ConsentContext);
    if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
    return ctx;
};
