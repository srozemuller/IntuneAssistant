import {
    CheckCircle,
    XCircle,
    UserCircle,
    Computer,
    Users,
    Grid2X2Icon,
    AppleIcon,
    BotIcon,
    CircleAlertIcon, CirclePlusIcon, CircleXIcon, CircleMinusIcon, ComputerIcon,
    GroupIcon,
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

export const installType = [
    {
        value: 'Required',
        label: "Required",
        icon: CircleAlertIcon,
        color: "text-green-500",
    },
    {
        value: 'Available',
        label: "Available",
        icon: CirclePlusIcon,
        color: "text-orange-500",
    },
    {
        value: 'None',
        label: "None",
        icon: CircleMinusIcon,
        color: "text-grey-500",
    },
    {
        value: 'Uninstall',
        label: "Uninstall",
        icon: CircleXIcon,
        color: "text-red-500",
    }
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
        color: "text-grey-500",
    },
    {
        value: "All Users (Intune)",
        label: "All Users (Intune)",
        icon: UserCircle,
        color: "text-grey-500",
    },
    {
        value: "All Devices (Intune)",
        label: "All Devices (Intune)",
        icon: ComputerIcon,
        color: "text-grey-500",
    },
    {
        value: "Entra ID Group",
        label: "Entra ID Group",
        icon: GroupIcon,
        color: "text-grey-500",
    },
    {
        value: "Entra ID Group Exclude",
        label: "Entra ID Group Exclude",
        icon: XCircle,
        color: "text-grey-500",
    },
]