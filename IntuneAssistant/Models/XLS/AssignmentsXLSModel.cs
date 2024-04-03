using ClosedXML.Excel;
namespace IntuneAssistant.Models.XLS;

public class AssignmentsXlsModel
{
    public byte[] Global(CustomAssignmentsModel[] data)
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
        
        var ws = wb.Worksheets.Add("Global Assignments Overview");
        
        
        ws.Cell(1, 1).Value = "Resource Type";
        ws.Cell(1, 2).Value = "Resource Name";
        ws.Cell(1, 3).Value = "Assignment Type";
        ws.Cell(1, 4).Value = "Filter Type";
        ws.Cell(1, 5).Value = "Filter Name";

        for (int row = 1; row < data.Length; row++)
        {
            // The apostrophe is to force ClosedXML to treat the date as a string
            ws.Cell(row + 1, 1).Value = "'" + data[row].ResourceType;
            ws.Cell(row + 1, 2).Value = data[row].ResourceName;
            ws.Cell(row + 1, 3).Value = data[row].AssignmentType;
            ws.Cell(row + 1, 4).Value = data[row].FilterType;
            ws.Cell(row + 1, 5).Value = data[row].FilterId;
        }

        MemoryStream XLSStream = new();
        wb.SaveAs(XLSStream);

        return XLSStream.ToArray();
    }
    
    public byte[] Group(CustomAssignmentsModel[] data)
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
        
        
        ws.Cell(1, 1).Value = "Resource Type";
        ws.Cell(1, 2).Value = "Resource Name";
        ws.Cell(1, 3).Value = "Resource Id";
        ws.Cell(1, 4).Value = "Target Id";
        ws.Cell(1, 5).Value = "Target Name";
        ws.Cell(1, 6).Value = "Filter Type";
        ws.Cell(1, 7).Value = "Filter Name";

        for (int row = 1; row < data.Length; row++)
        {
            // The apostrophe is to force ClosedXML to treat the date as a string
            ws.Cell(row + 1, 1).Value = "'" + data[row].ResourceType;
            ws.Cell(row + 1, 2).Value = data[row].ResourceName;
            ws.Cell(row + 1, 3).Value = data[row].ResourceId;
            ws.Cell(row + 1, 4).Value = data[row].TargetId;
            ws.Cell(row + 1, 5).Value = data[row].TargetName;
            ws.Cell(row + 1, 6).Value = data[row].FilterType;
            ws.Cell(row + 1, 7).Value = data[row].FilterId;
        }

        MemoryStream XLSStream = new();
        wb.SaveAs(XLSStream);

        return XLSStream.ToArray();
    }
}