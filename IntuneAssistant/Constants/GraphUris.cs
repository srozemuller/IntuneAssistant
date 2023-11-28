namespace IntuneAssistant.Constants;

public static class GraphUris
{
    public const string ManagedDevices = $"{AppConfiguration.GRAPH_URL}/devicemanagement/managedDevices?$top=999&$select=id,deviceName,userDisplayName,isEncrypted,complianceState,operatingSystem,osVersion,manufacturer,model,lastSyncDateTime,serialNumber";
    public const string ConfigurationPolicies = $"{AppConfiguration.GRAPH_URL}/deviceManagement/configurationPolicies?select=id,name,description&$expand=settings,assignments";
}