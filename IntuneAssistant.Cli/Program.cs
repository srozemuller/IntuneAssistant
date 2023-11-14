// See https://aka.ms/new-console-template for more information
using System.CommandLine.Builder;
using System.CommandLine.Parsing;
using IntuneAssistant.Cli.Middleware;
using IntuneAssistant.Cli.Commands;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
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
});

    AnsiConsole.MarkupLine(
        $"\nCopyright {DateTime.Now.Year.ToString()} (c) {Branding.LegalName} CLI - [underline darkorange]{Branding.Builder}[/]");
//AnsiConsole.MarkupLine($"Version {Branding.VersionInternalBuild} [yellow bold]INTERNAL BUILD[/]");
    AnsiConsole.MarkupLine($"[darkorange]{Ascii.INTUNE_ASSISTANT_ASCII}[/]");

    AnsiConsole.MarkupLine(
        "\n[grey]Refer to the [darkorange link=https://rozemuller.com]rozemuller.com[/] for more information about the command-line usage.\n[/]");


return builder.Build().Invoke(args);
