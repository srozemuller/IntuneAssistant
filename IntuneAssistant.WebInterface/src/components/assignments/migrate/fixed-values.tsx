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

export const assignmentTypes = [
    {
        value: "No assignment",
        label: "No assignment",
        icon: CheckCircle,
        color: "text-green-500",
    },
    {
        value: "All Users (Intune)",
        label: "All Users (Intune)",
        icon: XCircle,
        color: "text-red-500",
    },
    {
        value: "All Devices (Intune)",
        label: "All Devices (Intune)",
        icon: XCircle,
        color: "text-red-500",
    },
    {
        value: "Entra ID Group",
        label: "Entra ID Group",
        icon: XCircle,
        color: "text-red-500",
    },
    {
        value: "Entra ID Group Exclude",
        label: "Entra ID Group Exclude",
        icon: XCircle,
        color: "text-red-500",
    },
]