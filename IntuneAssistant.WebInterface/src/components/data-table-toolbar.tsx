import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-table-view-options"
import { statuses } from "@/components/policies/ca/fixed-values"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Button } from "@/components/ui/button"
import { Cross2Icon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { type Table } from "@tanstack/react-table"
import { useState } from "react"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    rawData: string
    fetchData: () => Promise<void>
}

export function DataTableToolbar<TData>({
                                            table,
                                            rawData,
                                            fetchData,
                                        }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0
    const [exportOption, setExportOption] = useState("")
    const [dropdownVisible, setDropdownVisible] = useState(false)

    const handleExport =  (rawData: string)  => {
        const selectedRows = table.getSelectedRowModel().rows
        const selectedRowIds = selectedRows.map(row => row.original)
        const parsedRawData = JSON.parse(rawData)

        const dataToExport = parsedRawData.filter((item: any) => selectedRowIds.includes(item.id))

        console.log('Data to export:', dataToExport)
        const dataString = JSON.stringify(dataToExport, null, 2)
        const dataCount = dataToExport.length
        if (dataCount === 0) {
            toast.error("No data to export.")
            return
        }
        const rowString = dataCount === 1 ? "row" : "rows"

        if (exportOption === "backup") {
            navigator.clipboard.writeText(dataString).then(() => {
                toast.success(`Data copied to clipboard, selected ${dataCount} ${rowString}.`)
            }).catch((err) => {
                toast.error(`Failed to copy data: ${err.message}`)
            })
        } else if (exportOption === "idpowertools") {
            const idPowerToolsData = dataToExport.map((item: { id: string, name: string }) => `ID: ${item.id}, Name: ${item.name}`).join('\n')
            navigator.clipboard.writeText(idPowerToolsData).then(() => {
                toast.success(`Data for IDPowerTools copied to clipboard, selected ${dataCount} ${rowString}.`)
            }).catch((err) => {
                toast.error(`Failed to copy data: ${err.message}`)
            })
        }
    }

    const handleRefresh = () => {
        toast.promise(fetchData(), {
            loading: `Searching for conditional access policies...`,
            success: `Conditional access policies fetched successfully`,
            error: (err) => `Failed to get conditional access policies because: ${err.message}`,
        })
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter tasks..."
                    value={(table.getColumn("displayName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("displayName")?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("state") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("state")}
                        title="State"
                        options={statuses}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    Refresh
                </Button>
                <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => setDropdownVisible(!dropdownVisible)}>
                        Export
                    </Button>
                    {dropdownVisible && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                            <button
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    setExportOption("backup")
                                    handleExport(rawData)
                                    setDropdownVisible(false)
                                }}
                            >
                                Export for Backup
                            </button>
                            <button
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    setExportOption("idpowertools")
                                    handleExport(rawData)
                                    setDropdownVisible(false)
                                }}
                            >
                                Export for IDPowerTools
                            </button>
                        </div>
                    )}
                </div>
                <DataTableViewOptions table={table} />
            </div>
        </div>
    )
}