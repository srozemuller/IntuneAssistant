export const configurationTypes = [
    // Android
    { value: "Android Managed App Protection", label: "Android Managed Application Protection" },
    { value: "Android Compliance Policy", label: "Android Compliance Policy" },
    { value: "Android Device Owner Compliance Policy", label: "Android Device Owner Compliance Policy" },
    { value: "Android EAS Email Profile Configuration", label: "Android EAS Email Profile Configuration" },
    { value: "Android Device Owner WiFi Configuration", label: "Android Device Owner WiFi Configuration" },
    { value: "Android Work Profile Compliance Policy", label: "Android Work Profile Compliance Policy" },
    { value: "Android Work Profile General Configuration", label: "Android Work Profile General Configuration" },
    { value: "Android Device Owner Trusted Root Certificate", label: "Android Device Owner Trusted Root Certificate" },
    { value: "Android Device Owner SCEP Certificate Profile", label: "Android Device Owner SCEP Certificate Profile" },
    { value: "Android Device Owner General Device Configuration", label: "Android Device Owner General Device Configuration" },
    { value: "Android Custom Configuration", label: "Android Custom Configuration" },
    { value: "Android Managed Store App", label: "Android Managed Store App" },

    // iOS
    { value: "iOS EAS Email Profile Configuration", label: "iOS EAS Email Profile Configuration" },
    { value: "iOS Managed Application Protection", label: "iOS Managed Application Protection" },
    { value: "iOS Compliance Policy", label: "iOS Compliance Policy" },
    { value: "iOS LineOfBusiness Application Configuration", label: "iOS LineOfBusiness Application Configuration" },
    { value: "iOS Update Configuration", label: "iOS Update Configuration" },
    { value: "iOS Custom Configuration", label: "iOS Custom Configuration" },
    { value: "iOS General Configuration", label: "iOS General Configuration" },
    { value: "iOS Device Feature Configuration", label: "iOS Device Feature Configuration" },
    { value: "iOS WiFi Configuration", label: "iOS WiFi Configuration" },
    { value: "iOS Managed Store App", label: "iOS Managed Store App" },
    { value: "iOS Device Features Configuration", label: "iOS Device Features Configuration" },
    { value: "iOS General Device Configuration", label: "iOS General Device Configuration" },

    // macOS
    { value: "macOs Shell Script", label: "macOS Shell Script" },
    { value: "macOs Compliance Policy", label: "macOS Compliance Policy" },
    { value: "macOs Device Features Configuration", label: "macOS Device Features Configuration" },
    { value: "macOs Endpoint Protection Configuration", label: "macOS Endpoint Protection Configuration" },
    { value: "macOs Custom Attributes", label: "macOS Custom Attributes" },
    { value: "macOs Software Update Configuration", label: "macOS Software Update Configuration" },
    { value: "macOs Extensions Configuration", label: "macOS Extensions Configuration" },
    { value: "macOs Custom Configuration", label: "macOS Custom Configuration" },


    // Windows
    { value: "Windows Compliance Policy", label: "Windows Compliance Policy" },
    { value: "Windows Feature Update", label: "Windows Feature Update" },
    { value: "Windows Driver Update", label: "Windows Driver Update" },
    { value: "Windows Quality Update", label: "Windows Quality Update" },
    { value: "Windows Autopilot Deployment Profile", label: "Windows Autopilot Deployment Profile" },
    { value: "Windows Managed App Protection", label: "Windows Managed Application Protection" },
    { value: "Windows Defender ATP Configuration", label: "Windows Defender ATP Configuration" },
    { value: "Windows 10 Custom Configuration", label: "Windows 10 Custom Configuration" },
    { value: "Windows Identity Protection Configuration", label: "Windows Identity Protection Configuration" },
    { value: "Windows Health Monitoring Configuration", label: "Windows Health Monitoring Configuration" },
    { value: "Windows Kiosk Configuration", label: "Windows Kiosk Configuration" },
    { value: "Windows Delivery Optimization Configuration", label: "Windows Delivery Optimization Configuration" },
    { value: "Windows 10 General Configuration", label: "Windows 10 General Configuration" },
    { value: "Windows 10 Wired Network Configuration", label: "Windows 10 Wired Network Configuration" },
    { value: "Windows 10 Team General Configuration", label: "Windows 10 Team General Configuration" },
    { value: "Windows 10 Wireless Network Configuration", label: "Windows 10 Wireless Network Configuration" },
    { value: "Windows 10 Endpoint Protection Configuration", label: "Windows 10 Endpoint Protection Configuration" },

    // General
    { value: "Configuration Policy", label: "Configuration Policy" },
    { value: "Device Health Script", label: "Device Health Script" },
    { value: "Device Management Script", label: "Device Management Script" },
    { value: "Device Shell Script", label: "Device Shell Script" },
    { value: "Administrative Templates", label: "Administrative Templates" },
    { value: "Update Ring Configuration", label: "Update Ring Configuration" },
    { value: "Disk Encryption Policy", label: "Disk Encryption Policy" },
    { value: "Platform Scripts", label: "Platform Scripts" },
    { value: "Managed Application Policy", label: "Managed Application Policy" },
    { value: "Device Platform Restriction", label: "Device Platform Restriction" },
    { value: "Device Limit Restriction", label: "Device Limit Restriction" },
    { value: "Device Enrollment Platform Restrictions Configuration", label: "Device Enrollment Platform Restrictions Configuration" },
    { value: "Device Enrollment Limit Configuration", label: "Device Enrollment Limit Configuration" },
    { value: "Shared PC Configuration", label: "Shared PC Configuration" },

    // Apps
    { value: "Windows 32 Lob App", label: "Windows 32 LOB Application" },
    { value: "Windows 32 Store App", label: "Windows 32 Store Application" },
    { value: "Winget App", label: "WinGet Application" },
    { value: "Mobile Application", label: "Mobile Application" },
    { value: "Application Configuration Policy", label: "Application Configuration Policy" },
    { value: "Managed Application Policy", label: "Managed Application Policy" },

    // Security
    { value: "Defender Update controls", label: "Defender Update controls" },




    { value: "DeviceEnrollmentPlatformRestrictionsConfiguration", label: "Device Enrollment Platform Restrictions Configuration" },
    { value: "Device Enrollment Limit Configuration", label: "Device Enrollment Limit Configuration" },



    { value: "SharedPcConfiguration", label: "Shared PC Configuration" },

    { value: "Endpoint detection and response", label: "Endpoint detection and response" },
    { value: "Windows Firewall", label: "Windows Firewall" },
    { value: "Windows Firewall Rules", label: "Windows Firewall Rules" },
    { value: "Windows Security Baseline", label: "Windows Security Baseline" },
    { value: "Microsoft Defender Antivirus", label: "Microsoft Defender Antivirus" },
    { value: "Microsoft Defender SmartScreen", label: "Microsoft Defender SmartScreen" },
    { value: "Attack Surface Reduction Rules", label: "Attack Surface Reduction Rules" },
    { value: "Elevation settings policy", label: "Elevation settings policy" },
    { value: "BitLocker", label: "BitLocker" },
    { value: "Attack Surface Reduction Rules (ConfigMgr)", label: "Attack Surface Reduction Rules (ConfigMgr)" },
    { value: "Security Baseline for Windows 10 and later", label: "Security Baseline for Windows 10 and later" },
    { value: "Security Baseline for Windows Server 2016 and later", label: "Security Baseline for Windows Server 2016 and later" },
    { value: "Security Baseline for Microsoft Edge", label: "Security Baseline for Microsoft Edge" },
    { value: "Local admin password solution (Windows LAPS)", label: "Local admin password solution (Windows LAPS)" },

    { value: "Elevation rules policy", label: "Elevation rules policy" },

    { value: "Disk Encryption Policy", label: "Disk Encryption Policy" },
    { value: "PlatformScripts", label: "Platform Scripts" },

    { value: "MacOsCustomAttributes", label: "MacOs Custom Attributes" },

];