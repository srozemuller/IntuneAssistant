import {CheckCircle, XCircle, TriangleAlert, CircleSlash, CircleCheck, Circle} from "lucide-react"

export const migrationNeeded = [
    {
        value: true,
        label: "Migrated",
        icon: CheckCircle,
        color: "text-green-500",
    },
    {
        value: false,
        label: "Not Migrated",
        icon: XCircle,
        color: "text-red-500",
    }
]

export const readyForMigration = [
    {
        value: true,
        label: "Yes",
        icon: CheckCircle,
        color: "text-green-500",
    },
    {
        value: false,
        label: "No",
        icon: TriangleAlert,
        color: "text-orange-500",
    }
]

export const filterType = [
    {
        value: 'include',
        label: "Include",
        icon: CircleCheck,
        color: "text-green-500",
    },
    {
        value: 'exclude',
        label: "Exclude",
        icon: CircleSlash,
        color: "text-orange-500",
    },
    {
        value: 'none',
        label: "NoFilter",
        icon: Circle,
        color: "text-gray-500",
    },
]