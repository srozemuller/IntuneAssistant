// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Infrastructure.Interfaces.Logging;
using IntuneAssistant.Infrastructure.Services;
using IntuneAssistant.Infrastructure.Services.LoggingServices;
using Microsoft.Identity.Web;

namespace IntuneAssistant.Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        private IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMicrosoftIdentityWebApiAuthentication(Configuration)
                    .EnableTokenAcquisitionToCallDownstreamApi()
                        .AddMicrosoftGraph(Configuration.GetSection("DownstreamApi"))
                        .AddInMemoryTokenCaches();

            services.AddScoped<IConfigurationPolicyService, ConfigurationPolicyService>();
            services.AddScoped<IApplicationInsightsService, CliApplicationInsightsService>();

            services.AddControllers();
            
            services.AddAuthorization();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                // Since IdentityModel version 5.2.1 (or since Microsoft.AspNetCore.Authentication.JwtBearer version 2.2.0),
                // PII hiding in log files is enabled by default for GDPR concerns.
                // For debugging/development purposes, one can enable additional detail in exceptions by setting IdentityModelEventSource.ShowPII to true.
                // Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }
            app.UseDefaultFiles();
            app.UseStaticFiles(); // For the wwwroot folder

            app.UseHttpsRedirection();
            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}