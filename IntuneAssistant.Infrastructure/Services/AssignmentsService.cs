using System.Text.Json;
using IntuneAssistant.Constants;
using IntuneAssistant.Enums;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class AssignmentsService : IAssignmentsService
{
    private readonly HttpClient _http = new();
    public async Task<List<AssignmentsModel>?> GetConfigurationPolicyAssignmentsListAsync(string accessToken,
        Group? group)
    {
        var results = new List<AssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var response = await _http.GetAsync(GraphUrls.ConfigurationPoliciesUrl);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                foreach (var resource in result.Value)
                {
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var configurationPolicyAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.ConfigurationPolicy);
                            results.Add(configurationPolicyAssigment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var configurationPolicyAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.ConfigurationPolicy);
                            results.Add(configurationPolicyAssigment);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        return results;
    }

    public async Task<List<AssignmentsModel>?> GetDeviceManagementScriptsAssignmentsListAsync(string accessToken,
        Group? group)
    {
        var results = new List<AssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var response = await _http.GetAsync(GraphUrls.DeviceManagementScriptsUrl);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                foreach (var resource in result.Value)
                {
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var deviceManagementScriptAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.DeviceManagementScript);
                            results.Add(deviceManagementScriptAssigment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var deviceManagementScriptAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.DeviceManagementScript);
                            results.Add(deviceManagementScriptAssigment);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        return results;
    }

    public async Task<List<AssignmentsModel>?> GetHealthScriptsAssignmentsByGroupListAsync(string accessToken,
        Group? group)
    {
        var results = new List<AssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var response = await _http.GetAsync(GraphUrls.DeviceHealthScriptsUrl);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                foreach (var resource in result.Value)
                {
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var healthScriptAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.DeviceHealthScript);
                            results.Add(healthScriptAssigment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var healthScriptAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.DeviceHealthScript);
                            results.Add(healthScriptAssigment);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        return results;
    }

    public async Task<List<AssignmentsModel>?> GetAutoPilotAssignmentsByGroupListAsync(string accessToken, Group? group)
    {
        var results = new List<AssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var response = await _http.GetAsync(GraphUrls.WindowsAutopilotDeploymentProfilesUrl);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                foreach (var resource in result.Value)
                {
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var autoPilotAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.WindowsAutopilotDeploymentProfile);
                            results.Add(autoPilotAssigment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var autoPilotAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.WindowsAutopilotDeploymentProfile);
                            results.Add(autoPilotAssigment);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        return results;
    }

    public async Task<List<AssignmentsModel>?> GetMobileAppAssignmentsByGroupListAsync(string accessToken, Group? group)
    {
        var results = new List<AssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var response = await _http.GetAsync(GraphUrls.MobileAppsUrl);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                foreach (var resource in result.Value)
                {
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var mobileAppAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.MobileApp);
                            results.Add(mobileAppAssigment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var mobileAppAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.MobileApp);
                            results.Add(mobileAppAssigment);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        return results;
    }

    public async Task<List<AssignmentsModel>?> GetTargetedAppConfigurationsAssignmentsByGroupListAsync(
        string accessToken, Group? group)
    {
        var results = new List<AssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var response = await _http.GetAsync(GraphUrls.TargetedManagedAppConfigurationsUrl);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                foreach (var resource in result.Value)
                {
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var targetedAppAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.AppConfigurationPolicy);
                            results.Add(targetedAppAssigment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var targetedAppAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.AppConfigurationPolicy);
                            results.Add(targetedAppAssigment);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        return results;
    }

    public async Task<List<AssignmentsModel>?> GetAppProtectionAssignmentsByGroupListAsync(string accessToken,
        Group? group)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<AssignmentsModel>();
        try
        {
            try
            {
                var response = await _http.GetAsync(GraphUrls.WindowsManagedAppProtectionsUrl);
                var responseStream = await response.Content.ReadAsStreamAsync();
                var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
                if (result?.Value is not null)
                {
                    foreach (var resource in result.Value)
                    {
                        if (group is null)
                        {
                            foreach (var assignment in resource.Assignments)
                            {
                                var appProtectionAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.WindowsManagedAppProtection);
                                results.Add(appProtectionAssigment);
                            }
                        }
                        else
                            foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                            {
                                var appProtectionAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.WindowsManagedAppProtection);
                                results.Add(appProtectionAssigment);
                            }
                    }
                }
            }
            catch (ODataError ex)
            {
                Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
                return null;
            }

            // iOS app protection
            try
            {
                var response = await _http.GetAsync(GraphUrls.IosManagedAppProtectionsUrl);
                var responseStream = await response.Content.ReadAsStreamAsync();
                var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
                if (result?.Value is not null)
                {
                    foreach (var resource in result.Value)
                    {
                        if (group is null)
                        {
                            foreach (var assignment in resource.Assignments)
                            {
                                var iosAppAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.IosManagedAppProtection);
                                results.Add(iosAppAssigment);
                            }
                        }
                        else
                            foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                            {
                                var iosAppAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.IosManagedAppProtection);
                                results.Add(iosAppAssigment);
                            }
                    }
                }
            }
            catch (ODataError ex)
            {
                Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
                return null;
            }

            // Android app protection
            try
            {
                var response = await _http.GetAsync(GraphUrls.AndroidManagedAppProtectionsUrl);
                var responseStream = await response.Content.ReadAsStreamAsync();
                var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
                if (result?.Value is not null)
                {
                    foreach (var resource in result.Value)
                    {
                        if (group is null)
                        {
                            foreach (var assignment in resource.Assignments)
                            {
                                var androidAppAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.AndroidManagedAppProtection);
                                results.Add(androidAppAssigment);
                            }
                        }
                        else
                            foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                            {
                                var androidAppAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.AndroidManagedAppProtection);
                                results.Add(androidAppAssigment);
                            }
                    }
                }
            }
            catch (ODataError ex)
            {
                Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
                return null;
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching autopilot policies: " + ex.ToMessage());
            return null;
        }

        return results;
    }

    public async Task<List<AssignmentsModel>?> GetCompliancePoliciesAssignmentsListAsync(string accessToken,
        Group? group)
    {
        var results = new List<AssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var response = await _http.GetAsync(GraphUrls.CompliancePoliciesUrl);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                foreach (var resource in result.Value)
                {
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var compliancePolicyAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.CompliancePolicy);
                            results.Add(compliancePolicyAssigment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var compliancePolicyAssigment = assignment.ToAssignmentModel(resource, ResourceTypes.CompliancePolicy);
                            results.Add(compliancePolicyAssigment);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        return results;
    }

    public async Task<List<AssignmentsModel>?> GetUpdateRingsAssignmentsByGroupListAsync(string accessToken,
        Group? group)
    {
        var results = new List<AssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var response = await _http.GetAsync(GraphUrls.UpdateRingsUrl);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                foreach (var resource in result.Value)
                {
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var updateRingAssignmentInfo = assignment.ToAssignmentModel(resource, ResourceTypes.UpdateRingConfiguration);
                            results.Add(updateRingAssignmentInfo);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var updateRingAssignmentInfo = assignment.ToAssignmentModel(resource, ResourceTypes.UpdateRingConfiguration);
                            results.Add(updateRingAssignmentInfo);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        return results;
    }

    public async Task<List<AssignmentsModel>?> GetFeatureUpdatesAssignmentsByGroupListAsync(string accessToken, Group? group)
    {
        var results = new List<AssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var response = await _http.GetAsync(GraphUrls.WindowsFeatureUpdatesUrl);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                foreach (var resource in result.Value)
                {
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var featureUpdateAssignment = assignment.ToAssignmentModel(resource, ResourceTypes.WindowsFeatureUpdate);
                            results.Add(featureUpdateAssignment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var updateRingAssignmentInfo = assignment.ToAssignmentModel(resource, ResourceTypes.WindowsFeatureUpdate);
                            results.Add(updateRingAssignmentInfo);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        return results;
    }

    public async Task<List<AssignmentsModel>?> GetWindowsDriverUpdatesAssignmentsByGroupListAsync(string accessToken, Group? group)
    {
       var results = new List<AssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var response = await _http.GetAsync(GraphUrls.WindowsDriverUpdatesUrl);
            var responseStream = await response.Content.ReadAsStreamAsync();
            var result = await JsonSerializer.DeserializeAsync<GraphValueResponse<AssignmentsResponseModel>>(responseStream, CustomJsonOptions.Default());
            if (result?.Value is not null)
            {
                foreach (var resource in result.Value)
                {
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var driverUpdateAssignment = assignment.ToAssignmentModel(resource, ResourceTypes.WindowsDriverUpdate);
                            results.Add(driverUpdateAssignment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var updateRingAssignmentInfo = assignment.ToAssignmentModel(resource, ResourceTypes.WindowsDriverUpdate);
                            results.Add(updateRingAssignmentInfo);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
        return results;
    }
}
    