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


        var showAssignements = new AssignmentsCmd();
        var showGroupAssignments = new AssignmentsGroupCmd();
        
        devicesCommand.AddCommand(devicesDuplicateCommand);
        devicesCommand.AddCommand(devicesOsBuildOverview);

        showAssignements.AddCommand(showGroupAssignments);
        showCommand.AddCommand(showPolicyCommand);
        showCommand.AddCommand(showAssignmentFiltersCommand);
        showCommand.AddCommand(devicesCommand);
        showCommand.AddCommand(showAssignements);
        
        return showCommand;
    }
}