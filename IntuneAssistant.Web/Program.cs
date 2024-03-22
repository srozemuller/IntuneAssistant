
using Blazored.LocalStorage;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Services;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using IntuneAssistant.Web;
using MudBlazor.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddBlazoredLocalStorage();
builder.Services.AddMudServices();
builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
builder.Services.AddMemoryCache();
builder.Services.AddScoped<ICompliancePoliciesService, CompliancePolicyService>();
builder.Services.AddScoped<IConfigurationPolicyService, ConfigurationPolicyService>();
builder.Services.AddScoped<IAssignmentsService, AssignmentsService>();
builder.Services.AddScoped<IAssignmentFiltersService, AssignmentFiltersService>();
builder.Services.AddScoped<IGroupInformationService, GroupInformationService>();
builder.Services.AddMsalAuthentication(options =>
{
    options.ProviderOptions.Cache.CacheLocation = "localStorage";
    builder.Configuration.Bind("AzureAd", options.ProviderOptions.Authentication);
    foreach (var scope in AppConfiguration.GRAPH_INTERACTIVE_SCOPE)
    {
        options.ProviderOptions.DefaultAccessTokenScopes.Add(scope);
    }
});

await builder.Build().RunAsync();
