using System.CommandLine;
using IntuneAssistant.Cli.Commands.Tenant.Roles.RoleAssignments;
using IntuneAssistant.Cli.Commands.Tenant.Roles.RoleDefinitions;

namespace IntuneAssistant.Cli.Commands.Tenant.Roles;

public static class RolesCmd
{
    public static Command New()
    {
        var rolesCommand = new Command(CommandConfiguration.RolesCmdName,
            CommandConfiguration.RolesCmdDescription);
        var globalOption = new Option<Enums.FixedOptions?>(CommandConfiguration.OutputFlags,
            CommandConfiguration.OutputFlagsDescription);
        rolesCommand.AddGlobalOption(globalOption);
        
        rolesCommand.AddCommand(RoleAssignmentsCmd.New());
        rolesCommand.AddCommand(RoleDefinitionsCmd.New());
        

        return rolesCommand;
    }
}