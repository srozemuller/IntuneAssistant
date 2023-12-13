using System.CommandLine;
using IntuneAssistant.Cli.Commands.Policies.Configuration;

namespace IntuneAssistant.Cli.Commands.Policies;

public static class PoliciesCmd
{
    public static Command New()
    {

        var policiesCommand = new Command(CommandConfiguration.PoliciesCommandName,
            CommandConfiguration.PoliciesCommandDescription);
        var globalOption = new Option<Enums.FixedOptions?>(CommandConfiguration.OutputFlags,
            CommandConfiguration.OutputFlagsDescription);
        policiesCommand.AddGlobalOption(globalOption);
        
        policiesCommand.AddCommand(ConfigurationPoliciesCmd.New());

        return policiesCommand;
    }
}