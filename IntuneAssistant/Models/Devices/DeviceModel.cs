using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Models.Devices;

public class DeviceModel
{
    public Guid Id { get; init; } = Guid.Empty;
    public string DeviceName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTimeOffset LastSyncDateTime { get; init; } = DateTime.Now;
    public string OsVersion { get; init; } = String.Empty;
    public string ComplianceState { get; init; } = string.Empty;
    public string UserDisplayName { get; init; } = string.Empty;
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
            Status = device.ComplianceState.ToString(),
            LastSyncDateTime = device.LastSyncDateTime.GetValueOrDefault(),
            OsVersion = device.OsVersion,
            UserDisplayName = device.UserDisplayName,
            ComplianceState = device.ComplianceState.ToString()
        };
    }
}