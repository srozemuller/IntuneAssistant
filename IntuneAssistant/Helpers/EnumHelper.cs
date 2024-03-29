using System.ComponentModel;
using System.Reflection;

namespace IntuneAssistant.Helpers;

public static class EnumHelper
{
    public static string GetDescription<T>(this T enumValue) where T : IConvertible
    {
        if (enumValue is Enum)
        {
            FieldInfo fi = enumValue.GetType().GetField(enumValue.ToString());

            if (fi != null)
            {
                var attributes = (DescriptionAttribute[])fi.GetCustomAttributes(typeof(DescriptionAttribute), false);

                if (attributes.Length > 0)
                {
                    return attributes[0].Description;
                }
            }
        }

        return enumValue.ToString();
    }
}