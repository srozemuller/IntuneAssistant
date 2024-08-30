"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { type Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button.tsx"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"


import { policySchema } from "@/components/policies/configuration/schema.tsx"
import {ExternalLink} from "lucide-react";

interface DataTableRowActionsProps<TData extends { id: string }> {
    row: Row<TData>
}

export function DataTableRowActions<TData extends { id: string }>({
                                               row,
                                           }: DataTableRowActionsProps<TData>) {
    const task = policySchema.parse(row.original)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <DotsHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem asChild>
                    <a href={`https://intune.microsoft.com/#view/Microsoft_Intune_Workflows/PolicySummaryBlade/policyId/${row.original.id}`} target="_blank" rel="noopener noreferrer">
                        Edit <ExternalLink className="h-3 w-3 ml-3" />
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

