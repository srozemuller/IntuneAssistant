import { CheckCircle, XCircle, TriangleAlert } from "lucide-react"

export const labels = [
    {
        value: "bug",
        label: "Bug",
    },
    {
        value: "feature",
        label: "Feature",
    },
    {
        value: "documentation",
        label: "Documentation",
    },
]

export const statuses = [
    {
        value: "enabled",
        label: "Enabled",
        icon: CheckCircle,
    },
    {
        value: "disabled",
        label: "Disabled",
        icon: XCircle,
    },
    {
        value: "enabledForReportingButNotEnforced",
        label: "Reporting Only",
        icon: TriangleAlert,
    }
]