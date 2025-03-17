import {
    CheckCircle,
    Circle,
    XCircle,
    UserCircle,
    Computer,
    Users,
    Grid2X2Icon,
    AppleIcon,
    BotIcon,
    HelpCircleIcon
} from "lucide-react"

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

export const accountIsEnabled = [
    {
        value: true,
        label: "Enabled",
        icon: CheckCircle,
        color: "text-green-500",
    },
    {
        value: false,
        label: "Disabled",
        icon: XCircle,
        color: "text-red-500",
    }
]

export const platform = [
    {
        value: 'Windows',
        label: "Windows",
        icon: Grid2X2Icon,
        color: "text-green-500",
    },
    {
        value: 'iOS',
        label: "iOS",
        icon: AppleIcon,
        color: "text-red-500",
    },
    {
        value: 'Android',
        label: "Android",
        icon: BotIcon,
        color: "text-red-500",
    },
    {
        value: 'macOS',
        label: "macOS",
        icon: AppleIcon,
        color: "text-red-500",
    },
    {
        value: 'General',
        label: "General",
        icon: Circle,
        color: "text-red-500",
    },
    {
        value: 'Unknown',
        label: "Unknown",
        icon: HelpCircleIcon,
        color: "text-red-500",
    },
]

export const memberType = [
    {
        value: "User",
        label: "User",
        icon: UserCircle,
        color: "text-grey-500",
    },
    {
        value: "Device",
        label: "Device",
        icon: Computer,
        color: "text-grey-500",
    },
    {
        value: "Group",
        label: "Group",
        icon: Users,
        color: "text-grey-500",
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