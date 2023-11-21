using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class AssignmentsService : IAssignmentsService
{
    public async Task<List<AssignmentsModel>?> GetCompliancePolicyAssignmentsByGroupListAsync(string accessToken, Group group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
        try
        {
            var polResults = new DeviceCompliancePolicyCollectionResponse();
            var policiesWithGroupAssignments = new List<DeviceCompliancePolicy>();
            var complianceAssignmentInfo = new AssignmentsModel();
            polResults = await graphClient.DeviceManagement.DeviceCompliancePolicies.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            policiesWithGroupAssignments = polResults.Value.Where(r =>
                r.Assignments.Any(t => t.Target.OdataType == groupOdataType && t.Id.Contains(group.Id))).ToList();

            foreach (var policy in policiesWithGroupAssignments)
            {
                List<DeviceCompliancePolicyAssignment> assignments = policy.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var assignment in assignments)
                {
                    complianceAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(assignment.Target, policy.Id,
                        policy.ToString(), policy.DisplayName, group.Id
                    );
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

    public async Task<List<AssignmentsModel>?> GetConfigurationPolicyAssignmentsByGroupListAsync(string accessToken, Group group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
        try
        {
            var configPoliciesWithGroupAssignments = new List<DeviceManagementConfigurationPolicy>();
            var configPolResults = new DeviceManagementConfigurationPolicyCollectionResponse();
            var configAssignmentInfo = new AssignmentsModel();
            configPolResults = await graphClient.DeviceManagement.ConfigurationPolicies.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            configPoliciesWithGroupAssignments = configPolResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == groupOdataType && t.Id.Contains(group.Id))).ToList();

            foreach (var policy in configPoliciesWithGroupAssignments)
            {
                List<DeviceManagementConfigurationPolicyAssignment> assignments = policy.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var assignment in assignments)
                {
                    configAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(assignment.Target, policy.Id, policy.ToString(), policy.Name, group.Id
                    );
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

    public async Task<List<AssignmentsModel>?> GetDeviceManagementScriptsAssignmentsByGroupListAsync(string accessToken, Group group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
        try
        {
            var scriptsResults = new DeviceManagementScriptCollectionResponse();
            var scriptsWithGroupAssignments = new List<DeviceManagementScript>();
            var scriptAssignmentInfo = new AssignmentsModel();
            scriptsResults = await graphClient.DeviceManagement.DeviceManagementScripts.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            scriptsWithGroupAssignments = scriptsResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == groupOdataType && t.Id.Contains(group.Id))).ToList();

            foreach (var script in scriptsWithGroupAssignments)
            {
                List<DeviceManagementScriptAssignment> scriptAssignments = script.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var scriptAssignment in scriptAssignments)
                {
                    scriptAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(scriptAssignment.Target, script.Id, script.ToString(), script.DisplayName, group.Id
                    );
                    results.Add(scriptAssignmentInfo);
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

    public async Task<List<AssignmentsModel>?> GetHealthScriptsAssignmentsByGroupListAsync(string accessToken, Group group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
        try
        {
            var healtScriptResults = new DeviceHealthScriptCollectionResponse();
            var healthScriptsWithGroupAssignments = new List<DeviceHealthScript>();
            var healtScriptAssignmentInfo = new AssignmentsModel();
            healtScriptResults = await graphClient.DeviceManagement.DeviceHealthScripts.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            healthScriptsWithGroupAssignments = healtScriptResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == groupOdataType && t.Id.Contains(group.Id))).ToList();

            foreach (var script in healthScriptsWithGroupAssignments)
            {
                List<DeviceHealthScriptAssignment> scriptAssignments = script.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var scriptAssignment in scriptAssignments)
                {
                    healtScriptAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(scriptAssignment.Target, script.Id, script.ToString(), script.DisplayName, group.Id
                    );
                    results.Add(healtScriptAssignmentInfo);
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

    public async Task<List<AssignmentsModel>?> GetAutoPilotAssignmentsByGroupListAsync(string accessToken, Group group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
        try
        {
            var autopilotResults = new WindowsAutopilotDeploymentProfileCollectionResponse();
            var autopilotWithGroupAssignments = new List<WindowsAutopilotDeploymentProfile>();
            var autopilotAssignmentInfo = new AssignmentsModel();
            autopilotResults = await graphClient.DeviceManagement.WindowsAutopilotDeploymentProfiles.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            autopilotWithGroupAssignments = autopilotResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == groupOdataType && t.Id.Contains(group.Id))).ToList();

            foreach (var autopilotProfile in autopilotWithGroupAssignments)
            {
                List<WindowsAutopilotDeploymentProfileAssignment> scriptAssignments = autopilotProfile.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var scriptAssignment in scriptAssignments)
                {
                    autopilotAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(scriptAssignment.Target, autopilotProfile.Id, autopilotProfile.ToString(), autopilotProfile.DisplayName, group.Id
                    );
                    results.Add(autopilotAssignmentInfo);
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

    public async Task<List<AssignmentsModel>?> GetMobileAppAssignmentsByGroupListAsync(string accessToken, Group group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
        
        try
        {
            var mobileAppResults = new MobileAppCollectionResponse();
            var mobileAppsWithGroupAssignments = new List<MobileApp>();
            var mobileAppAssignmentInfo = new AssignmentsModel();
            mobileAppResults = await graphClient.DeviceAppManagement.MobileApps.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            mobileAppsWithGroupAssignments = mobileAppResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == groupOdataType && t.Id.Contains(group.Id))).ToList();

            foreach (var app in mobileAppsWithGroupAssignments)
            {
                List<MobileAppAssignment> appAssignments = app.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var appAssignment in appAssignments)
                {
                    mobileAppAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(appAssignment.Target, app.Id, app.ToString(), app.DisplayName, group.Id
                    );
                    results.Add(mobileAppAssignmentInfo);
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

    public async Task<List<AssignmentsModel>?> GetTargetedAppConfigurationsAssignmentsByGroupListAsync(string accessToken, Group group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
        try
        {
            var targetAppConfigResults = new TargetedManagedAppConfigurationCollectionResponse();
            var targetAppConfigWithGroupAssignments = new List<TargetedManagedAppConfiguration>();
            var targetAppConfigAssignmentInfo = new AssignmentsModel();
            targetAppConfigResults = await graphClient.DeviceAppManagement.TargetedManagedAppConfigurations.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            targetAppConfigWithGroupAssignments = targetAppConfigResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == groupOdataType && t.Id.Contains(group.Id))).ToList();

            foreach (var autopilotProfile in targetAppConfigWithGroupAssignments)
            {
                List<TargetedManagedAppPolicyAssignment> scriptAssignments = autopilotProfile.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var scriptAssignment in scriptAssignments)
                {
                    targetAppConfigAssignmentInfo = AssignmentModelExtensions.ToAssignmentModel(scriptAssignment.Target, autopilotProfile.Id, autopilotProfile.ToString(), autopilotProfile.DisplayName, group.Id
                    );
                    results.Add(targetAppConfigAssignmentInfo);
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

    public async Task<List<AssignmentsModel>?> GetAppProtectionAssignmentsByGroupListAsync(string accessToken, Group group)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var results = new List<AssignmentsModel>();
        string groupOdataType = "#microsoft.graph.groupAssignmentTarget";
        try
        {
            var windowsAppProtectionResults = new WindowsManagedAppProtectionCollectionResponse();
            var windowsAppProtectionAssignments = new List<WindowsManagedAppProtection>();
            
            var iosAppProtectionResults = new IosManagedAppProtectionCollectionResponse();
            var iosAppProtectionAssignments = new List<IosManagedAppProtection>();

            var androidAppProtectionResults = new AndroidManagedAppProtectionCollectionResponse();
            var androidAppProtectionAssignments = new List<AndroidManagedAppProtection>();
            
            var assignmentInfo = new AssignmentsModel();
            windowsAppProtectionResults = await graphClient.DeviceAppManagement.WindowsManagedAppProtections.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            windowsAppProtectionAssignments = windowsAppProtectionResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == groupOdataType && t.Id.Contains(group.Id))).ToList();

            foreach (var appProtection in windowsAppProtectionAssignments)
            {
                List<TargetedManagedAppPolicyAssignment> appAssignments = appProtection.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var scriptAssignment in appAssignments)
                {
                    assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(scriptAssignment.Target, appProtection.Id, appProtection.ToString(), appProtection.DisplayName, group.Id
                    );
                    results.Add(assignmentInfo);
                }
            }
            
            // iOS app protection
            iosAppProtectionResults = await graphClient.DeviceAppManagement.IosManagedAppProtections.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            iosAppProtectionAssignments = iosAppProtectionResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == groupOdataType && t.Id.Contains(group.Id))).ToList();

            foreach (var iosAppAssigment in iosAppProtectionAssignments)
            {
                List<TargetedManagedAppPolicyAssignment> iosAppAssignments = iosAppAssigment.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var scriptAssignment in iosAppAssignments)
                {
                    assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(scriptAssignment.Target, iosAppAssigment.Id, iosAppAssigment.ToString(), iosAppAssigment.DisplayName, group.Id
                    );
                    results.Add(assignmentInfo);
                }
            }
            
            // Android app protection
            androidAppProtectionResults = await graphClient.DeviceAppManagement.AndroidManagedAppProtections.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            androidAppProtectionAssignments = androidAppProtectionResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == groupOdataType && t.Id.Contains(group.Id))).ToList();

            foreach (var androidAppAssigment in androidAppProtectionAssignments)
            {
                List<TargetedManagedAppPolicyAssignment> iosAppAssignments = androidAppAssigment.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id)).ToList();
                foreach (var scriptAssignment in iosAppAssignments)
                {
                    assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(scriptAssignment.Target, androidAppAssigment.Id, androidAppAssigment.ToString(), androidAppAssigment.DisplayName, group.Id
                    );
                    results.Add(assignmentInfo);
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

    public async Task<List<AssignmentsModel>?> GetAssignmentsListAsync(string accessToken)
    {
        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var polResults = new DeviceCompliancePolicyCollectionResponse();
        var configPolResults = new DeviceManagementConfigurationPolicyCollectionResponse();
        var policiesWithGroupAssignments = new List<DeviceCompliancePolicy>();
        var results = new List<AssignmentsModel>();
        var assignmentInfo = new AssignmentsModel();
        try
        {
            polResults = await graphClient.DeviceManagement.DeviceCompliancePolicies.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            policiesWithGroupAssignments = polResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == "#microsoft.graph.groupAssignmentTarget")).ToList();

            foreach (var policy in policiesWithGroupAssignments)
            {
                List<DeviceCompliancePolicyAssignment> assignments = policy.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget").ToList();
                foreach (var assignment in assignments)
                {
                    assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(assignment.Target, assignment.Id, policy.ToString(), policy.DisplayName,assignment.Id
                    );
                    results.Add(assignmentInfo);
                }

            }

        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching compliance policies: " + ex.ToMessage());
            return null;
        }
        try
        {
            configPolResults = await graphClient.DeviceManagement.ConfigurationPolicies.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = null;
                requestConfiguration.QueryParameters.Expand = new[] { "assignments" };
            });
            //policiesWithGroupAssignments = polResults.Value.SelectMany(r => r.Assignments.Where(a => a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget" && a.Id.Contains(group.Id))).ToList();
            policiesWithGroupAssignments = polResults.Value.Where(r=> r.Assignments.Any(t => t.Target.OdataType == "#microsoft.graph.groupAssignmentTarget")).ToList();

            foreach (var policy in policiesWithGroupAssignments)
            {
                List<DeviceCompliancePolicyAssignment> assignments = policy.Assignments.Where(a =>
                    a.Target.OdataType == "#microsoft.graph.groupAssignmentTarget").ToList();
                foreach (var assignment in assignments)
                {
                    assignmentInfo = AssignmentModelExtensions.ToAssignmentModel(assignment.Target, assignment.Id, policy.ToString(), policy.DisplayName, policy.Id
                    );
                    results.Add(assignmentInfo);
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
