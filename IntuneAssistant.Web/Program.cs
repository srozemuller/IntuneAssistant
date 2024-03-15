using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Services;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using IntuneAssistant.Web;


var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");


builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
builder.Services.AddScoped<ICompliancePoliciesService, CompliancePolicyService>();
builder.Services.AddScoped<IConfigurationPolicyService, ConfigurationPolicyService>();
builder.Services.AddScoped<IAssignmentsService, AssignmentsService>();
builder.Services.AddScoped<IAssignmentFiltersService, AssignmentFiltersService>();
builder.Services.AddScoped<IGroupInformationService, GroupInformationService>();
builder.Services.AddMsalAuthentication(options =>
{
    builder.Configuration.Bind("AzureAd", options.ProviderOptions.Authentication);
    options.ProviderOptions.DefaultAccessTokenScopes.Add("DeviceManagementApps.Read.All");
    options.ProviderOptions.DefaultAccessTokenScopes.Add("Group.Read.All");
});

await builder.Build().RunAsync();
