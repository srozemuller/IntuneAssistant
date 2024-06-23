
using Blazored.LocalStorage;
using IntuneAssistant.Constants;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Interfaces.Devices;
using IntuneAssistant.Infrastructure.Interfaces.Logging;
using IntuneAssistant.Infrastructure.Interfaces.Policies.CA;
using IntuneAssistant.Infrastructure.Services;
using IntuneAssistant.Infrastructure.Services.Devices;
using IntuneAssistant.Infrastructure.Services.LoggingServices;
using IntuneAssistant.Infrastructure.Services.Policies.Ca;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using IntuneAssistant.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Authentication;
using Microsoft.Identity.Client;
using MudBlazor.Services;


var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddBlazoredLocalStorage();

builder.Services.AddMudServices();
builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<IApplicationInsightsService, WebApplicationInsightsService>();
builder.Services.AddScoped<ICompliancePoliciesService, CompliancePolicyService>();

builder.Services.AddScoped<IConfigurationPolicyService, ConfigurationPolicyService>();
builder.Services.AddScoped<ICaPolicyService, CaPolicyService>();
builder.Services.AddScoped<IDeviceScriptsService, DeviceScriptService>();
builder.Services.AddScoped<IDeviceService, DeviceService>();
builder.Services.AddScoped<IAssignmentsService, AssignmentsService>();
builder.Services.AddScoped<IAssignmentFiltersService, AssignmentFiltersService>();
builder.Services.AddScoped<IGroupInformationService, GroupInformationService>();
builder.Services.AddScoped<IDeviceScriptsService, DeviceScriptService>();
builder.Services.AddScoped<IAutoPilotService, AutoPilotService>();
builder.Services.AddScoped<IIntentsService, IntentsService>();
builder.Services.AddScoped<IUpdatesService, UpdatesService>();
builder.Services.AddScoped<IAppsService, AppsService>();


builder.Services.AddHttpClient("BlazorApp.ServerAPI", client => client.BaseAddress = new Uri(builder.HostEnvironment.BaseAddress))  
    .AddHttpMessageHandler<BaseAddressAuthorizationMessageHandler>();  

// Supply HttpClient instances that include access tokens when making requests to the server project  
builder.Services.AddScoped(sp => sp.GetRequiredService<IHttpClientFactory>().CreateClient("BlazorApp.ServerAPI"));

builder.Services.AddMsalAuthentication(options =>  
{  
    builder.Configuration.Bind("AzureAd", options.ProviderOptions.Authentication);
    options.ProviderOptions.AdditionalScopesToConsent.Add("api://b0533a36-0d90-4634-9f08-99a50b78b477/access_as_user");
    options.ProviderOptions.DefaultAccessTokenScopes.Add("api://b0533a36-0d90-4634-9f08-99a50b78b477/access_as_user");  
    options.ProviderOptions.LoginMode = "redirect";
}); 
await builder.Build().RunAsync();
