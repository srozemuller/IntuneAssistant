"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { type Row } from "@tanstack/react-table"
import { useState } from "react"
import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx"


import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Textarea } from "@/components/ui/textarea"

import { policySchema } from "@/components/policies/configuration/schema.tsx"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import {ASSIGNMENTS_ENDPOINT, CONFIGURATION_POLICIES_ENDPOINT} from "@/components/constants/apiUrls";
import authDataMiddleware from "@/components/middleware/fetchData";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional()
})

interface DataTableRowActionsProps<TData extends { id: string }> {
    row: Row<TData>
}

export function DataTableRowActions<TData extends { id: string }>({
                                                                      row,
                                                                  }: DataTableRowActionsProps<TData>) {
    const policy = policySchema.parse(row.original)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: policy.name || "",
            description: policy.description || ""
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
// Fix the auth middleware call by removing the cancelSource parameter
            const response = await authDataMiddleware(
                `${CONFIGURATION_POLICIES_ENDPOINT}/${policy.id}`,
                'PATCH',
                JSON.stringify({
                    ...policy,
                    name: values.name,
                    description: values.description
                })
            ); // Remove cancelSource parameter

            if (response && response.status >= 200 && response.status < 300) {
                toast.success("Your policy has been successfully updated", {
                    position: toastPosition,
                    autoClose: toastDuration
                });
                setIsDialogOpen(false);
            } else {
                throw new Error('Failed to update policy');
            }

            setIsDialogOpen(false)
        } catch (error) {
            toast.error("Your policy has NOT been updated", {
                position: toastPosition,
                autoClose: toastDuration
            });
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
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
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
                                    Edit
                                </DropdownMenuItem>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit policy details</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <DropdownMenuItem asChild>
                        <a href={`https://intune.microsoft.com/#view/Microsoft_Intune_Workflows/PolicySummaryBlade/policyId/${policy.id}`} target="_blank" rel="noopener noreferrer">
                            Open in Intune <ExternalLink className="h-3 w-3 ml-3" />
                        </a>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    onEscapeKeyDown={() => setIsDialogOpen(false)}
                >
                    <DialogHeader >
                        <DialogTitle className="text-xl font-semibold">
                            Edit Policy: <span className="text-primary">{policy.name}</span>
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            Update the details for this configuration policy.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium">Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="transition-all focus:ring-2 focus:ring-offset-1 focus:ring-primary"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className="min-h-24 transition-all focus:ring-2 focus:ring-offset-1 focus:ring-primary"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="mt-6 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="transition-all"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save changes"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}