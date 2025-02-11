import {
    ArrowLeftFromLineIcon, ArrowRightFromLineIcon,
    EqualIcon, EqualNotIcon
} from "lucide-react"

export const settingStatus = [
    {
        value: 'InBothDifferent',
        label: "InBothDifferent",
        icon: EqualNotIcon,
        color: "text-orange-500",
    },
    {
        value: 'InBothTheSame',
        label: "InBothTheSame",
        icon: EqualIcon,
        color: "text-blue-500",
    },
    {
        value: 'InSource',
        label: "InSource",
        icon: ArrowLeftFromLineIcon,
        color: "text-red-500",
    },
    {
        value: 'InChecked',
        label: "InChecked",
        icon: ArrowRightFromLineIcon,
        color: "text-green-500",
    },
]