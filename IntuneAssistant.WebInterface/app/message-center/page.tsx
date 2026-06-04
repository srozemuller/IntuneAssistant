"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessageCenter } from "@/contexts/MessageCenterContext";
import type { MessageCenterItem, MessageType } from "@/types/messageCenter";
import { cn } from "@/lib/utils";
import {
    AlertCircle, Bell, CheckCheck, CheckCircle2,
    Info, Megaphone, MailOpen, RefreshCw, Wrench, Zap,
} from "lucide-react";

// ─── Message type config ──────────────────────────────────────────────────────

const TYPE_CONFIG: Record<MessageType, {
    label: string;
    border: string;
    bg: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
}> = {
    0: { label: "Information", border: "border-l-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/20",   badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: Info },
    1: { label: "Warning",     border: "border-l-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/20", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: AlertCircle },
    2: { label: "Maintenance", border: "border-l-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: Wrench },
    3: { label: "Feature",     border: "border-l-green-500",  bg: "bg-green-50 dark:bg-green-950/20",  badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: Zap },
};

type FilterTab = "all" | "unread" | "maintenance" | "feature" | "warning" | "information";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtRelative(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60_000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d === 1 ? "" : "s"} ago`;
}

function fmtExpiry(iso: string | null): string | null {
    if (!iso) return null;
    return "Expires " + new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function MessageSkeleton() {
    return (
        <div className="border-l-4 border-l-muted rounded-lg p-5 space-y-3 bg-muted/20 animate-pulse">
            <div className="flex gap-3">
                <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        </div>
    );
}

// ─── Message card ─────────────────────────────────────────────────────────────

interface MessageCardProps {
    message: MessageCenterItem;
    isRead: boolean;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
}

function MessageCard({ message, isRead, isSelected, onToggleSelect }: MessageCardProps) {
    const cfg = TYPE_CONFIG[message.messageType];
    const Icon = cfg.icon;
    const expiry = fmtExpiry(message.expirationDate);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onToggleSelect(message.id)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onToggleSelect(message.id)}
            className={cn(
                "relative border-l-4 rounded-lg p-5 transition-all duration-150 cursor-pointer select-none",
                "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                cfg.border,
                cfg.bg,
                isSelected
                    ? "ring-2 ring-primary/60 shadow-sm"
                    : "hover:brightness-95 dark:hover:brightness-110",
            )}
        >
            {/* Selected checkmark — top-left corner */}
            <span className={cn(
                "absolute top-3 left-[-2px] flex h-5 w-5 items-center justify-center rounded-full transition-all duration-150",
                isSelected
                    ? "bg-primary text-primary-foreground scale-100 opacity-100"
                    : "scale-75 opacity-0",
            )}>
                <CheckCircle2 className="h-4 w-4" />
            </span>

            {/* Orange unread dot — only shown when unread and not selected */}
            {!isRead && !isSelected && (
                <span className="absolute top-3.5 right-3.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-background" />
            )}

            <div className="flex items-start gap-3">
                <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", cfg.badge.split(" ")[1])} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm leading-snug">
                            {message.title}
                        </h3>
                        <Badge className={cn("text-[10px] h-4 px-1.5 shrink-0", cfg.badge)}>
                            {cfg.label}
                        </Badge>
                    </div>

                    <p className="text-sm mt-1.5 leading-relaxed whitespace-pre-line text-foreground/80">
                        {message.description}
                    </p>

                    <div className="flex items-center gap-3 mt-2.5 flex-wrap text-xs text-muted-foreground">
                        <span>{fmtRelative(message.createdAt)}</span>
                        {expiry && (
                            <>
                                <span className="text-border">·</span>
                                <span className={cn(message.messageType === 1 && "text-amber-600 dark:text-amber-400 font-medium")}>
                                    {expiry}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessageCenterPage() {
    const { messages, isLoading, error, readIds, markRead, markUnread, markAllRead, refetch } = useMessageCenter();

    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // ── Filter out expired messages ───────────────────────────────────────────
    const activeMessages = useMemo(() => {
        const now = new Date();
        return messages.filter(m => !m.expirationDate || new Date(m.expirationDate) > now);
    }, [messages]);

    const activeUnreadCount = useMemo(
        () => activeMessages.filter(m => !readIds.includes(m.id)).length,
        [activeMessages, readIds],
    );

    // ── Filter tabs with live counts ──────────────────────────────────────────
    const tabs: { key: FilterTab; label: string; count?: number }[] = useMemo(() => [
        { key: "all",         label: "All",         count: activeMessages.length },
        { key: "unread",      label: "Unread",      count: activeUnreadCount },
        { key: "maintenance", label: "Maintenance",  count: activeMessages.filter(m => m.messageType === 2).length },
        { key: "feature",     label: "Feature",     count: activeMessages.filter(m => m.messageType === 3).length },
        { key: "warning",     label: "Warning",     count: activeMessages.filter(m => m.messageType === 1).length },
        { key: "information", label: "Information", count: activeMessages.filter(m => m.messageType === 0).length },
    ], [activeMessages, activeUnreadCount]);

    const visible = useMemo(() => {
        switch (activeTab) {
            case "unread":      return activeMessages.filter(m => !readIds.includes(m.id));
            case "maintenance": return activeMessages.filter(m => m.messageType === 2);
            case "feature":     return activeMessages.filter(m => m.messageType === 3);
            case "warning":     return activeMessages.filter(m => m.messageType === 1);
            case "information": return activeMessages.filter(m => m.messageType === 0);
            default:            return activeMessages;
        }
    }, [activeMessages, readIds, activeTab]);

    // ── Select helpers ────────────────────────────────────────────────────────
    const allVisibleSelected = visible.length > 0 && visible.every(m => selected.has(m.id));
    const someSelected = selected.size > 0;

    const toggleSelect = (id: string) =>
        setSelected(prev => {
            const s = new Set(prev);
            if (s.has(id)) { s.delete(id); } else { s.add(id); }
            return s;
        });

    const toggleSelectAll = () => {
        if (allVisibleSelected) {
            setSelected(prev => { const s = new Set(prev); visible.forEach(m => s.delete(m.id)); return s; });
        } else {
            setSelected(prev => new Set([...prev, ...visible.map(m => m.id)]));
        }
    };

    const handleMarkSelected = () => {
        markRead([...selected]);
        setSelected(new Set());
    };

    const handleMarkSelectedUnread = () => {
        markUnread([...selected]);
        setSelected(new Set());
    };

    const handleMarkAll = () => {
        markAllRead();
        setSelected(new Set());
    };

    // Toolbar button enable logic — based on what's actually in the selection
    const selectedIds = [...selected];
    const canMarkRead   = selectedIds.some(id => !readIds.includes(id));
    const canMarkUnread = selectedIds.some(id =>  readIds.includes(id));

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                        <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            Message Center
                            {activeUnreadCount > 0 && (
                                <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-orange-500 text-white text-xs font-bold">
                                    {activeUnreadCount}
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Platform announcements, maintenance windows, and feature updates.
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4 mr-1.5", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive flex-1">{error}</p>
                    <Button variant="destructive" size="sm" onClick={refetch}>Retry</Button>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex items-center gap-1 flex-wrap border-b pb-0">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSelected(new Set()); }}
                        className={cn(
                            "relative px-3 py-2 text-sm font-medium transition-colors rounded-t-lg -mb-px",
                            activeTab === tab.key
                                ? "text-foreground border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={cn(
                                "ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                                tab.key === "unread"
                                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                    : "bg-muted text-muted-foreground",
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            {!isLoading && visible.length > 0 && (
                <div className="flex items-center gap-3 py-1">
                    <button
                        onClick={toggleSelectAll}
                        aria-label="Select all"
                        className={cn(
                            "h-4 w-4 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                            allVisibleSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/40 hover:border-primary",
                        )}
                    >
                        {allVisibleSelected && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                    <span className="text-xs text-muted-foreground">
                        {someSelected ? `${selected.size} selected` : "Select all"}
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!someSelected || !canMarkRead}
                            onClick={handleMarkSelected}
                            className="gap-1.5"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark as read
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!someSelected || !canMarkUnread}
                            onClick={handleMarkSelectedUnread}
                            className="gap-1.5"
                        >
                            <MailOpen className="h-3.5 w-3.5" />
                            Mark as unread
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAll}
                            disabled={activeUnreadCount === 0}
                            className="gap-1.5 text-muted-foreground"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all as read
                        </Button>
                    </div>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <MessageSkeleton key={i} />)}
                </div>
            ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                    <div className="p-5 rounded-full bg-muted/30">
                        <Megaphone className="h-10 w-10 opacity-30" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-base">
                            {activeTab === "unread" ? "All caught up!" : "No messages"}
                        </p>
                        <p className="text-sm mt-1">
                            {activeTab === "unread"
                                ? "You have no unread messages."
                                : "There are no messages in this category."}
                        </p>
                    </div>
                    {activeTab !== "all" && (
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("all")}>
                            View all messages
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {visible.map(msg => (
                        <MessageCard
                            key={msg.id}
                            message={msg}
                            isRead={readIds.includes(msg.id)}
                            isSelected={selected.has(msg.id)}
                            onToggleSelect={toggleSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

