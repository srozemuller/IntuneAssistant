using System.CommandLine;

namespace IntuneAssistant.Cli.Commands.Tenant.Roles.RoleAssignments;

public static class RoleAssignmentsCmd
{
    public static Command New()
    {
        var roleAssignmentsCommand = new Command(CommandConfiguration.RoleAssignmentsCmdName,
            CommandConfiguration.RoleAssignmentsCmdDescription);
        var globalOption = new Option<Enums.FixedOptions?>(CommandConfiguration.OutputFlags,
            CommandConfiguration.OutputFlagsDescription);
        roleAssignmentsCommand.AddGlobalOption(globalOption);
        
        roleAssignmentsCommand.AddCommand(new RoleAssignmentsListCmd());

        return roleAssignmentsCommand;
    }
}