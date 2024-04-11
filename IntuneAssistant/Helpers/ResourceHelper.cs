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
            case "#microsoft.graph.user" :    
                return ResourceTypes.User.GetDescription();
            case "#microsoft.graph.device" :    
                return ResourceTypes.Device.GetDescription();
            default:
                return odataString;
        }
    }
}
