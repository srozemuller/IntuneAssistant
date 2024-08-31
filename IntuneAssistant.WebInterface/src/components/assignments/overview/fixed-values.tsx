import { CheckCircle, XCircle, TriangleAlert } from "lucide-react"

export const isAssignedValues = [
    {
        value: true,
        label: "Assigned",
        icon: CheckCircle,
        color: "text-green-500",
    },
    {
        value: false,
        label: "Not Assigned",
        icon: XCircle,
        color: "text-red-500",
    }
]