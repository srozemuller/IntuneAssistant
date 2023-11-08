// See https://aka.ms/new-console-template for more information
using System.CommandLine;
using System.CommandLine.Builder;
using System.CommandLine.Parsing;
using IntuneAssistant.Cli.Commands;
using IntuneAssistant.Cli.Middleware;
using IntuneAssistant.Constants;
using IntuneAssistant.Interfaces;
using IntuneAssistant.Services;
using Microsoft.Extensions.DependencyInjection;
using Spectre.Console;


var rootCommand = new RootCommand
{
    new GetManagedDevicesCommand(),
    new DeviceDuplicateCommand(),
    new LoginToIntuneCommand(),
    new LogoutFromIntuneCommand()
};

var builder = new CommandLineBuilder(rootCommand)
    .UseDefaults()
    .UseHelp()
    .UseDependencyInjection(services =>
{
    services.AddSingleton(new HttpClient());
    services.AddLogging();
    services.AddScoped<ILoginService, LoginService>();
    services.AddScoped<ILogoutService, LogoutService>();
    services.AddScoped<IDeviceService, DeviceService>();
    services.AddScoped<IDeviceDuplicateService, DeviceDuplicateServices>();
});

AnsiConsole.MarkupLine($"\nCopyright {DateTime.Now.Year.ToString()} (c) {Branding.LegalName} CLI - [underline blue]{Branding.Builder}[/]");
AnsiConsole.MarkupLine($"Version {Branding.VersionInternalBuild} [yellow bold]INTERNAL BUILD[/]");
AnsiConsole.MarkupLine($"[grey]{Ascii.IntuneAssistantAscii}[/]");


AnsiConsole.MarkupLine("\n[grey]Refer to the [cyan link=https://rozemuller.com]rozemuller.com[/] for more information about the command-line usage.\n[/]");

return builder.Build().Invoke(args);
