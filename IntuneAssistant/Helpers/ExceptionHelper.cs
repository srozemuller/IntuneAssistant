using System.Net;
using Newtonsoft.Json;

namespace IntuneAssistant.Helpers;

public class ExceptionHelper
{
    public class CustomException : Exception
    {
        public string Url { get; set; }
        public string StackTrace { get; set; }
        public string Message { get; set; }

        public CustomException(string message, string url, string stackTrace) 
        {
            Message = message;
            Url = url;
            StackTrace = stackTrace;
        }
    }
    public class CustomJsonException : JsonSerializationException
    {
        public string Url { get; set; }
        public string StackTrace { get; set; }
        public string Message { get; set; }

        public CustomJsonException(string message, string url, string stackTrace) 
        {
            Message = message;
            Url = url;
            StackTrace = stackTrace;
        }
    }
}