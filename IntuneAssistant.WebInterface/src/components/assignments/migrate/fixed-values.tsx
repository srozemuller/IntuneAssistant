import { CheckCircle, XCircle, TriangleAlert } from "lucide-react"

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