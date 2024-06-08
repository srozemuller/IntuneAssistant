using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Interfaces.Logging;
using IntuneAssistant.Infrastructure.Interfaces.Policies.CA;
using IntuneAssistant.Infrastructure.Services;
using IntuneAssistant.Infrastructure.Services.LoggingServices;
using IntuneAssistant.Infrastructure.Services.Policies.Ca;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddScoped<ICaPolicyService, CaPolicyService>();
builder.Services.AddScoped<IConfigurationPolicyService, ConfigurationPolicyService>();
builder.Services.AddScoped<ICompliancePoliciesService, CompliancePolicyService>();
builder.Services.AddScoped<IAppsService, AppsService>();
builder.Services.AddScoped<IDeviceScriptsService, DeviceScriptService>();
builder.Services.AddScoped<IAutoPilotService, AutoPilotService>();
builder.Services.AddScoped<IUpdatesService, UpdatesService>();
builder.Services.AddScoped<IIntentsService, IntentsService>();
builder.Services.AddScoped<IAssignmentsService, AssignmentsService>();
builder.Services.AddScoped<IAssignmentFiltersService, AssignmentFiltersService>();
builder.Services.AddScoped<IGroupInformationService, GroupInformationService>();
builder.Services.AddScoped<IUserInformationService, UserInformationService>();


builder.Services.AddScoped<IApplicationInsightsService, CliApplicationInsightsService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"))
    .EnableTokenAcquisitionToCallDownstreamApi()
    .AddDownstreamWebApi("GraphApi", builder.Configuration.GetSection("GraphApi"))
    .AddInMemoryTokenCaches();

builder.Services.AddAuthorization();
var myAllowSpecificOrigins = "_myAllowSpecificOrigins";

    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: myAllowSpecificOrigins,
            builder =>
            {
                builder.WithOrigins("https://localhost:7074", "https://localhost:7224")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors(myAllowSpecificOrigins);

app.UseAuthorization();

app.MapControllers();

app.Run();