"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useApiRequest } from "@/hooks/useApiRequest";
import { MESSAGE_CENTER_ENDPOINT } from "@/lib/constants";
import type { MessageCenterItem, MessageCenterResponse } from "@/types/messageCenter";
import { useCustomer } from "@/contexts/CustomerContext";

const LS_KEY = "ia_message_center_read_ids";

export function getReadIds(): string[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
}
function persistReadIds(ids: string[]): void {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

export interface MessageCenterContextValue {
    messages: MessageCenterItem[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    readIds: string[];
    markRead: (ids: string[]) => void;
    markUnread: (ids: string[]) => void;
    markAllRead: () => void;
    refetch: () => void;
}

const MessageCenterContext = createContext<MessageCenterContextValue>({
    messages: [], unreadCount: 0, isLoading: false, error: null, readIds: [],
    markRead: () => {}, markUnread: () => {}, markAllRead: () => {}, refetch: () => {},
});

export function MessageCenterProvider({ children }: { children: React.ReactNode }) {
    // Follow the same pattern used in every other page:
    // get accounts from useMsal and guard the fetch until accounts are present.
    const { accounts } = useMsal();
    const { request } = useApiRequest();
    const { isActiveCustomer, customerLoading } = useCustomer();

    // Keep request in a ref so fetchMessages (stable callback) always
    // uses the latest token/tenant without being recreated on every render.
    const requestRef = useRef(request);
    useEffect(() => { requestRef.current = request; }, [request]);

    const [messages, setMessages] = useState<MessageCenterItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [readIds, setReadIds] = useState<string[]>(() => getReadIds());
    const fetchedRef = useRef(false);

    // Stable fetch function — uses requestRef so it never captures a stale closure.
    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await requestRef.current<MessageCenterResponse>(
                MESSAGE_CENTER_ENDPOINT,
                { method: "GET" }
            );
            const data = res?.data?.data;
            if (Array.isArray(data)) setMessages(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    }, []); // stable — requestRef.current is always current

    // Trigger once as soon as the MSAL account is available AND the customer is
    // confirmed as active/onboarded. Skip entirely for unauthenticated or
    // non-onboarded users to avoid a 403/permission error.
    useEffect(() => {
        if (accounts.length === 0) return;
        if (customerLoading) return;       // wait for customer data to resolve
        if (!isActiveCustomer) return;     // not onboarded – skip silently
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchMessages();
    }, [accounts.length, customerLoading, isActiveCustomer, fetchMessages]);

    const markRead = useCallback((ids: string[]) => {
        setReadIds(prev => {
            const next = [...new Set([...prev, ...ids])];
            persistReadIds(next);
            return next;
        });
    }, []);

    const markUnread = useCallback((ids: string[]) => {
        setReadIds(prev => {
            const next = prev.filter(id => !ids.includes(id));
            persistReadIds(next);
            return next;
        });
    }, []);

    const markAllRead = useCallback(() => {
        const ids = messages.map(m => m.id);
        setReadIds(prev => {
            const next = [...new Set([...prev, ...ids])];
            persistReadIds(next);
            return next;
        });
    }, [messages]);

    // Allow callers to force a re-fetch (e.g. from the dropdown open handler).
    const refetch = useCallback(() => {
        fetchedRef.current = false; // allow re-entry
        fetchMessages();
    }, [fetchMessages]);

    const unreadCount = messages.filter(m => !readIds.includes(m.id)).length;

    return (
        <MessageCenterContext.Provider value={{
            messages, unreadCount, isLoading, error, readIds,
            markRead, markUnread, markAllRead, refetch,
        }}>
            {children}
        </MessageCenterContext.Provider>
    );
}

export function useMessageCenter(): MessageCenterContextValue {
    return useContext(MessageCenterContext);
}
