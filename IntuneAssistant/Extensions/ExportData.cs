using System.Globalization;
using System.Text;

namespace IntuneAssistant.Extensions;

public static class ExportData
{
    public static void ExportCsv<T>(List<T>? genericList, string fileName)
    {
        var sb = new StringBuilder();
        var basePath = AppDomain.CurrentDomain.BaseDirectory;
        var currentDate = DateTime.Now.ToString("yyyy-MM-ddHH:mm:ss").ToString(CultureInfo.CurrentUICulture);
        var finalPath = Path.Combine(basePath, fileName + currentDate +".csv");
        var header = "";
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
    }
}
