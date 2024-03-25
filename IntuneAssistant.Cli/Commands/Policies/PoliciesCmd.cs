using System.CommandLine;
using IntuneAssistant.Cli.Commands.Policies.Configuration;

namespace IntuneAssistant.Cli.Commands.Policies;

public static class PoliciesCmd
{
    public static Command New()
    {

        var policiesCommand = new Command(CommandConfiguration.PoliciesCommandName,
            CommandConfiguration.PoliciesCommandDescription);
        var globalOption = new Option<Enums.OutputOptions?>(CommandConfiguration.OutputFlags,
            CommandConfiguration.OutputFlagsDescription);
        var nonAssignedOptions = new Option<bool>(CommandConfiguration.NonAssignedArg, CommandConfiguration.NonAssignedArgDescription);
        policiesCommand.AddGlobalOption(globalOption);
        policiesCommand.AddGlobalOption(nonAssignedOptions);
        
        policiesCommand.AddCommand(ConfigurationPoliciesCmd.New());

        return policiesCommand;
    }
}