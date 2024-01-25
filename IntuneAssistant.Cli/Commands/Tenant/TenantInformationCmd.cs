using System.CommandLine;
using IntuneAssistant.Cli.Commands.Apps.Dependencies;
using IntuneAssistant.Cli.Commands.Tenant.RoleDefinitions;

namespace IntuneAssistant.Cli.Commands.Apps;

public static class TenantInformationCmd
{
    public static Command New()
    {
        var tenantCommand = new Command(CommandConfiguration.TenantCommandName, CommandConfiguration.TenantCommandDescription);

        var globalOption = new Option<string>(CommandConfiguration.PaginationFlag,
            CommandConfiguration.PaginationFlagsDescription);
        tenantCommand.AddGlobalOption(globalOption);
        var roleDefinitionsCommand = RoleDefinitionsCmd.New();

        tenantCommand.AddCommand(roleDefinitionsCommand);

        return tenantCommand;
    }
}