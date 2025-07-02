import {AppleIcon, BotIcon, Grid2X2Icon, DotIcon} from "lucide-react";

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
]

export const policySubType = [
    {
        value: 'SettingsCatalog',
        label: "Settings Catalog",
        color: "text-grey-500",
    },
    {
        value: 'AndroidDeviceOwnerGeneralDeviceConfiguration',
        label: "Android Device Owner General Device Configuration",
    },
    {
        value: 'AndroidWorkProfileGeneralDeviceConfiguration',
        label: "Android Work Profile General Device Configuration",
    },
    {
        value: 'AndroidGeneralDeviceConfiguration',
        label: "Android General Device Configuration",
    },
    {
        value: 'IosDeviceFeaturesConfiguration',
        label: "Ios Device Features Configuration",
    },
    {
        value: 'IosGeneralDeviceConfiguration',
        label: "iOS General Device Configuration",
    },
    {
        value: 'IosCustomConfiguration',
        label: "Ios Custom Configuration",
    },
    {
        value: 'IosUpdateConfiguration',
        label: "Ios Update Configuration",
    },
    {
        value: 'MacOSCustomConfiguration',
        label: "MacOS Custom Configuration",
    },
    {
        value: 'MacOSDeviceFeaturesConfiguration',
        label: "MacOS Device Features Configuration",
    },
    {
        value: 'MacOSEndpointProtectionConfiguration',
        label: "MacOS Endpoint Protection Configuration",
    },
    {
        value: 'MacOSExtensionsConfiguration',
        label: "MacOS Extensions Configuration",
    },
    {
        value: 'Windows10CustomConfiguration',
        label: "Windows 10 Custom Configuration",
    },
    {
        value: 'WindowsKioskConfiguration',
        label: "Windows Kiosk Configuration",
    },
    {
        value: 'Windows10EndpointProtectionConfiguration',
        label: "Windows 10 Endpoint Protection Configuration",
    },
    {
        value: 'DeviceRestrictions',
        label: "Device Restrictions",
    },
    {
        value: 'WindowsIdentityProtectionConfiguration',
        label: "Windows Identity Protection Configuration",
    },
    {
        value: 'WindowsUpdateForBusinessConfiguration',
        label: "Windows Update For Business Configuration",
    },
    {
        value: 'groupPolicyConfigurations',
        label: "Administrative Templates",
    }
]