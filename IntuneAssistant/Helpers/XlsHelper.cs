using ClosedXML.Excel;
using IntuneAssistant.Constants;

namespace IntuneAssistant.Helpers;

public static class XlsHelper
{
    public static XLWorkbook CreateXls()
    {
        var wb = new XLWorkbook();
        wb.Properties.Author = ExcelConfiguration.AUTHOR;
        wb.Properties.Title = ExcelConfiguration.TITLE;
        wb.ShowRowColHeaders = true;
        return wb;
    }
}