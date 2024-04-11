using ClosedXML.Excel;
namespace IntuneAssistant.Models.XLS;

public class PolicySettingsXlsModel
{
    
    public byte[] Global(CustomPolicySettingsModel[] data)
    {
        var wb = new XLWorkbook();
        wb.Properties.Author = "the Author";
        wb.Properties.Title = "the Title";
        wb.Properties.Subject = "the Subject";
        wb.Properties.Category = "the Category";
        wb.Properties.Keywords = "the Keywords";
        wb.Properties.Comments = "the Comments";
        wb.Properties.Status = "the Status";
        wb.Properties.LastModifiedBy = "the Last Modified By";
        wb.Properties.Company = "the Company";
        wb.Properties.Manager = "the Manager";
        wb.ShowRowColHeaders = true;
        
        var ws = wb.Worksheets.Add("Group Assignments Overview");
        
        
        ws.Cell(1, 1).Value = "Policy Name";
        ws.Cell(1, 2).Value = "Setting Name";
        ws.Cell(1, 3).Value = "Setting Value";
        ws.Cell(1, 4).Value = "Child Settings";
        ws.Cell(1, 5).Value = "Target Name";
        

        for (int row = 1; row < data.Length; row++)
        {
            // The apostrophe is to force ClosedXML to treat the date as a string
            ws.Cell(row + 1, 1).Value = "'" + data[row].PolicyName;
            ws.Cell(row + 1, 2).Value = data[row].SettingName;
            ws.Cell(row + 1, 3).Value = data[row].SettingValue;
            ws.Cell(row + 1, 4).Value = data[row].ChildSettingInfo.Select(n => n.Name).FirstOrDefault()?.ToString();
            ws.Cell(row + 1, 5).Value = string.Join("\n", data[row].ChildSettingInfo.Select(n => n.Value));
        }

        MemoryStream XLSStream = new();
        wb.SaveAs(XLSStream);

        return XLSStream.ToArray();
    }
}