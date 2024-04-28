using IntuneAssistant.Enums;
namespace IntuneAssistant.Helpers;

public static class ResourceHelper
{
    public static string GetResourceTypeFromOdata (string odataString)
    {
        switch (odataString)
        {
            case "#microsoft.graph.windowsUpdateForBusinessConfiguration":
                return ResourceTypes.UpdateRingConfiguration.GetDescription();
            case "#microsoft.graph.iosCompliancePolicy":
                return ResourceTypes.IosCompliancePolicy.GetDescription();
            case "#microsoft.graph.windows10CompliancePolicy" :
                return ResourceTypes.WindowsCompliancePolicy.GetDescription();
            case "#microsoft.graph.macOSCompliancePolicy" :
                return ResourceTypes.MacOsCompliancePolicy.GetDescription();
            case "#microsoft.graph.azureADWindowsAutopilotDeploymentProfile" :
                return ResourceTypes.WindowsAutopilotDeploymentProfile.GetDescription();
            case "#microsoft.graph.win32LobApp" :
                return ResourceTypes.Win32LobApp.GetDescription();
            case "#microsoft.graph.windowsStoreApp" :
                return ResourceTypes.Win32StoreApp.GetDescription();
            case "#microsoft.graph.winGetApp" :
                return ResourceTypes.WingetApp.GetDescription();
            case "#microsoft.graph.androidDeviceOwnerGeneralDeviceConfiguration" :
                return ResourceTypes.AndroidDeviceOwnerGeneralDeviceConfiguration.GetDescription();
            case "#microsoft.graph.windows10CustomConfiguration" :
                return ResourceTypes.Windows10CustomConfiguration.GetDescription();
            case "#microsoft.graph.iosUpdateConfiguration" :    
                return ResourceTypes.IosUpdateConfiguration.GetDescription();
            case "#microsoft.graph.macOSSoftwareUpdateConfiguration" :    
                return ResourceTypes.MacOsSoftwareUpdateConfiguration.GetDescription();
            case "#microsoft.graph.windowsHealthMonitoringConfiguration" :    
                return ResourceTypes.WindowsHealthMonitoringConfiguration.GetDescription();
            case "#microsoft.graph.deviceEnrollmentPlatformRestrictionsConfiguration" :    
                return ResourceTypes.DeviceEnrollmentPlatformRestrictionsConfiguration.GetDescription();
            case "#microsoft.graph.deviceEnrollmentLimitConfiguration" :    
                return ResourceTypes.DeviceEnrollmentLimitConfiguration.GetDescription();
            case "#microsoft.graph.iosDeviceFeatureConfiguration":
                return ResourceTypes.IosDeviceFeatureConfiguration.GetDescription();
            case "#microsoft.graph.iosCustomConfiguration":
                return ResourceTypes.IosCustomConfiguration.GetDescription();
            case "#microsoft.graph.iosGeneralConfiguration":
                return ResourceTypes.IosCustomConfiguration.GetDescription();
            case "#microsoft.graph.iosGeneralDeviceConfiguration":
                return ResourceTypes.IosGeneralDeviceConfiguration.GetDescription();
            case "#microsoft.graph.iosDeviceFeaturesConfiguration":
                return ResourceTypes.IosDeviceFeaturesConfiguration.GetDescription();
            case "#microsoft.graph.windowsIdentityProtectionConfiguration":
                return ResourceTypes.WindowsIdentityProtectionConfiguration.GetDescription();
            case "#microsoft.graph.macOSExtensionsConfiguration":
                return ResourceTypes.MacOsExtensionsConfiguration.GetDescription();
            case "#microsoft.graph.sharedPCConfiguration":
                return ResourceTypes.SharedPcConfiguration.GetDescription();
            case "#microsoft.graph.windowsKioskConfiguration":
                return ResourceTypes.WindowsKioskConfiguration.GetDescription();
            case "#microsoft.graph.macOSCustomConfiguration":
                return ResourceTypes.MacOsCustomConfiguration.GetDescription();
            case "#microsoft.graph.androidWorkProfileGeneralDeviceConfiguration":
                return ResourceTypes.AndroidWorkProfileGeneralDeviceConfiguration.GetDescription();
            case "#microsoft.graph.windowsDefenderAdvancedThreatProtectionConfiguration":
                return ResourceTypes.WindowsDefenderAdvancedThreatProtectionConfiguration.GetDescription();
            case "#microsoft.graph.windows10GeneralConfiguration" :
                return "Windows 10 General Configuration";
            case "#microsoft.graph.windowsWifiConfiguration" :
                return "Windows Wifi Configuration";
            case "#microsoft.graph.windows10EndpointProtectionConfiguration" :
                return "Windows 10 Endpoint Protection Configuration";
            case "#microsoft.graph.windowsDeliveryOptimizationConfiguration" :
                return "Windows Delivery Optimization Configuration";
            case "#microsoft.graph.managedAndroidStoreApp" :
                return "Managed Android Store App";
            case "#microsoft.graph.managedIOSStoreApp" :
                return "Managed IOS Store App";
            case "#microsoft.graph.user" :    
                return ResourceTypes.User.GetDescription();
            case "#microsoft.graph.device" :    
                return ResourceTypes.Device.GetDescription();
            default:
                return odataString;
        }
    }
    
    public static string GetAssignmentTypeFromOdata (string odataString)
    {
        switch (odataString)
        {
            case "#microsoft.graph.allDevicesAssignmentTarget":
                return AssignmentODataTypes.AllDevicesAssignmentTarget.GetDescription();
            case "#microsoft.graph.groupAssignmentTarget":
                return AssignmentODataTypes.GroupAssignmentTarget.GetDescription();
            case "#microsoft.graph.allLicensedUsersAssignmentTarget" :
                return AssignmentODataTypes.AllLicensedUsersAssignmentTarget.GetDescription();
            case "#microsoft.graph.exclusionGroupAssignmentTarget":
                return AssignmentODataTypes.GroupExcludeAssignmentTarget.GetDescription();
            default:
                return odataString;
        }
    }
}
