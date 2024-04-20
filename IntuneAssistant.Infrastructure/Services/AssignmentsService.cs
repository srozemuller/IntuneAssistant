using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Enums;
using IntuneAssistant.Extensions;
using IntuneAssistant.Helpers;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using IntuneAssistant.Models.Apps;
using IntuneAssistant.Models.Assignments;
using IntuneAssistant.Models.AutoPilot;
using IntuneAssistant.Models.Devices;
using IntuneAssistant.Models.Scripts;
using IntuneAssistant.Models.Group;
using IntuneAssistant.Models.Intents;
using IntuneAssistant.Models.Updates;
using Microsoft.Graph.Beta.Models.ODataErrors;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class AssignmentsService : IAssignmentsService
{
    private readonly HttpClient _http = new();

    public async Task<List<CustomAssignmentsModel>?> GetConfigurationPolicyAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<ConfigurationPolicyModel> configurationPolicies)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var policy in configurationPolicies)
            {
                var policyUrl =
                    $"/deviceManagement/configurationPolicies('{policy.Id}')/assignments";
                urlList.Add(policyUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseForAssignments<Assignment>>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithValue =
                    result?.Responses.Where(r => r.Body.Value != null && r.Body.Value.Any()).ToList();
                var responsesWithNoValue = result?.Responses.Where(r => r.Body.Value.IsNullOrEmpty()).ToList();
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        var policyId = nonAssigned.Body.ODataContext.FetchIdFromContext();
                        var sourcePolicy = configurationPolicies.FirstOrDefault(p =>
                            p.Id == policyId);
                        var resourceType = ResourceTypes.ConfigurationPolicy.GetDescription();
                        if (sourcePolicy?.TemplateReference.TemplateDisplayName is not null)
                        {
                            resourceType = sourcePolicy.TemplateReference.TemplateDisplayName;
                        }

                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = sourcePolicy?.Id,
                            DisplayName = sourcePolicy?.Name,
                            Assignments = new List<Assignment>()
                        };
                        var configurationPolicyAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource, resourceType);
                        results.Add(configurationPolicyAssignment);
                    }

                if (responsesWithValue != null)
                    foreach (var assignmentResponse in responsesWithValue.Select(r => r.Body.Value))
                    {
                        var sourcePolicy = configurationPolicies.FirstOrDefault(p =>
                            assignmentResponse != null &&
                            p.Id == assignmentResponse.Select(a => a.SourceId).FirstOrDefault());
                        var resourceType = ResourceTypes.ConfigurationPolicy.GetDescription();
                        if (sourcePolicy?.TemplateReference.TemplateDisplayName is not null)
                        {
                            resourceType = sourcePolicy.TemplateReference.TemplateDisplayName;
                        }

                        if (assignmentResponse != null)
                        {
                            AssignmentsResponseModel resource = new AssignmentsResponseModel
                            {
                                Id = sourcePolicy?.Id,
                                DisplayName = sourcePolicy?.Name,
                                Assignments = assignmentResponse.Select(a => a).ToList()
                            };
                            if (group is null)
                            {
                                foreach (var assignment in resource.Assignments)
                                {
                                    var configurationPolicyAssignment =
                                        assignment.ToAssignmentModel(resource, resourceType);
                                    results.Add(configurationPolicyAssignment);
                                }
                            }
                            else
                                foreach (var assignment in
                                         resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                                {
                                    var configurationPolicyAssignment =
                                        assignment.ToAssignmentModel(resource, resourceType);
                                    results.Add(configurationPolicyAssignment);
                                }
                        }
                    }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetDeviceManagementScriptsAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<DeviceManagementScriptsModel> deviceScripts)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var script in deviceScripts)
            {
                var scriptUrl =
                    $"/deviceManagement/deviceManagementScripts('{script.Id}')?$expand=assignments";
                urlList.Add(scriptUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithValue = result?.Responses
                    .Where(r => r.Body.Assignments.Count > 0).Select(b => b.Body)
                    .ToList();
                var responsesWithNoValue =
                    result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty()).Select(b => b.Body);
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned.Id,
                            DisplayName = nonAssigned.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var resourceAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource, ResourceTypes.DeviceManagementScript.GetDescription());
                        results.Add(resourceAssignment);
                    }

                if (responsesWithValue != null)
                    foreach (var assignmentResponse in responsesWithValue.Select(r => r))
                    {
                        var sourcePolicy = deviceScripts.FirstOrDefault(p =>
                            p.Id == assignmentResponse.Id);
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = sourcePolicy?.Id,
                            DisplayName = sourcePolicy?.DisplayName,
                            Assignments = assignmentResponse.Assignments.ToList()
                        };
                        if (group is null)
                        {
                            foreach (var assignment in resource.Assignments)
                            {
                                var configurationPolicyAssignment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.DeviceManagementScript.GetDescription());
                                results.Add(configurationPolicyAssignment);
                            }
                        }
                        else
                            foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                            {
                                var configurationPolicyAssignment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.DeviceManagementScript.GetDescription());
                                results.Add(configurationPolicyAssignment);
                            }
                    }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetDeviceShellScriptsAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<DeviceShellScriptModel> deviceShellScripts)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var script in deviceShellScripts)
            {
                var scriptUrl =
                    $"/deviceManagement/deviceShellScripts('{script.Id}')?$expand=assignments";
                urlList.Add(scriptUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithValue = result?.Responses
                    .Where(r => r.Body.Assignments.Any()).ToList();
                var responsesWithNoValue = result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty()).ToList();
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        var policyId = nonAssigned.Body.ODataContext.FetchIdFromContext();
                        var sourceScript = deviceShellScripts.FirstOrDefault(p =>
                            p.Id == policyId);
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = sourceScript?.Id,
                            DisplayName = sourceScript?.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var shellScriptAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource, ResourceTypes.MacOsShellScript.GetDescription());
                        results.Add(shellScriptAssignment);
                    }

                if (responsesWithValue != null)
                    foreach (var assignmentResponse in responsesWithValue.Select(r => r.Body))
                    {
                        var sourcePolicy = deviceShellScripts.FirstOrDefault(p =>
                            p.Id == assignmentResponse.Id);
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = sourcePolicy?.Id,
                            DisplayName = sourcePolicy?.DisplayName,
                            Assignments = assignmentResponse.Assignments.ToList()
                        };
                        if (group is null)
                        {
                            foreach (var assignment in resource.Assignments)
                            {
                                var configurationPolicyAssignment =
                                    assignment.ToAssignmentModel(resource, ResourceTypes.MacOsShellScript.GetDescription());
                                results.Add(configurationPolicyAssignment);
                            }
                        }
                        else
                            foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                            {
                                var configurationPolicyAssignment =
                                    assignment.ToAssignmentModel(resource, ResourceTypes.MacOsShellScript.GetDescription());
                                results.Add(configurationPolicyAssignment);
                            }
                    }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetDeviceConfigurationsAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<DeviceConfigurationModel> configurations)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var policy in configurations)
            {
                var policyUrl =
                    $"/deviceManagement/deviceConfigurations('{policy.Id}')/assignments";
                urlList.Add(policyUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseForAssignments<Assignment>>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithNoValue = result.Responses.Where(r => r.Body.Value.IsNullOrEmpty()).ToList();
                foreach (var nonAssigned in responsesWithNoValue)
                {
                    var policyId = nonAssigned.Body.ODataContext.FetchIdFromContext();
                    var sourcePolicy = configurations.FirstOrDefault(p =>
                        p.Id == policyId);
                    var resourceType = ResourceHelper.GetResourceTypeFromOdata(sourcePolicy.OdataType);
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        OdataType = sourcePolicy.OdataType,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = new List<Assignment>()
                    };
                    var configurationsAssignment =
                        resource.Assignments.FirstOrDefault().ToAssignmentModel(resource, resourceType);
                    results.Add(configurationsAssignment);
                }

                var responsesWithValue = result.Responses.Where(r => r.Body.Value.Any()).ToList();
                foreach (var assignmentResponse in responsesWithValue.Select(r => r.Body.Value))
                {
                    var sourcePolicy = configurations.FirstOrDefault(p =>
                        assignmentResponse != null &&
                        p.Id == assignmentResponse.Select(a => a.SourceId).FirstOrDefault());
                    var resourceType = ResourceHelper.GetResourceTypeFromOdata(sourcePolicy.OdataType);
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = assignmentResponse.Select(a => a).ToList()
                    };
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var DeviceConfigurationAssignment =
                                assignment.ToAssignmentModel(resource, resourceType);
                            results.Add(DeviceConfigurationAssignment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var DeviceConfigurationAssignment =
                                assignment.ToAssignmentModel(resource, resourceType);
                            results.Add(DeviceConfigurationAssignment);
                        }
                }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetGroupPolicyConfigurationsAssignmentsListAsync(
        string? accessToken, GroupModel? group, List<GroupPolicyConfigurationModel> groupPolicies)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var policy in groupPolicies)
            {
                var policyUrl =
                    $"/deviceManagement/groupPolicyConfigurations('{policy.Id}')/assignments";
                urlList.Add(policyUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseForAssignments<Assignment>>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithNoValue = result.Responses.Where(r => r.Body.Value.IsNullOrEmpty()).ToList();
                foreach (var nonAssigned in responsesWithNoValue)
                {
                    var policyId = nonAssigned.Body.ODataContext.FetchIdFromContext();
                    var sourcePolicy = groupPolicies.FirstOrDefault(p =>
                        nonAssigned != null &&
                        p.Id == policyId);
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = new List<Assignment>()
                    };
                    var assignmentResponse =
                        resource.Assignments.FirstOrDefault().ToAssignmentModel(resource,
                            ResourceTypes.GroupPolicyConfiguration.ToString());
                    results.Add(assignmentResponse);
                }

                var responsesWithValue = result.Responses.Where(r => r.Body.Value.Any()).ToList();
                foreach (var assignmentResponse in responsesWithValue.Select(r => r.Body.Value))
                {
                    var sourcePolicy = groupPolicies.FirstOrDefault(p =>
                        assignmentResponse != null &&
                        p.Id == assignmentResponse.Select(a => a.SourceId).FirstOrDefault());
                    if (sourcePolicy is null)
                    {
                        var sourceId = assignmentResponse.Select(a => a.Id.Split('_')[0]);
                        sourcePolicy = groupPolicies.FirstOrDefault(p =>
                            assignmentResponse != null &&
                            p.Id == sourceId.FirstOrDefault());
                    }

                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = assignmentResponse.Select(a => a).ToList()
                    };
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var configurationPolicyAssignment =
                                assignment.ToAssignmentModel(resource,
                                    ResourceTypes.GroupPolicyConfiguration.ToString());
                            results.Add(configurationPolicyAssignment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var configurationPolicyAssignment =
                                assignment.ToAssignmentModel(resource,
                                    ResourceTypes.GroupPolicyConfiguration.ToString());
                            results.Add(configurationPolicyAssignment);
                        }
                }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetHealthScriptsAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<DeviceHealthScriptsModel> healthScripts)
    {
        var results = new List<CustomAssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var urlList = new List<string>();
            foreach (var script in healthScripts)
            {
                var scriptUrl =
                    $"/deviceManagement/deviceHealthScripts('{script.Id}')?$expand=assignments";
                urlList.Add(scriptUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithValue = result?.Responses
                    .Where(r => r.Body.Assignments != null && r.Body.Assignments.Count > 0).Select(b => b.Body)
                    .ToList();
                var responsesWithNoValue =
                    result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty()).Select(b => b.Body);
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        var policyId = nonAssigned.Id;
                        var sourcePolicy = healthScripts.FirstOrDefault(p =>
                            p.Id == policyId);
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = sourcePolicy?.Id,
                            DisplayName = sourcePolicy?.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var configurationPolicyAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource, ResourceTypes.DeviceHealthScript.ToString());
                        results.Add(configurationPolicyAssignment);
                    }

                foreach (var assignmentResponse in responsesWithValue.Select(r => r))
                {
                    var sourcePolicy = healthScripts.FirstOrDefault(p =>
                        p.Id == assignmentResponse.Id);
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = assignmentResponse.Assignments.ToList()
                    };
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var healthScriptAssigment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.DeviceHealthScript.ToString());
                            results.Add(healthScriptAssigment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var healthScriptAssigment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.DeviceHealthScript.ToString());
                            results.Add(healthScriptAssigment);
                        }
                }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }
    }

    public async Task<List<CustomAssignmentsModel>?> GetAutoPilotAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<WindowsAutopilotDeploymentProfileModel>? profiles)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            if (profiles != null)
                foreach (var profile in profiles)
                {
                    var profileUrl =
                        $"/deviceManagement/windowsAutopilotDeploymentProfiles('{profile.Id}')?$expand=assignments";
                    urlList.Add(profileUrl);
                }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithNoValue = result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty())
                    .Select(v => v.Body).ToList();
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned.Id,
                            DisplayName = nonAssigned.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var assignmentResponse =
                            resource.Assignments.FirstOrDefault().ToAssignmentModel(resource,
                                ResourceTypes.WindowsAutopilotDeploymentProfile.ToString());
                        results.Add(assignmentResponse);
                    }

                var responsesWithValue = result?.Responses.Where(r => r.Body.Assignments.Any()).ToList();
                if (responsesWithValue != null)
                    foreach (var assignmentResponse in responsesWithValue.Select(r => r.Body))
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = assignmentResponse.Id,
                            OdataType = assignmentResponse.ODataContext,
                            DisplayName = assignmentResponse.DisplayName,
                            Assignments = assignmentResponse.Assignments.ToList()
                        };
                        if (group is null)
                        {
                            foreach (var assignment in resource.Assignments)
                            {
                                var configurationPolicyAssignment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.WindowsAutopilotDeploymentProfile.ToString());
                                results.Add(configurationPolicyAssignment);
                            }
                        }
                        else
                            foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                            {
                                var configurationPolicyAssignment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.WindowsAutopilotDeploymentProfile.ToString());
                                results.Add(configurationPolicyAssignment);
                            }
                    }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetMobileAppAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<DefaultMobileAppModel> mobileApps)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();

            foreach (var app in mobileApps)
            {
                var profileUrl =
                    $"/deviceAppManagement/mobileApps('{app.Id}')?$expand=assignments";
                urlList.Add(profileUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithNoValue = result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty())
                    .Select(v => v.Body).ToList();
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned.Id,
                            OdataType = nonAssigned.ODataType,
                            DisplayName = nonAssigned.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var assignmentResponse =
                            resource.Assignments.FirstOrDefault().ToAssignmentModel(resource,
                                ResourceTypes.MobileApp.ToString());
                        results.Add(assignmentResponse);
                    }

                var responsesWithValue = result?.Responses.Where(r => r.Body.Assignments.Any()).ToList();
                if (responsesWithValue != null)
                    foreach (var assignmentResponse in responsesWithValue.Select(r => r.Body))
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = assignmentResponse.Id,
                            OdataType = assignmentResponse.ODataType,
                            DisplayName = assignmentResponse.DisplayName,
                            Assignments = assignmentResponse.Assignments.ToList()
                        };
                        if (group is null)
                        {
                            foreach (var assignment in resource.Assignments)
                            {
                                var configurationPolicyAssignment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.MobileApp.ToString());
                                results.Add(configurationPolicyAssignment);
                            }
                        }
                        else
                            foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                            {
                                var configurationPolicyAssignment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.MobileApp.ToString());
                                results.Add(configurationPolicyAssignment);
                            }
                    }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetManagedApplicationAssignmentListAsync(string? accessToken,
        GroupModel? group)
    {
        var results = new List<CustomAssignmentsModel>();
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        try
        {
            var response = await _http.GetAsync(GraphUrls.ManagedAppPoliciesUrl);
            var responseStream = await response.Content.ReadAsStreamAsync();
            using var sr = new StreamReader(responseStream);
            var contentString = await sr.ReadToEndAsync();
            var result = 
                JsonConvert.DeserializeObject<GraphValueResponse<AssignmentsResponseModel>>(
                    contentString,
                    JsonSettings.Default())!;
            if (result?.Value is not null)
            {
                foreach (var resource in result.Value)
                {
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var managedAppResult =
                                assignment.ToAssignmentModel(resource, ResourceTypes.ManagedAppPolicy.ToString());
                            results.Add(managedAppResult);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var managedAppResult =
                                assignment.ToAssignmentModel(resource, ResourceTypes.ManagedAppPolicy.ToString());
                            results.Add(managedAppResult);
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

    public async Task<List<CustomAssignmentsModel>?> GetTargetedAppConfigurationsAssignmentsListAsync(
        string? accessToken, GroupModel? group, List<ManagedAppConfigurationModel> appConfigurations)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();

            foreach (var appConfig in appConfigurations)
            {
                var profileUrl =
                    $"/deviceAppManagement/targetedManagedAppConfigurations('{appConfig.Id}')?$expand=assignments";
                urlList.Add(profileUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithNoValue = result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty())
                    .Select(v => v.Body).ToList();
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned.Id,
                            DisplayName = nonAssigned.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var assignmentResponse =
                            resource.Assignments.FirstOrDefault().ToAssignmentModel(resource,
                                ResourceTypes.AppConfigurationPolicy.ToString());
                        results.Add(assignmentResponse);
                    }

                var responsesWithValue = result?.Responses.Where(r => r.Body.Assignments.Any()).ToList();
                if (responsesWithValue != null)
                    foreach (var assignmentResponse in responsesWithValue.Select(r => r.Body))
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = assignmentResponse.Id,
                            OdataType = assignmentResponse.ODataContext,
                            DisplayName = assignmentResponse.DisplayName,
                            Assignments = assignmentResponse.Assignments.ToList()
                        };
                        if (group is null)
                        {
                            foreach (var assignment in resource.Assignments)
                            {
                                var configurationPolicyAssignment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.AppConfigurationPolicy.ToString());
                                results.Add(configurationPolicyAssignment);
                            }
                        }
                        else
                            foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                            {
                                var configurationPolicyAssignment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.AppConfigurationPolicy.ToString());
                                results.Add(configurationPolicyAssignment);
                            }
                    }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetWindowsAppProtectionAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<WindowsManagedAppProtectionsModel>? windowsManagedAppProtections)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var app in windowsManagedAppProtections)
            {
                var appUrl =
                    $"/deviceAppManagement/windowsManagedAppProtections('{app.Id}')?$expand=assignments";
                urlList.Add(appUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithNoValue = result.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty())
                    .Select(v => v.Body).ToList();
                foreach (var nonAssigned in responsesWithNoValue)
                {
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = nonAssigned?.Id,
                        DisplayName = nonAssigned?.DisplayName,
                        Assignments = new List<Assignment>()
                    };
                    var configurationsAssignment =
                        resource.Assignments.FirstOrDefault()
                            .ToAssignmentModel(resource, ResourceTypes.WindowsManagedAppProtection.ToString());
                    results.Add(configurationsAssignment);
                }

                var responsesWithValue =
                    result.Responses.Where(r => r.Body.Assignments.Any()).Select(v => v.Body).ToList();
                foreach (var assignmentResponse in responsesWithValue.Select(r => r))
                {
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = assignmentResponse.Id,
                        DisplayName = assignmentResponse?.DisplayName,
                        Assignments = assignmentResponse.Assignments.ToList()
                    };
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var targetedAppAssigment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.AppConfigurationPolicy.ToString());
                            results.Add(targetedAppAssigment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var targetedAppAssigment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.AppConfigurationPolicy.ToString());
                            results.Add(targetedAppAssigment);
                        }
                }
            }

            return results;
        }
        catch
        {
            return null;
        }
    }

    public async Task<List<CustomAssignmentsModel>?> GetIosAppProtectionAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<IosAppProtectionModel>? iosAppProtections)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var app in iosAppProtections)
            {
                var appUrl =
                    $"/deviceAppManagement/iosManagedAppProtections('{app.Id}')?$expand=assignments";
                urlList.Add(appUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithNoValue = result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty())
                    .Select(v => v.Body).ToList();
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned.Id,
                            DisplayName = nonAssigned.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var configurationsAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource, ResourceTypes.IosManagedAppProtection.ToString());
                        results.Add(configurationsAssignment);
                    }

                var responsesWithValue =
                    result?.Responses.Where(r => r.Body.Assignments.Any()).Select(v => v.Body).ToList();
                if (responsesWithValue != null)
                    foreach (var assignmentResponse in responsesWithValue.Select(r => r))
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = assignmentResponse.Id,
                            DisplayName = assignmentResponse.DisplayName,
                            Assignments = assignmentResponse.Assignments.ToList()
                        };
                        if (group is null)
                        {
                            foreach (var assignment in resource.Assignments)
                            {
                                var iosAppAssigment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.IosManagedAppProtection.ToString());
                                results.Add(iosAppAssigment);
                            }
                        }
                        else
                            foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                            {
                                var iosAppAssigment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.IosManagedAppProtection.ToString());
                                results.Add(iosAppAssigment);
                            }
                    }
            }

            return results;
        }
        catch
        {
            return null;
        }
    }

    public async Task<List<CustomAssignmentsModel>?> GetAndroidAppProtectionAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<AndroidAppProtectionModel>? androidAppProtections)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            if (androidAppProtections != null)
                foreach (var app in androidAppProtections)
                {
                    var appUrl =
                        $"/deviceAppManagement/androidManagedAppProtections('{app.Id}')?$expand=assignments";
                    urlList.Add(appUrl);
                }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithNoValue = result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty())
                    .Select(v => v.Body).ToList();
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned.Id,
                            DisplayName = nonAssigned.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var configurationsAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource, ResourceTypes.AndroidManagedAppProtection.ToString());
                        results.Add(configurationsAssignment);
                    }

                var responsesWithValue =
                    result?.Responses.Where(r => r.Body.Assignments.Any()).Select(v => v.Body).ToList();
                if (responsesWithValue != null)
                    foreach (var assignmentResponse in responsesWithValue.Select(r => r))
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = assignmentResponse.Id,
                            DisplayName = assignmentResponse.DisplayName,
                            Assignments = assignmentResponse.Assignments.ToList()
                        };
                        if (group is null)
                        {
                            foreach (var assignment in resource.Assignments)
                            {
                                var resourceAssignment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.AndroidManagedAppProtection.ToString());
                                results.Add(resourceAssignment);
                            }
                        }
                        else
                            foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                            {
                                var resourceAssignment =
                                    assignment.ToAssignmentModel(resource,
                                        ResourceTypes.AndroidManagedAppProtection.ToString());
                                results.Add(resourceAssignment);
                            }
                    }
            }

            return results;
        }
        catch
        {
            return null;
        }
    }

    public async Task<List<CustomAssignmentsModel>> GetCompliancePoliciesAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<CompliancePolicyModel> compliancePolicies)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var policy in compliancePolicies)
            {
                var policyUrl =
                    $"/deviceManagement/deviceCompliancePolicies('{policy.Id}')/assignments";
                urlList.Add(policyUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseForAssignments<Assignment>>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithNoValue = result.Responses.Where(r => r.Body.Value.IsNullOrEmpty()).ToList();
                foreach (var nonAssigned in responsesWithNoValue)
                {
                    var policyId = nonAssigned.Body.ODataContext.FetchIdFromContext();
                    var sourcePolicy = compliancePolicies.FirstOrDefault(p =>
                        p.Id == policyId);
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = new List<Assignment>()
                    };
                    var assignmentResponse =
                        resource.Assignments.FirstOrDefault().ToAssignmentModel(resource,
                            ResourceTypes.WindowsCompliancePolicy.GetDescription());
                    results.Add(assignmentResponse);
                }

                var responsesWithValue = result.Responses.Where(r => r.Body.Value.Any()).ToList();
                foreach (var assignmentResponse in responsesWithValue.Select(r => r.Body.Value))
                {
                    var sourcePolicy = compliancePolicies.FirstOrDefault(p =>
                        assignmentResponse != null &&
                        p.Id == assignmentResponse.Select(a => a.SourceId).FirstOrDefault());
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        OdataType = sourcePolicy.OdataType,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = assignmentResponse.Select(a => a).ToList()
                    };
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var configurationPolicyAssignment =
                                assignment.ToAssignmentModel(resource,
                                    ResourceTypes.WindowsCompliancePolicy.GetDescription());
                            results.Add(configurationPolicyAssignment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var configurationPolicyAssignment =
                                assignment.ToAssignmentModel(resource,
                                    ResourceTypes.WindowsCompliancePolicy.GetDescription());
                            results.Add(configurationPolicyAssignment);
                        }
                }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetWindowsFeatureUpdatesAssignmentsListAsync(string? accessToken,
        GroupModel? group, List<WindowsFeatureUpdatesModel> windowsFeatureUpdatesProfiles)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var profile in windowsFeatureUpdatesProfiles)
            {
                var policyUrl =
                    $"/deviceManagement/windowsFeatureUpdateProfiles('{profile.Id}')?$expand=assignments";
                urlList.Add(policyUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithValue = result?.Responses
                    .Where(r => r.Body.Assignments.Count > 0).Select(b => b.Body)
                    .ToList();
                var responsesWithNoValue =
                    result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty()).Select(b => b.Body);
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned?.Id,
                            DisplayName = nonAssigned?.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var configurationPolicyAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource, ResourceTypes.WindowsFeatureUpdate.ToString());
                        results.Add(configurationPolicyAssignment);
                    }

                foreach (var assignmentResponse in responsesWithValue.Select(r => r))
                {
                    var sourcePolicy = windowsFeatureUpdatesProfiles.FirstOrDefault(p =>
                        p.Id == assignmentResponse.Id);
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = assignmentResponse.Assignments.ToList()
                    };
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var featureUpdateAssignment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.WindowsFeatureUpdate.ToString());
                            results.Add(featureUpdateAssignment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var updateRingAssignmentInfo =
                                assignment.ToAssignmentModel(resource, ResourceTypes.WindowsFeatureUpdate.ToString());
                            results.Add(updateRingAssignmentInfo);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return results;
    }

    public async Task<List<CustomAssignmentsModel>?> GetWindowsDriverUpdatesAssignmentsListAsync(
        string? accessToken, GroupModel? group, List<WindowsDriverUpdatesModel> windowsDriverUpdatesProfiles)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var profile in windowsDriverUpdatesProfiles)
            {
                var policyUrl =
                    $"/deviceManagement/windowsDriverUpdateProfiles('{profile.Id}')?$expand=assignments";
                urlList.Add(policyUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithValue = result?.Responses
                    .Where(r => r.Body.Assignments != null && r.Body.Assignments.Count > 0).Select(b => b.Body)
                    .ToList();
                var responsesWithNoValue =
                    result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty()).Select(b => b.Body);
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned?.Id,
                            DisplayName = nonAssigned?.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var configurationPolicyAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource, ResourceTypes.WindowsDriverUpdate.ToString());
                        results.Add(configurationPolicyAssignment);
                    }

                foreach (var assignmentResponse in responsesWithValue.Select(r => r))
                {
                    var sourcePolicy = windowsDriverUpdatesProfiles.FirstOrDefault(p =>
                        p.Id == assignmentResponse.Id);
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = assignmentResponse.Assignments.ToList()
                    };
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var driverUpdateAssignment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.WindowsDriverUpdate.ToString());
                            results.Add(driverUpdateAssignment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var updateRingAssignmentInfo =
                                assignment.ToAssignmentModel(resource, ResourceTypes.WindowsDriverUpdate.ToString());
                            results.Add(updateRingAssignmentInfo);
                        }
                }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetIntentsAssignmentListAsync(string? accessToken,
        GroupModel? group, List<IntentsModel> intents)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var policy in intents)
            {
                var policyUrl =
                    $"/deviceManagement/intents('{policy.Id}')?$expand=assignments";
                urlList.Add(policyUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithValue = result?.Responses
                    .Where(r => r.Body.Assignments != null && r.Body.Assignments.Count > 0).Select(b => b.Body)
                    .ToList();
                var responsesWithNoValue =
                    result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty()).Select(b => b.Body);
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned?.Id,
                            DisplayName = nonAssigned?.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var configurationPolicyAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource, ResourceTypes.DiskEncryptionPolicy.ToString());
                        results.Add(configurationPolicyAssignment);
                    }

                foreach (var assignmentResponse in responsesWithValue.Select(r => r))
                {
                    var sourcePolicy = intents.FirstOrDefault(p =>
                        p.Id == assignmentResponse.Id);
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = assignmentResponse.Assignments.ToList()
                    };
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var macosShellScriptAssignment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.MacOsShellScript.ToString());
                            results.Add(macosShellScriptAssignment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var macosShellScriptAssignment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.MacOsShellScript.ToString());
                            results.Add(macosShellScriptAssignment);
                        }
                }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetDeviceEnrollmentAssignmentListAsync(
        string? accessToken, GroupModel? group, List<ResourceAssignmentsModel> resources)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var resource in resources)
            {
                var policyUrl =
                    $"/deviceManagement/deviceEnrollmentConfigurations('{resource.Id}')?$expand=assignments";
                urlList.Add(policyUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithValue = result?.Responses
                    .Where(r => r.Body.Assignments != null && r.Body.Assignments.Count > 0).Select(b => b.Body)
                    .ToList();
                var responsesWithNoValue =
                    result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty()).Select(b => b.Body);
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned?.Id,
                            DisplayName = nonAssigned?.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var configurationPolicyAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource,
                                    ResourceTypes.DeviceEnrollmentLimitConfiguration.ToString());
                        results.Add(configurationPolicyAssignment);
                    }

                foreach (var assignmentResponse in responsesWithValue.Select(r => r))
                {
                    var sourcePolicy = resources.FirstOrDefault(p =>
                        p.Id == assignmentResponse.Id);
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = assignmentResponse.Assignments.ToList()
                    };
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var platformScriptAssignment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.PlatformScripts.ToString());
                            results.Add(platformScriptAssignment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var platformScriptAssignment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.PlatformScripts.ToString());
                            results.Add(platformScriptAssignment);
                        }
                }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetMacOsCustomAttributesAssignmentListAsync(string? accessToken,
        GroupModel? group, List<ResourceAssignmentsModel> resources)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var resource in resources)
            {
                var policyUrl =
                    $"/deviceManagement/deviceCustomAttributeShellScripts('{resource.Id}')?$expand=assignments";
                urlList.Add(policyUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithValue = result?.Responses
                    .Where(r => r.Body.Assignments != null && r.Body.Assignments.Count > 0).Select(b => b.Body)
                    .ToList();
                var responsesWithNoValue =
                    result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty()).Select(b => b.Body);
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned?.Id,
                            DisplayName = nonAssigned?.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var configurationPolicyAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource, ResourceTypes.MacOsCustomAttributes.ToString());
                        results.Add(configurationPolicyAssignment);
                    }

                foreach (var assignmentResponse in responsesWithValue.Select(r => r))
                {
                    var sourcePolicy = resources.FirstOrDefault(p =>
                        p.Id == assignmentResponse.Id);
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = assignmentResponse.Assignments.ToList()
                    };
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var macOsCustomAttributesAssignment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.MacOsCustomAttributes.ToString());
                            results.Add(macOsCustomAttributesAssignment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var macOsCustomAttributesAssignment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.MacOsCustomAttributes.ToString());
                            results.Add(macOsCustomAttributesAssignment);
                        }
                }
            }

            return results;
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
        }

        return null;
    }

    public async Task<List<CustomAssignmentsModel>?> GetIosLobAppProvisioningAssignmentListAsync(string? accessToken,
        GroupModel? group, List<ResourceAssignmentsModel> resources)
    {
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        var results = new List<CustomAssignmentsModel>();
        try
        {
            var urlList = new List<string>();
            foreach (var resource in resources)
            {
                var policyUrl =
                    $"/deviceManagement/iosLobAppProvisioningConfigurations('{resource.Id}')?$expand=assignments";
                urlList.Add(policyUrl);
            }

            var batchRequestBody = GraphBatchHelper.CreateUrlListBatchOutput(urlList);
            foreach (var requestBody in batchRequestBody)
            {
                var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync(AppConfiguration.GRAPH_BATCH_URL, content);
                var responseStream = await response.Content.ReadAsStreamAsync();
                using var sr = new StreamReader(responseStream);
                var contentString = await sr.ReadToEndAsync();
                var result = 
                    JsonConvert.DeserializeObject<GraphBatchResponse<InnerResponseBodyOnly>>(
                        contentString,
                        JsonSettings.Default())!;
                var responsesWithValue = result?.Responses
                    .Where(r => r.Body.Assignments != null && r.Body.Assignments.Count > 0).Select(b => b.Body)
                    .ToList();
                var responsesWithNoValue =
                    result?.Responses.Where(r => r.Body.Assignments.IsNullOrEmpty()).Select(b => b.Body);
                if (responsesWithNoValue != null)
                    foreach (var nonAssigned in responsesWithNoValue)
                    {
                        AssignmentsResponseModel resource = new AssignmentsResponseModel
                        {
                            Id = nonAssigned?.Id,
                            DisplayName = nonAssigned?.DisplayName,
                            Assignments = new List<Assignment>()
                        };
                        var configurationPolicyAssignment =
                            resource.Assignments.FirstOrDefault()
                                .ToAssignmentModel(resource, ResourceTypes.MacOsCustomAttributes.ToString());
                        results.Add(configurationPolicyAssignment);
                    }

                foreach (var assignmentResponse in responsesWithValue.Select(r => r))
                {
                    var sourcePolicy = resources.FirstOrDefault(p =>
                        p.Id == assignmentResponse.Id);
                    AssignmentsResponseModel resource = new AssignmentsResponseModel
                    {
                        Id = sourcePolicy?.Id,
                        DisplayName = sourcePolicy?.DisplayName,
                        Assignments = assignmentResponse.Assignments.ToList()
                    };
                    if (group is null)
                    {
                        foreach (var assignment in resource.Assignments)
                        {
                            var iosLobAppAssignment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.IosLobAppConfiguration.ToString());
                            results.Add(iosLobAppAssignment);
                        }
                    }
                    else
                        foreach (var assignment in resource.Assignments.Where(g => g.Target.GroupId == group.Id))
                        {
                            var iosLobAppAssignment =
                                assignment.ToAssignmentModel(resource, ResourceTypes.IosLobAppConfiguration.ToString());
                            results.Add(iosLobAppAssignment);
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching iOS Lob apps assignments: " + ex.ToMessage());
            return null;
        }

        return results;
    }
}