using System.CommandLine.Builder;
using System.CommandLine.Parsing;
using IntuneAssistant.Cli.Middleware;
using IntuneAssistant.Cli.Commands;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Interfaces.Devices;
using IntuneAssistant.Infrastructure.Interfaces.Logging;
using IntuneAssistant.Infrastructure.Services;
using IntuneAssistant.Infrastructure.Services.Devices;
using IntuneAssistant.Infrastructure.Services.LoggingServices;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.ApplicationInsights;
using Microsoft.IdentityModel.Abstractions;
using Spectre.Console;

var rootCommand = RootCmd.New();

var builder = new CommandLineBuilder(rootCommand)
    .UseDefaults()
    .UseHelp()
    .UseDependencyInjection(services =>
{
    services.AddSingleton(new HttpClient());
    services.AddSingleton<IIdentityHelperService, IdentityHelperService>();
    services.AddSingleton<ILogger, Logger<Program>>();
    services.AddSingleton<TelemetryClient>(serviceProvider =>
    {
        var telemetryConfiguration = TelemetryConfiguration.CreateDefault();
        telemetryConfiguration.InstrumentationKey = AppConfiguration.APPINSIGHTS_INSTRUMENTATIONKEY;
        return new TelemetryClient(telemetryConfiguration);
    });
    services.AddScoped<IDeviceService, DeviceService>();
    services.AddScoped<IApplicationInsightsService, CliApplicationInsightsService>();
    services.AddScoped<ICompliancePoliciesService, CompliancePolicyService>();
    services.AddScoped<IConfigurationPolicyService, ConfigurationPolicyService>();
    services.AddScoped<IAssignmentFiltersService, AssignmentFiltersService>();
    services.AddScoped<IAssignmentsService, AssignmentsService>();
    services.AddScoped<IGroupInformationService, GroupInformationService>();
    services.AddScoped<IAppsService, AppsService>();
    services.AddScoped<IAutoPilotService, AutopilotService>();
    services.AddScoped<ITenantInformationService, TenantInformationService>();
    services.AddScoped<IGlobalGraphService, GlobalGraphService>();
    services.AddScoped<IDeviceScriptsService, DeviceScriptService>();
    services.AddScoped<IIntentsService, IntentsService>();
    services.AddScoped<IUpdatesService, UpdatesService>();

    services.AddLogging(loggingBuilder =>
    {
        loggingBuilder.AddApplicationInsights(AppConfiguration.APPINSIGHTS_INSTRUMENTATIONKEY);
        loggingBuilder.AddFilter<ApplicationInsightsLoggerProvider>("", LogLevel.Warning);
    });
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
