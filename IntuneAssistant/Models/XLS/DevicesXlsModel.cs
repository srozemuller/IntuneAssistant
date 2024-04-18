using IntuneAssistant.Helpers;
using IntuneAssistant.Models.Devices;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Models.XLS;

public class DevicesXlsModel
{
    public byte[] Global(DeviceModel[] data)
    {

        var wb = XlsHelper.CreateXls();
        var ws = wb.Worksheets.Add("Global Devices Overview");
        
        ws.Cell(1, 1).Value = "Device Name";
        ws.Cell(1, 2).Value = "User Name";

        for (int row = 1; row < data.Length; row++)
        {
            // The apostrophe is to force ClosedXML to treat the date as a string
            ws.Cell(row + 1, 1).Value = "'" + data[row].DeviceName;
            ws.Cell(row + 1, 2).Value = data[row].UserDisplayName;
        }

        MemoryStream XLSStream = new();
        wb.SaveAs(XLSStream);

        return XLSStream.ToArray();
    }
}