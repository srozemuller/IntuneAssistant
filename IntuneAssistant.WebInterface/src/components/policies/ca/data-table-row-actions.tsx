"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { type Row } from "@tanstack/react-table"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"

import { labels } from "@/components/policies/ca/fixed-values.tsx"
import { taskSchema } from "@/components/policies/ca/schema.tsx"

interface DataTableRowActionsProps<TData extends { id: string }> {
    row: Row<TData>
}

export function DataTableRowActions<TData extends { id: string }>({
                                               row,
                                           }: DataTableRowActionsProps<TData>) {
    const task = taskSchema.parse(row.original)

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
                    <a href={`https://portal.azure.com/#view/Microsoft_AAD_ConditionalAccess/PolicyBlade/policyId/${row.original.id}`} target="_blank" rel="noopener noreferrer">
                        Edit <ExternalLink className="h-3 w-3 ml-3" />
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}