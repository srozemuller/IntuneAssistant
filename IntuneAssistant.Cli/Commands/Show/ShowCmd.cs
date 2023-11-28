using System.CommandLine;
using IntuneAssistant.Cli.Commands.Assignments;
using IntuneAssistant.Cli.Commands.Auth;
using IntuneAssistant.Cli.Commands.Policies;
using IntuneAssistant.Cli.Commands.Devices;

namespace IntuneAssistant.Cli.Commands.Show;

public static class ShowCmd
{
    public static Command New()
    {
        var showCommand = new Command(CommandConfiguration.ShowCommandName, CommandConfiguration.ShowCommandDescription);
        var showPolicyCommand = new PoliciesCmd();
        var showCompliancePolicyCommand = new CompliancePoliciesCmd();
        var showConfigurationPolicyCommand = new ConfigurationPoliciesCmd();
        showPolicyCommand.AddCommand(showCompliancePolicyCommand);
        showPolicyCommand.AddCommand(showConfigurationPolicyCommand);

        var showAssignmentFiltersCommand = new AssignmentFiltersCmd();
        var showAssigmentFilterEvaluationCommand = new AssignmentFilterDeviceEvaluationCmd();
        showAssignmentFiltersCommand.AddCommand(showAssigmentFilterEvaluationCommand);
        
        var devicesCommand = new ManagedDevicesCmd();
        var devicesDuplicateCommand = new DeviceDuplicateCmd();
        var devicesOsBuildOverview = new DevicesOsBuildOverviewCmd();


        var showAssignments = new AssignmentsCmd();
        var showGroupAssignments = new AssignmentsGroupCmd();
        var showAssignmentFilters = new AssignmentFiltersCmd();
        
        devicesCommand.AddCommand(devicesDuplicateCommand);
        devicesCommand.AddCommand(devicesOsBuildOverview);

        showAssignments.AddCommand(showGroupAssignments);
        showAssignments.AddCommand(showAssignmentFilters);
        showCommand.AddCommand(showPolicyCommand);
        showCommand.AddCommand(showAssignmentFiltersCommand);
        showCommand.AddCommand(devicesCommand);
        showCommand.AddCommand(showAssignments);
        
        return showCommand;
    }
}