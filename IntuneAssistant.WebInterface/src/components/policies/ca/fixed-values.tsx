import { CheckCircle, XCircle, TriangleAlert } from "lucide-react"
export const statuses = [
    {
        value: "enabled",
        label: "Enabled",
        icon: CheckCircle,
        color: "text-green-500",
    },
    {
        value: "disabled",
        label: "Disabled",
        icon: XCircle,
        color: "text-red-500",
    },
    {
        value: "enabledForReportingButNotEnforced",
        label: "Reporting Only",
        icon: TriangleAlert,
        color: "text-orange-500",
    }
]