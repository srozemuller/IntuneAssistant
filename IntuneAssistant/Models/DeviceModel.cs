using Microsoft.Graph.Beta.Models;
namespace IntuneAssistant.Models;

public sealed record DeviceModel
{
    public Guid Id { get; init; } = Guid.Empty;
    public string DeviceName { get; init; } = string.Empty;
    public string ComplianceState { get; init; } = string.Empty;
    public DateTimeOffset LastSyncDateTime { get; init; } = DateTime.Now;
    public string OsVersion { get; init; } = String.Empty;
    public string SerialNumber { get; set; } = String.Empty;
    public string OperatingSystem { get; set; } = String.Empty;
}

public static class DeviceModelExtensions
{
    public static DeviceModel ToDeviceModel(this ManagedDevice device)
    {
        var isParsed = Guid.TryParse(device.Id, out var parsedId);
        return new DeviceModel
        {
            Id = isParsed ? parsedId : Guid.Empty,
            DeviceName = device.DeviceName,
            ComplianceState = device.ComplianceState.ToString(),
            LastSyncDateTime = device.LastSyncDateTime.GetValueOrDefault(),
            OsVersion = device.OsVersion,
            SerialNumber = device.SerialNumber,
            OperatingSystem = device.OperatingSystem
        };
    }
}