using System.Text;
using IntuneAssistant.Extensions;
using IntuneAssistant.Infrastructure.Interfaces;
using IntuneAssistant.Models.Options;
using Microsoft.Graph;
using Microsoft.Graph.Beta.Models;
using Microsoft.Graph.Beta.Models.ODataErrors;

namespace IntuneAssistant.Infrastructure.Services;

public sealed class DeviceService : IDeviceService
{
    public async Task<List<ManagedDevice>?> GetManagedDevicesListAsync(string accessToken, string? filter)
    {
        try
        {
            // Create a new instance of GraphServiceClient with the DeviceCodeCredential and scopes
            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync();
            return result?.Value;
        }
        catch (ServiceException e)
        {
            Console.WriteLine(e.Message);
            throw;
        }
    }

    public async Task<List<ManagedDevice>?> GetNonCompliantManagedDevicesListAsync(string accessToken)
    {
        try
        {
            var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
            var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync();
            return result?.Value?.Where(device => device.ComplianceState is ComplianceState.Noncompliant).ToList();
        }
        catch (ODataError odataError)
        {
            Console.WriteLine(odataError.Error?.Code);
            Console.WriteLine(odataError.Error?.Message);
            throw;
        }
    }

    public async Task<List<ManagedDevice>?> GetFilteredDevices(string accessToken, DeviceFilterOptions? filterOptions)
    {
        filterOptions ??= new DeviceFilterOptions();

        var graphClient = new GraphClient(accessToken).GetAuthenticatedGraphClient();
        var sb = new StringBuilder();

        if (filterOptions.IncludeWindows)
        {
            sb.Append("operatingSystem eq 'Windows'");

            if (filterOptions.SelectNonCompliant)
                sb.Append(" and complianceState eq 'NonCompliant'");
        }

        if (filterOptions.IncludeMacOs)
        {
            if (sb.Length > 0)
                sb.Append(" or ");

            sb.Append("operatingSystem eq 'macOS'");

          //  if (filterOptions.SelectNonCompliant)
          //      sb.Append(" and complianceState eq 'nonCompliant'");
        }

        if (filterOptions.IncludeIos)
        {
            if (sb.Length > 0)
                sb.Append(" or ");

            sb.Append("operatingSystem eq 'iOS'");

            //if (filterOptions.SelectNonCompliant)
            //    sb.Append(" and complianceState eq 'nonCompliant'");
        }

        if (filterOptions.IncludeAndroid)
        {
            if (sb.Length > 0)
                sb.Append(" or ");

            sb.Append("operatingSystem eq 'Android'");

            //if (filterOptions.SelectNonCompliant)
            //    sb.Append(" and complianceState eq 'nonCompliant'");
        }

        if (filterOptions.SelectNonCompliant)
        {
            sb.Append(" complianceState eq 'nonCompliant'");
        }
        var odataFilter = sb.ToString();
        var filter = string.IsNullOrWhiteSpace(odataFilter) ? null : odataFilter;

        var results = new List<ManagedDevice>();
        Console.WriteLine(filter);

        try
        {
            var result = await graphClient.DeviceManagement.ManagedDevices.GetAsync(requestConfiguration =>
            {
                requestConfiguration.QueryParameters.Filter = filter;
            });

            if (result?.Value != null)
                results.AddRange(result.Value);
        }
        catch (ODataError ex)
        {
            Console.WriteLine("An exception has occurred while fetching devices: " + ex.ToMessage());
            return null;
        }

        return results;
    }
}
