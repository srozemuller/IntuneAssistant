namespace IntuneAssistant.Models;

public class AutopilotDeviceProfile
{
    public string Id { get; set; }
    public string DeploymentProfileAssignmentStatus { get; set; }
    public string DeploymentProfileAssignmentDetailedStatus { get; set; }
    public DateTime DeploymentProfileAssignedDateTime { get; set; }
    public string GroupTag { get; set; }
    public string PurchaseOrderIdentifier { get; set; }
    public string SerialNumber { get; set; }
    public string ProductKey { get; set; }
    public string Manufacturer { get; set; }
    public string Model { get; set; }
    public string EnrollmentState { get; set; }
    public DateTime LastContactedDateTime { get; set; }
    public string AddressableUserName { get; set; }
    public string UserPrincipalName { get; set; }
    public string ResourceName { get; set; }
    public string SkuNumber { get; set; }
    public string SystemFamily { get; set; }
    public string AzureActiveDirectoryDeviceId { get; set; }
    public string AzureAdDeviceId { get; set; }
    public string ManagedDeviceId { get; set; }
    public string DisplayName { get; set; }
    public string DeviceAccountUpn { get; set; }
    public object DeviceAccountPassword { get; set; }
    public object DeviceFriendlyName { get; set; }
    public string RemediationState { get; set; }
    public DateTime RemediationStateLastModifiedDateTime { get; set; }
    public string UserlessEnrollmentStatus { get; set; }
}