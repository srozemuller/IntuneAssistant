using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Interfaces.Logging;
using IntuneAssistant.Infrastructure.Services;
using IntuneAssistant.Infrastructure.Services.LoggingServices;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddScoped<IConfigurationPolicyService, ConfigurationPolicyService>();
builder.Services.AddScoped<IApplicationInsightsService, CliApplicationInsightsService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Audience = "api://b0533a36-0d90-4634-9f08-99a50b78b477";
        options.Authority = "https://login.microsoftonline.com/common";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false // TODO: Validate that only allowed tenants can access API
        };
    });

builder.Services.AddAuthorization();

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

var scopeRequiredByApi = app.Configuration["AzureAd:Scopes"] ?? "";
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", (HttpContext httpContext) =>
    {
        //httpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

        var forecast = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
            .ToArray();
        return forecast;
    })
    .WithName("GetWeatherForecast")
    .WithOpenApi()
    .RequireAuthorization();

app.UseAuthentication();

app.UseRouting();
app.MapControllers();
app.UseAuthorization();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}