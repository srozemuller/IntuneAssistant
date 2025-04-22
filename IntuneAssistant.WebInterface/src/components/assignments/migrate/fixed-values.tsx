import {
    CheckCircle,
    XCircle,
    TriangleAlert,
    CircleSlash,
    CircleCheck,
    Circle,
    CirclePlus,
    CircleX,
    CircleArrowLeft
} from "lucide-react"

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
export const backupStatusValues = [
    {
        value: "backed-up",
        label: "Backed up",
        icon: CheckCircle,
        color: "text-green-500",
    },
    {
        value: "not-backed-up",
        label: "Not backed up",
        icon: CircleX,
        color: "text-red-500",
    },
    {
        value: "unknown",
        label: "Unknown",
        icon: TriangleAlert,
        color: "text-orange-500",
    }
];

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
export const assignmentAction = [
    {
        value: 'add',
        label: "Add",
        icon: CirclePlus,
        color: "text-green-500",
    },
    {
        value: 'remove',
        label: "Remove",
        icon: CircleX,
        color: "text-red-500",
    },
    {
        value: 'replace',
        label: "Replace",
        icon: CircleArrowLeft,
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