using System.CommandLine;
using IntuneAssistant.Cli.Commands.Policies;

namespace IntuneAssistant.Cli.Commands.Show;

public static class ShowCmd
{
    public static Command New()
    {
        var showCommand = new Command(CommandConfiguration.ShowCommandName, CommandConfiguration.ShowCommandDescription);
        var showPolicyCommand = new Command(CommandConfiguration.PoliciesCommandName, CommandConfiguration.PoliciesCommandDescription);

        var showCompliancePolicyCommand = new CompliancePoliciesCmd();
        var showConfigurationPolicyCommand = new ConfigurationPoliciesCmd();

        showPolicyCommand.AddCommand(showCompliancePolicyCommand);
        showPolicyCommand.AddCommand(showConfigurationPolicyCommand);

        showCommand.AddCommand(showPolicyCommand);
        return showCommand;
    }
}