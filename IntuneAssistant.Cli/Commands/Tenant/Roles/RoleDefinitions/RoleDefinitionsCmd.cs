using System.CommandLine;

namespace IntuneAssistant.Cli.Commands.Tenant.Roles.RoleDefinitions;

public static class RoleDefinitionsCmd
{
    public static Command New()
    {
        var roleDefinitionsCommand = new Command(CommandConfiguration.RoleDefinitionsCmdName,
            CommandConfiguration.RoleDefinitionsDescription);
        var globalOption = new Option<Enums.FixedOptions?>(CommandConfiguration.OutputFlags,
            CommandConfiguration.OutputFlagsDescription);
        roleDefinitionsCommand.AddGlobalOption(globalOption);

        roleDefinitionsCommand.AddCommand(new RolesListCmd());

        return roleDefinitionsCommand;
    }
}