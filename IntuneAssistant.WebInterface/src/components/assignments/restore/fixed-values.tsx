import {CheckCircle, XCircle, TriangleAlert, CircleSlash, CircleCheck, Circle} from "lucide-react"

export const filterType = [
    {
        value: 'Include',
        label: "Include",
        icon: CircleCheck,
        color: "text-green-500",
    },
    {
        value: 'Exclude',
        label: "Exclude",
        icon: CircleSlash,
        color: "text-orange-500",
    },
    {
        value: 'NoFilter',
        label: "NoFilter",
        icon: Circle,
        color: "text-gray-500",
    },
]