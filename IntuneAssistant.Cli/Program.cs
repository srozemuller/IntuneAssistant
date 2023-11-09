// See https://aka.ms/new-console-template for more information
using System.CommandLine;
using System.CommandLine.Builder;
using System.CommandLine.Parsing;
using IntuneAssistant.Cli.Commands.Auth;
using IntuneAssistant.Cli.Commands.Auth.Logout;
using IntuneAssistant.Cli.Middleware;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using Spectre.Console;

var authCommand = new AuthCommand();
var authLogoutCommand = new AuthLogoutCommand();
authCommand.AddCommand(authLogoutCommand);

var rootCommand = new RootCommand
{
    // new GetManagedDevicesCommand(),
    // new DeviceDuplicateCommand(),
    // new CompliancePolicyCommand(),
    authCommand,
};

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
});

AnsiConsole.MarkupLine($"\nCopyright {DateTime.Now.Year.ToString()} (c) {Branding.LegalName} CLI - [underline blue]{Branding.Builder}[/]");
AnsiConsole.MarkupLine($"Version {Branding.VersionInternalBuild} [yellow bold]INTERNAL BUILD[/]");
AnsiConsole.MarkupLine($"[grey]{Ascii.INTUNE_ASSISTANT_ASCII}[/]");


AnsiConsole.MarkupLine("\n[grey]Refer to the [cyan link=https://rozemuller.com]rozemuller.com[/] for more information about the command-line usage.\n[/]");

return builder.Build().Invoke(args);
