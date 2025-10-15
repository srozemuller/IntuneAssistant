// contexts/ConsentContext.tsx
import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConsentContextType = {
    showConsent: (url: string, completeCallback?: () => void) => void;
    hideConsent: () => void;
};

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Separate state for dialog visibility and URL
    const [isOpen, setIsOpen] = useState(false);
    const [consentUrl, setConsentUrl] = useState<string | null>(null);
    const [onComplete, setOnComplete] = useState<(() => void) | null>(null);

    // Force render on state changes
    useEffect(() => {
        console.log("ConsentDialog state changed - isOpen:", isOpen, "URL:", consentUrl);
    }, [isOpen, consentUrl]);

    const showConsent = useCallback((url: string, completeCallback?: () => void) => {
        setConsentUrl(url);
        setIsOpen(true);
        if (completeCallback) {
            setOnComplete(() => completeCallback);
        }
    }, []);

    const hideConsent = useCallback(() => {
        setIsOpen(false);

        // Execute callback after dialog closes
        if (onComplete) {
            setTimeout(() => {
                onComplete();
                setOnComplete(null);
            }, 100);
        }

        // Clear URL after dialog closes
        setTimeout(() => setConsentUrl(null), 300);
    }, [onComplete]);

    return (
        <ConsentContext.Provider value={{ showConsent, hideConsent }}>
            {children}

            {/* Force the Dialog to always be in the DOM but control visibility with open prop */}
            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) hideConsent();
                    else setIsOpen(true);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Additional Permissions Required</DialogTitle>
                        <DialogDescription>
                            Please grant the additional permissions to continue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <Button
                            onClick={() => {
                                if (consentUrl) window.open(consentUrl, "_blank");
                            }}
                            className="w-full"
                        >
                            Grant Permissions
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                hideConsent();
                            }}
                            className="w-full"
                        >
                            I&apos;ve granted permissions, continue
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
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
