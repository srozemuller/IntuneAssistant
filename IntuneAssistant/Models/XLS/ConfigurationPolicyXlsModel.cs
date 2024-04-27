using ClosedXML.Excel;
using IntuneAssistant.Helpers;

namespace IntuneAssistant.Models.XLS;

public class ConfigurationPolicyXlsModel
{
    public byte[] Global(ConfigurationPolicyModel policy, List<CustomAssignmentsModel> assignments,
        List<CustomPolicySettingsModel> settings)
    {
        var wb = XlsHelper.CreateXls();
        var ws = wb.Worksheets.Add("Configuration Policy Overview");

        ws.Cell(1, 1).Value = "Policy Name";
        ws.Cell(1, 2).Value = "Description";


        // The apostrophe is to force ClosedXML to treat the date as a string
        ws.Cell(2, 1).Value = "'" + policy.Name;
        ws.Cell(2, 2).Value = policy.Description;
        
        ws.Cell(4, 1).Value = "Assignment Type";
        ws.Cell(4, 2).Value = "Entra ID Group";
        ws.Cell(4, 3).Value = "Filter Name";
        ws.Cell(4, 4).Value = "Filter Type";

        var row = 5;
        foreach (var assignment in assignments)
        {
            ws.Cell(row, 1).Value = "'" + assignment.AssignmentType;
            ws.Cell(row, 2).Value = assignment.TargetName;
            ws.Cell(row, 3).Value = assignment.FilterId;
            ws.Cell(row, 4).Value = assignment.FilterType;
            row++;
        }

        row += 2;
        
        ws.Cell(row, 1).Value = "Setting";
        ws.Cell(row, 2).Value = "Value";
        ws.Cell(row, 3).Value = "Sub settings";
        row++;
        
        foreach (var setting in settings)
        {
            ws.Cell(row, 1).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
            ws.Cell(row, 1).Value = "'" + setting.SettingName;
            ws.Cell(row, 2).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;

            ws.Cell(row, 2).Value = setting.SettingValue;
            // Concatenate the child settings into a single string
            var childSettings = string.Join("", setting.ChildSettingInfo.Select(c => c.ToString()));
            ws.Cell(row, 3).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;

            ws.Cell(row, 3).Value = childSettings;
            row++;
        }


        
        MemoryStream XLSStream = new();
        wb.SaveAs(XLSStream);

        return XLSStream.ToArray();
    }
}