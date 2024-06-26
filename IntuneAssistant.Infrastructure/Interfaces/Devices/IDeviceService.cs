﻿using IntuneAssistant.Models;
using IntuneAssistant.Models.Devices;
using IntuneAssistant.Models.Options;
using Microsoft.Graph.Beta.Models;

namespace IntuneAssistant.Infrastructure.Interfaces.Devices;

public interface IDeviceService
{
    Task<List<DeviceModel>?> GetManagedDevicesListAsync(string? accessToken, string? filter);
    Task<List<ManagedDevice>?> GetNonCompliantManagedDevicesListAsync(string? accessToken);
    Task<List<ManagedDevice>?> GetFilteredDevicesListAsync(string? accessToken, DeviceFilterOptions? filterOptions);
    Task<List<OsBuildModel>> GetDevicesOsVersionsOverviewAsync(string? accessToken, DeviceFilterOptions? filterOptions);
    
    Task<List<ManagedDevice>?> GetDuplicateDevicesListAsync(string? accessToken, DeviceFilterOptions? filterOptions, ExportOptions? exportOptions);
    Task<List<ManagedDevice>?> RemoveDuplicateDevicesAsync(string? accessToken);
}
