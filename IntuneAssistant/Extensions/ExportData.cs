using System.Data;
using Spectre.Console;
using System.Text;
using IntuneAssistant.Constants;

namespace IntuneAssistant.Extensions;

public static class ExportData
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
}
