using IntuneAssistant.Helpers;

namespace IntuneAssistant.Models.XLS;

public class AssignmentsXlsModel
{
    public byte[] Global(CustomAssignmentsModel[] data)
    {

        var wb = XlsHelper.CreateXls();
        var ws = wb.Worksheets.Add("Global Assignments Overview");
        
        ws.Cell(1, 1).Value = "Resource Type";
        ws.Cell(1, 2).Value = "Resource Name";
        ws.Cell(1, 3).Value = "Resource Id";
        ws.Cell(1, 4).Value = "Assigned";
        ws.Cell(1, 5).Value = "Assignment Type";
        ws.Cell(1, 6).Value = "Entra ID Group";
        ws.Cell(1, 7).Value = "Filter Type";
        ws.Cell(1, 8).Value = "Filter Name";

        for (int row = 1; row < data.Length; row++)
        {
            // The apostrophe is to force ClosedXML to treat the date as a string
            ws.Cell(row + 1, 1).Value = "'" + data[row].ResourceType;
            ws.Cell(row + 1, 2).Value = data[row].ResourceName;
            ws.Cell(row + 1, 3).Value = data[row].AssignmentType;
            ws.Cell(row + 1, 4).Value = data[row].ResourceId;
            ws.Cell(row + 1, 5).Value = data[row].IsAssigned;
            ws.Cell(row + 1, 6).Value = data[row].TargetName;
            ws.Cell(row + 1, 7).Value = data[row].FilterType;
            ws.Cell(row + 1, 8).Value = data[row].FilterId;
        }

        MemoryStream XLSStream = new();
        wb.SaveAs(XLSStream);

        return XLSStream.ToArray();
    }
    
    public byte[] Group(CustomAssignmentsModel[] data)
    {
        var wb = XlsHelper.CreateXls();
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