using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class AssignmentsService : IAssignmentsService
{
    public async Task<List<AssignmentsModel>?> GetConfigurationPolicyAssignmentsListAsync(string accessToken,
        Group? group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        try
        {
            var configPolResults = await graphClient.DeviceManagement.ConfigurationPolicies.GetAsync(
                requestConfiguration =>
                {
                    requestConfiguration.QueryParameters.Filter = null;
                    requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
                });
            foreach (var policy in configPolResults.Value)
            {
                List<DeviceManagementConfigurationPolicyAssignment> configurationAssignments = null;
                if (group is null)
                {
                    if (policy.Assignments != null) configurationAssignments = policy.Assignments.ToList();
                }
                else
                {
                    string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
                    if (policy.Assignments != null)
                        configurationAssignments = policy.Assignments.Where(a =>
                            group.Id != null && a.Id != null && a.Target?.OdataType == groupOdataType && a.Id.Contains(group.Id)).ToList();
                }

                foreach (var assignment in configurationAssignments)
                {
                    GroupAssignmentTarget groupTarget = null;
                    if (assignment.Target is GroupAssignmentTarget scriptGroup)
                    {
                        groupTarget = scriptGroup;
                    }

                    var configAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(null, groupTarget, policy.Id,
                        policy.ToString(), policy.Name);
                    results.Add(configAssignmentInfo);
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching configuration policies: " + ex.ToMessage());
            return null;
        }

        return results;
    }

    public async Task<List<AssignmentsModel>?> GetDeviceManagementScriptsAssignmentsListAsync(string accessToken,
        Group? group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        try
        {
            var scriptsResults = await graphClient.DeviceManagement.DeviceManagementScripts.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            if (scriptsResults?.Value?.Count > 0)
            {
                foreach (var script in scriptsResults.Value)
                {
                    List<DeviceManagementScriptAssignment> scriptAssignments = null;
                    if (group is null)
                    {
                        if (script.Assignments != null) scriptAssignments = script.Assignments.ToList();
                    }
                    else
                    {
                        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
                        if (script.Assignments != null)
                            scriptAssignments = script.Assignments.Where(a =>
                                group.Id != null && a.Id != null && a.Target?.OdataType == groupOdataType && a.Id.Contains(group.Id)).ToList();
                    }

                    if (scriptAssignments != null)
                        foreach (var scriptAssignment in scriptAssignments)
                        {
                            GroupAssignmentTarget groupTarget = null;
                            if (scriptAssignment.Target is GroupAssignmentTarget scriptGroup)
                            {
                                groupTarget = scriptGroup;
                            }

                            if (script.Id != null)
                            {
                                var scriptAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(null, groupTarget,
                                    script.Id,
                                    script.ToString(), script.DisplayName);
                                results.Add(scriptAssignmentInfo);
                            }
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching script assignments: " + ex.ToMessage());
            return null;
        }

        return results;
    }

    public async Task<List<AssignmentsModel>?> GetHealthScriptsAssignmentsByGroupListAsync(string accessToken,
        Group? group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        try
        {
            var healthScriptResults = await graphClient.DeviceManagement.DeviceHealthScripts.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            if (healthScriptResults?.Value?.Count > 0)
            {
                foreach (var script in healthScriptResults.Value)
                {
                    List<DeviceHealthScriptAssignment> scriptAssignments = null;
                    if (group is null)
                    {
                        if (script.Assignments != null) scriptAssignments = script.Assignments.ToList();
                    }
                    else
                    {
                        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
                        if (script.Assignments != null)
                            scriptAssignments = script.Assignments.Where(a =>
                                group.Id != null && a.Id != null && a.Target?.OdataType == groupOdataType && a.Id.Contains(group.Id)).ToList();
                    }

                    if (scriptAssignments != null)
                        foreach (var scriptAssignment in scriptAssignments)
                        {
                            GroupAssignmentTarget groupTarget = null;
                            if (scriptAssignment.Target is GroupAssignmentTarget scriptGroup)
                            {
                                groupTarget = scriptGroup;
                            }

                            if (script.Id != null)
                            {
                                var healthScriptAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(null,
                                    groupTarget,
                                    script.Id, script.ToString(), script.DisplayName);
                                results.Add(healthScriptAssignmentInfo);
                            }
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching autopilot policies: " + ex.ToMessage());
            return null;
        }

        return results;
    }

    public async Task<List<AssignmentsModel>?> GetAutoPilotAssignmentsByGroupListAsync(string accessToken, Group? group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        try
        {
            var autopilotResults = await graphClient.DeviceManagement.WindowsAutopilotDeploymentProfiles.GetAsync(
                requestConfiguration =>
                {
                    requestConfiguration.QueryParameters.Filter = null;
                    requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
                });
            if (autopilotResults?.Value?.Count > 0)
            {
                foreach (var autopilotProfile in autopilotResults.Value)
                {
                    List<WindowsAutopilotDeploymentProfileAssignment> autoPilotAssignments = null;
                    if (group is null)
                    {
                        if (autopilotProfile.Assignments != null) autoPilotAssignments = autopilotProfile.Assignments.ToList();
                    }
                    else
                    {
                        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
                        if (autopilotProfile.Assignments != null)
                            autoPilotAssignments = autopilotProfile.Assignments.Where(a =>
                                group.Id != null && a.Id != null && a.Target?.OdataType == groupOdataType && a.Id.Contains(group.Id)).ToList();
                    }

                    if (autoPilotAssignments != null)
                        foreach (var autoPilotAssignment in autoPilotAssignments)
                        {
                            GroupAssignmentTarget groupTarget = null;
                            if (autoPilotAssignment.Target is GroupAssignmentTarget pilotGroup)
                            {
                                groupTarget = pilotGroup;
                            }

                            if (autopilotProfile.Id != null)
                            {
                                var autopilotAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(null, groupTarget,
                                    autopilotProfile.Id, autopilotProfile.ToString(), autopilotProfile.DisplayName);
                                results.Add(autopilotAssignmentInfo);
                            }
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching autopilot policies: " + ex.ToMessage());
            return null;
        }

        return results;
    }

    public async Task<List<AssignmentsModel>?> GetMobileAppAssignmentsByGroupListAsync(string accessToken, Group? group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        try
        {
            var mobileAppResults = await graphClient.DeviceAppManagement.MobileApps.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            if (mobileAppResults?.Value?.Count > 0)
            {
                foreach (var mobileApp in mobileAppResults.Value)
                {
                    List<MobileAppAssignment> mobileAppAssignments = null;
                    if (group is null)
                    {
                        if (mobileApp.Assignments != null) mobileAppAssignments = mobileApp.Assignments.ToList();
                    }
                    else
                    {
                        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
                        if (mobileApp.Assignments != null)
                            mobileAppAssignments = mobileApp.Assignments.Where(a =>
                                group.Id != null && a.Id != null && a.Target?.OdataType == groupOdataType && a.Id.Contains(group.Id)).ToList();
                    }

                    if (mobileAppAssignments != null)
                        foreach (var appAssignment in mobileAppAssignments)
                        {
                            GroupAssignmentTarget groupTarget = null;
                            if (appAssignment.Target is GroupAssignmentTarget appGroup)
                            {
                                groupTarget = appGroup;
                            }

                            if (mobileApp.Id != null)
                            {
                                var mobileAppAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(null, groupTarget,
                                    mobileApp.Id, mobileApp.ToString(), mobileApp.DisplayName);
                                results.Add(mobileAppAssignmentInfo);
                            }
                        }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching mobile app assignments: " + ex.ToMessage());
            return null;
        }

        return results;
    }

    public async Task<List<AssignmentsModel>?> GetTargetedAppConfigurationsAssignmentsByGroupListAsync(
        string accessToken, Group? group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        try
        {
            var targetAppConfigResults = await graphClient.DeviceAppManagement.TargetedManagedAppConfigurations.GetAsync(
                requestConfiguration =>
                {
                    requestConfiguration.QueryParameters.Filter = null;
                    requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
                });
            if (targetAppConfigResults?.Value?.Count > 0)
            {
                foreach (var targetApp in targetAppConfigResults.Value)
                {
                    List<TargetedManagedAppPolicyAssignment> targetAppAssignments = null;
                    if (group is null)
                    {
                        if (targetApp.Assignments != null) targetAppAssignments = targetApp.Assignments.ToList();
                    }
                    else
                    {
                        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
                        if (targetApp.Assignments != null)
                            targetAppAssignments = targetApp.Assignments.Where(a =>
                                group.Id != null && a.Id != null && a.Target?.OdataType == groupOdataType && a.Id.Contains(group.Id)).ToList();
                    }

                    if (targetAppAssignments == null) continue;
                    foreach (var targetAppAssignment in targetAppAssignments)
                    {
                        GroupAssignmentTarget groupTarget = null;
                        if (targetAppAssignment.Target is GroupAssignmentTarget targetAppGroup)
                        {
                            groupTarget = targetAppGroup;
                        }

                        if (targetApp.Id != null)
                        {
                            var targetAppConfigAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(
                                null, groupTarget, targetApp.Id, targetApp.ToString(),
                                targetApp.DisplayName);
                            results.Add(targetAppConfigAssignmentInfo);
                        }
                    }
                }
            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching autopilot policies: " + ex.ToMessage());
            return null;
        }

        return results;
    }

    public async Task<List<AssignmentsModel>?> GetAppProtectionAssignmentsByGroupListAsync(string accessToken,
        Group? group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        try
        {
            AssignmentsModel assignmentInfo = null;
            var windowsAppProtectionResults = await graphClient.DeviceAppManagement.WindowsManagedAppProtections.GetAsync(
                requestConfiguration =>
                {
                    requestConfiguration.QueryParameters.Filter = null;
                    requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
                });
            if (windowsAppProtectionResults?.Value?.Count > 0)
            {
                foreach (var appProtection in windowsAppProtectionResults.Value)
                {
                    List<TargetedManagedAppPolicyAssignment> appProtectionAssignments = null;
                    if (group is null)
                    {
                        if (appProtection.Assignments != null) appProtectionAssignments = appProtection.Assignments.ToList();
                    }
                    else
                    {
                        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
                        if (appProtection.Assignments != null)
                            appProtectionAssignments = appProtection.Assignments.Where(a =>
                                group.Id != null && a.Id != null && a.Target?.OdataType == groupOdataType && a.Id.Contains(group.Id)).ToList();
                    }

                    if (appProtectionAssignments != null)
                        foreach (var scriptAssignment in appProtectionAssignments)
                        {
                            GroupAssignmentTarget groupTarget = null;
                            if (scriptAssignment.Target is GroupAssignmentTarget scriptGroup)
                            {
                                groupTarget = scriptGroup;
                            }

                            if (appProtection.Id != null)
                                assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(null, groupTarget,
                                    appProtection.Id, appProtection.ToString(), appProtection.DisplayName
                                );
                            if (assignmentInfo != null) results.Add(assignmentInfo);
                        }
                }
            }

            // iOS app protection
            var iosAppProtectionResults = await graphClient.DeviceAppManagement.IosManagedAppProtections.GetAsync(
                requestConfiguration =>
                {
                    requestConfiguration.QueryParameters.Filter = null;
                    requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
                });
            if (iosAppProtectionResults?.Value?.Count > 0)
            {
                foreach (var iosApp in iosAppProtectionResults.Value)
                {
                    List<TargetedManagedAppPolicyAssignment> iosAppProtectionAssignments = null;
                    if (group is null)
                    {
                        if (iosApp.Assignments != null) iosAppProtectionAssignments = iosApp.Assignments.ToList();
                    }
                    else
                    {
                        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
                        if (iosApp.Assignments != null)
                            iosAppProtectionAssignments = iosApp.Assignments.Where(a =>
                                group.Id != null && a.Id != null && a.Target?.OdataType == groupOdataType && a.Id.Contains(group.Id)).ToList();
                    }
                    if (iosAppProtectionAssignments?.Count > 0)
                    {
                        foreach (var iosAppAssignment in iosAppProtectionAssignments)
                        {
                            GroupAssignmentTarget groupTarget = null;
                            if (iosAppAssignment?.Target is GroupAssignmentTarget scriptGroup)
                            {
                                groupTarget = scriptGroup;
                            }

                            if (iosAppAssignment?.Id != null)
                                assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(null, groupTarget,
                                    iosAppAssignment?.Id, iosAppAssignment?.ToString(), iosApp.DisplayName
                                );
                            if (assignmentInfo != null) results.Add(assignmentInfo);
                        }
                    }
                }
            }

            // Android app protection
            var androidAppProtectionResults = await graphClient.DeviceAppManagement.AndroidManagedAppProtections.GetAsync(
                requestConfiguration =>
                {
                    requestConfiguration.QueryParameters.Filter = null;
                    requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
                });
            if (androidAppProtectionResults.Value.Count > 0)
            {
                foreach (var androidApp in androidAppProtectionResults.Value)
                {
                    List<TargetedManagedAppPolicyAssignment> androidAppProtectionAssignments = null;
                    if (group is null)
                    {
                        if (androidApp.Assignments != null) androidAppProtectionAssignments = androidApp.Assignments.ToList();
                    }
                    else
                    {
                        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
                        if (androidApp.Assignments != null)
                            androidAppProtectionAssignments = androidApp.Assignments.Where(a =>
                                group.Id != null && a.Id != null && a.Target?.OdataType == groupOdataType && a.Id.Contains(group.Id)).ToList();
                    }

                    if (androidAppProtectionAssignments != null)
                        foreach (var androidAppAssigment in androidAppProtectionAssignments)
                        {
                            GroupAssignmentTarget androidGroupTarget = null;
                            if (androidAppAssigment.Target is GroupAssignmentTarget androidGroup)
                            {
                                androidGroupTarget = androidGroup;
                            }

                            if (androidAppAssigment.Id != null)
                                assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(null, androidGroupTarget,
                                    androidAppAssigment.Id, androidAppAssigment.ToString(), androidApp.DisplayName);
                            if (assignmentInfo != null) results.Add(assignmentInfo);
                        }
                }
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
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        try
        {
            var polResults = await graphClient.DeviceManagement.DeviceCompliancePolicies.GetAsync(
                requestConfiguration =>
                {
                    requestConfiguration.QueryParameters.Filter = null;
                    requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
                });
            List<DeviceCompliancePolicy> policiesWithGroupAssignments = polResults.Value.Where(r =>
                r.Assignments != null).ToList();

            foreach (var policy in policiesWithGroupAssignments)
            {
                List<DeviceCompliancePolicyAssignment> complianceAssignments;
                if (group is null)
                {
                    complianceAssignments = policy.Assignments.ToList();
                }
                else
                {
                    string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
                    complianceAssignments = policy.Assignments.Where(a =>
                        a.Target.OdataType == groupOdataType && a.Id.Contains(group.Id)).ToList();
                }

                foreach (var assignment in complianceAssignments)
                {
                    DeviceAndAppManagementAssignmentTarget deviceTarget = null;
                    GroupAssignmentTarget groupTarget = null;
                    if (assignment.Target is DeviceAndAppManagementAssignmentTarget target)
                    {
                        deviceTarget = target;
                    }

                    if (assignment.Target is GroupAssignmentTarget groupAssignment)
                    {
                        groupTarget = groupAssignment;
                    }

                    var complianceAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(deviceTarget,
                        groupTarget, policy.Id,
                        policy.ToString(), policy.DisplayName);
                    results.Add(complianceAssignmentInfo);
                }

            }
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching compliance policies: " + ex.ToMessage());
            return null;
        }

        return results;
    }
}
    