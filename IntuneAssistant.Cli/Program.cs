// See https://aka.ms/new-console-template for more information
using System.CommandLine.Builder;
using System.CommandLine.Parsing;
using System.Reflection;
using IntuneAssistant.Cli.Middleware;
using IntuneAssistant.Cli.Commands;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using Spectre.Console;

var rootCommand = RootCmd.New();

var builder = new CommandLineBuilder(rootCommand)
    .UseDefaults()
    .UseHelp()
    .UseDependencyInjection(services =>
{
    services.AddSingleton(new HttpClient());
    services.AddLogging();
    services.AddSingleton<IIdentityHelperService, IdentityHelperService>();
    services.AddScoped<IDeviceService, DeviceService>();
    services.AddScoped<IDeviceDuplicateService, DeviceDuplicateServices>();
    services.AddScoped<ICompliancePoliciesService, CompliancePolicyService>();
    services.AddScoped<IConfigurationPolicyService, ConfigurationPolicyService>();
    services.AddScoped<IAssignmentFiltersService, AssignmentFiltersService>();
    services.AddScoped<IAssignmentsService, AssignmentsService>();
    services.AddScoped<IGroupInformationService, GroupInformationService>();
    services.AddScoped<IAppsService, AppsService>();
    services.AddScoped<ITenantInformationService, TenantInformationService>();
});

if (args.Contains("--help") || args.Contains("-h") || args.Contains("-?"))
{
    AnsiConsole.MarkupLine(
        $"\nCopyright {DateTime.Now.Year.ToString()} (c) {Branding.LegalName} CLI - Version: [underline darkorange]{Branding.Version}[/] - [underline darkorange]{Branding.Builder}[/]");
    AnsiConsole.MarkupLine($"[darkorange]{Ascii.INTUNE_ASSISTANT_ASCII}[/]");
    AnsiConsole.MarkupLine(
        "\n[grey]Refer to the [underline darkorange link=https://intuneCli.wiki]intunecli.wiki[/] for more information about the command-line usage.[/]");
    AnsiConsole.MarkupLine(
        "\n[grey]Go to [underline darkorange link=https://rozemuller.com]rozemuller.com[/] for more blogs and other usages referring the IntuneCLI.\n[/]");
}
return builder.Build().Invoke(args);
