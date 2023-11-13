using System.CommandLine;

namespace IntuneAssistant.Cli.Commands.Policies;

public static class PoliciesCmd
{
    public static Command New()
    {
        var policiesCommand = new GetCompliancePoliciesCommand();

        //policiesCommand.AddCommand(devicesDuplicateCommand);

        return policiesCommand;
    }
}