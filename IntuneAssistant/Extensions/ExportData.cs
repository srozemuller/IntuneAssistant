using System.Text;
using IntuneAssistant.Constants;
using IntuneAssistant.Models;
using IntuneAssistant.Models.XLS;
using Microsoft.Graph.Beta.Models;
using Microsoft.JSInterop;

namespace IntuneAssistant.Extensions;

public class ExportData
{
    public static string ExportCsv<T>(List<T>? genericList, string fileName)
    {
        var sb = new StringBuilder();
        var basePath = AppDomain.CurrentDomain.BaseDirectory;
        var currentDate = DateTime.Now.ToString("yyyy-MM-dd_HHmmss");
        var finalPath = Path.Combine(basePath, fileName + currentDate +".csv");
        var header = $"Made by {Branding.LegalName}";
        var info = typeof(T).GetProperties();
        if (!File.Exists(finalPath))
        {
            var file = File.Create(finalPath);
            file.Close();
            foreach (var prop in typeof(T).GetProperties())
            {
                header += prop.Name + "; ";
            }

            header = header.Substring(0, header.Length - 2);
            sb.AppendLine(header);
            TextWriter sw = new StreamWriter(finalPath, true);
            sw.Write(sb.ToString());
            sw.Close();
        }

        foreach (var obj in genericList)
        {
            sb = new StringBuilder();
            var line = "";
            foreach (var prop in info)
            {
                line += prop.GetValue(obj, null) + "; ";
            }

            line = line.Substring(0, line.Length - 2);
            sb.AppendLine(line);
            TextWriter sw = new StreamWriter(finalPath, true);
            sw.Write(sb.ToString());
            sw.Close();
        }
        return finalPath;
    }
    
    public async Task GetGenerateAssignmentsOverviewXlsAsync(IJSRuntime? js, 
        List<CustomAssignmentsModel> data, 
        string filename = "export.xlsx")
    {
        var assignments = new AssignmentsXlsModel();
        var XLSStream = assignments.Global(data.ToArray());
        
        if (js is null) return;
        await js.InvokeVoidAsync("BlazorDownloadFile", filename, XLSStream);
    }
    
    public async Task GenerateDevicesOverviewXlsAsync(IJSRuntime? js, 
        List<ManagedDevice> data, 
        string filename = "export.xlsx")
    {
        var devices = new DevicesXlsModel();
        var XLSStream = devices.Global(data.ToArray());
        
        if (js is null) return;
        await js.InvokeVoidAsync("BlazorDownloadFile", filename, XLSStream);
    }
    
    public async Task GenerateGroupAssignmentsOverviewXlsAsync(IJSRuntime js, 
        List<CustomAssignmentsModel> data, 
        string filename = "export.xlsx")
    {
        var assignments = new AssignmentsXlsModel();
        var XLSStream = assignments.Group(data.ToArray());

        await js.InvokeVoidAsync("BlazorDownloadFile", filename, XLSStream);
    }
    
    public async Task GeneratePolicySettingsOverviewXlsAsync(IJSRuntime js, 
        List<CustomPolicySettingsModel> data, 
        string filename = "export.xlsx")
    {
        var assignments = new PolicySettingsXlsModel();
        var XLSStream = assignments.Global(data.ToArray());

        await js.InvokeVoidAsync("BlazorDownloadFile", filename, XLSStream);
    }
}
