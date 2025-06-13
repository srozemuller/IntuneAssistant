// src/components/policies/ca/device-filter.tsx
import React from "react";
import { Plus, Check } from "lucide-react";
import { type Column } from "@tanstack/react-table"; // Make sure to use type keyword
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DeviceFilterProps<TData, TValue> {
    column: Column<TData, TValue>;
    title: string;
}

export function DeviceFilter<TData, TValue>({
                                                column,
                                                title,
                                            }: DeviceFilterProps<TData, TValue>) {
    const options = [
        { value: "compliant", label: "Compliant Device" },
        { value: "non-compliant", label: "Non-Compliant Device" },
        { value: "hybrid-joined", label: "Hybrid Joined" },
    ];

    const selectedValues = new Set(column.getFilterValue() as string[] || []);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <Plus className="mr-2 h-4 w-4" />
                    {title}
                    {selectedValues.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                            >
                                {selectedValues.size}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selectedValues.size > 2 ? (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal"
                                    >
                                        {selectedValues.size} selected
                                    </Badge>
                                ) : (
                                    Array.from(selectedValues).map((value) => {
                                        const option = options.find((opt) => opt.value === value);
                                        return (
                                            <Badge
                                                variant="secondary"
                                                key={value}
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {option?.label || value}
                                            </Badge>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selectedValues.has(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            const newSelectedValues = new Set(selectedValues);
                                            if (isSelected) {
                                                newSelectedValues.delete(option.value);
                                            } else {
                                                newSelectedValues.add(option.value);
                                            }

                                            const filterValues = Array.from(newSelectedValues);
                                            column.setFilterValue(
                                                filterValues.length ? filterValues : undefined
                                            );
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className="h-4 w-4" />
                                        </div>
                                        <span>{option.label}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selectedValues.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => column.setFilterValue(undefined)}
                                        className="justify-center text-center"
                                    >
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}